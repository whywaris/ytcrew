import { getCachedOrFetch } from "@/lib/redis";

/**
 * Common YouTube Video ID extraction regex:
 * Supports youtube.com/watch?v=, youtu.be/, shorts/, embed/, etc.
 */
export const YOUTUBE_VIDEO_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

/**
 * Helper to extract an 11-character YouTube video ID.
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(YOUTUBE_VIDEO_REGEX);
  return match ? match[1] : null;
}

/**
 * Standard YouTube API Error wrapper
 */
export class YouTubeApiError extends Error {
  statusCode: number;
  isQuotaError: boolean;

  constructor(message: string, statusCode: number = 500, isQuotaError: boolean = false) {
    super(message);
    this.name = "YouTubeApiError";
    this.statusCode = statusCode;
    this.isQuotaError = isQuotaError;
  }
}

/**
 * Standard YouTube Video Category mapping fallback (US / global standard IDs)
 */
export const DEFAULT_YOUTUBE_CATEGORIES: Record<string, string> = {
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "18": "Short Movies",
  "19": "Travel & Events",
  "20": "Gaming",
  "21": "Videoblogging",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
  "30": "Movies",
  "31": "Anime/Animation",
  "32": "Action/Adventure",
  "33": "Classics",
  "34": "Comedy",
  "35": "Documentary",
  "36": "Drama",
  "37": "Family",
  "38": "Foreign",
  "39": "Horror",
  "40": "Sci-Fi/Fantasy",
  "41": "Thriller",
  "42": "Shorts",
  "43": "Shows",
  "44": "Trailers",
};

/**
 * Fetches YouTube video category list from API with Redis caching (24h TTL)
 */
export async function getYouTubeCategories(regionCode: string = "US"): Promise<Record<string, string>> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return DEFAULT_YOUTUBE_CATEGORIES;
  }

  const cacheKey = `yt:categories:${regionCode}`;
  return getCachedOrFetch(cacheKey, 86400, async () => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=${regionCode}&key=${apiKey}`
      );
      if (!res.ok) {
        return DEFAULT_YOUTUBE_CATEGORIES;
      }
      const data = await res.json();
      const map: Record<string, string> = { ...DEFAULT_YOUTUBE_CATEGORIES };
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.id && item.snippet?.title) {
            map[item.id] = item.snippet.title;
          }
        }
      }
      return map;
    } catch {
      return DEFAULT_YOUTUBE_CATEGORIES;
    }
  });
}

export interface YouTubeVideoDetails {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  publishedAt: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
}

/**
 * Fetches video details (snippet) from YouTube Data API v3 with Redis caching (1h TTL)
 */
export async function fetchYouTubeVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YouTubeApiError("YouTube API key is not configured on the server.", 500);
  }

  const cacheKey = `yt:video:${videoId}`;
  return getCachedOrFetch<YouTubeVideoDetails>(cacheKey, 3600, async () => {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(
      videoId
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      const errorReason = data?.error?.errors?.[0]?.reason || "";
      const errorMessage = data?.error?.message || "YouTube API error occurred.";
      const isQuota = errorReason === "quotaExceeded" || errorMessage.toLowerCase().includes("quota");
      throw new YouTubeApiError(
        isQuota
          ? "YouTube API daily quota exceeded. Please try again later."
          : errorMessage,
        isQuota ? 429 : res.status,
        isQuota
      );
    }

    if (!data.items || data.items.length === 0) {
      throw new YouTubeApiError("Video not found or is set to private.", 404);
    }

    const item = data.items[0];
    const snippet = item.snippet || {};
    const categoryId = snippet.categoryId || "";

    const categories = await getYouTubeCategories("US");
    const categoryName = categories[categoryId] || (categoryId ? `Category #${categoryId}` : "Unknown");

    return {
      id: item.id,
      title: snippet.title || "",
      description: snippet.description || "",
      channelId: snippet.channelId || "",
      channelTitle: snippet.channelTitle || "",
      categoryId,
      categoryName,
      tags: Array.isArray(snippet.tags) ? snippet.tags : [],
      publishedAt: snippet.publishedAt || "",
      thumbnails: snippet.thumbnails || {},
    };
  });
}

export interface YouTubeCommentItem {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl?: string;
  textDisplay: string;
  textOriginal: string;
  likeCount: number;
  publishedAt: string;
  updatedAt?: string;
  parentId?: string;
}

/**
 * Fetches comment threads for a video with Redis caching (1h TTL)
 * Supports pagination up to maxPages (default 5 pages = max ~500 comments)
 */
export async function fetchYouTubeComments(
  videoId: string,
  options: {
    order?: "time" | "relevance";
    maxPages?: number;
    includeReplies?: boolean;
  } = {}
): Promise<{ comments: YouTubeCommentItem[]; totalFetched: number; isPartial: boolean }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YouTubeApiError("YouTube API key is not configured on the server.", 500);
  }

  const order = options.order || "time";
  const maxPages = Math.min(options.maxPages || 5, 10);
  const includeReplies = options.includeReplies ?? false;

  const cacheKey = `yt:comments:${videoId}:${order}:${includeReplies}:${maxPages}`;
  return getCachedOrFetch(cacheKey, 3600, async () => {
    const comments: YouTubeCommentItem[] = [];
    let pageToken = "";
    let pagesFetched = 0;
    let hasMore = true;

    while (hasMore && pagesFetched < maxPages) {
      let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${encodeURIComponent(
        videoId
      )}&order=${order}&maxResults=100&key=${apiKey}`;

      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        const errorReason = data?.error?.errors?.[0]?.reason || "";
        const errorMessage = data?.error?.message || "Error fetching YouTube comments.";
        const isQuota = errorReason === "quotaExceeded" || errorMessage.toLowerCase().includes("quota");
        const commentsDisabled = errorReason === "commentsDisabled";

        if (commentsDisabled) {
          throw new YouTubeApiError("Comments are disabled for this YouTube video.", 400);
        }

        throw new YouTubeApiError(
          isQuota ? "YouTube API daily quota exceeded. Please try again later." : errorMessage,
          isQuota ? 429 : res.status,
          isQuota
        );
      }

      const items = data.items || [];
      for (const item of items) {
        const topSnippet = item.snippet?.topLevelComment?.snippet;
        if (topSnippet) {
          comments.push({
            id: item.snippet.topLevelComment.id || item.id,
            authorDisplayName: topSnippet.authorDisplayName || "Anonymous",
            authorProfileImageUrl: topSnippet.authorProfileImageUrl || "",
            authorChannelUrl: topSnippet.authorChannelUrl,
            textDisplay: topSnippet.textDisplay || "",
            textOriginal: topSnippet.textOriginal || topSnippet.textDisplay || "",
            likeCount: topSnippet.likeCount || 0,
            publishedAt: topSnippet.publishedAt || "",
            updatedAt: topSnippet.updatedAt,
          });
        }

        if (includeReplies && item.replies?.comments) {
          for (const reply of item.replies.comments) {
            const replySnippet = reply.snippet;
            if (replySnippet) {
              comments.push({
                id: reply.id,
                parentId: item.id,
                authorDisplayName: replySnippet.authorDisplayName || "Anonymous",
                authorProfileImageUrl: replySnippet.authorProfileImageUrl || "",
                authorChannelUrl: replySnippet.authorChannelUrl,
                textDisplay: replySnippet.textDisplay || "",
                textOriginal: replySnippet.textOriginal || replySnippet.textDisplay || "",
                likeCount: replySnippet.likeCount || 0,
                publishedAt: replySnippet.publishedAt || "",
                updatedAt: replySnippet.updatedAt,
              });
            }
          }
        }
      }

      pagesFetched++;
      pageToken = data.nextPageToken || "";
      if (!pageToken) {
        hasMore = false;
      }
    }

    return {
      comments,
      totalFetched: comments.length,
      isPartial: hasMore,
    };
  });
}

/**
 * Finds the earliest available comment by paginating backwards in time order
 */
export async function fetchFirstYouTubeComment(videoId: string): Promise<YouTubeCommentItem | null> {
  const result = await fetchYouTubeComments(videoId, {
    order: "time",
    maxPages: 10,
    includeReplies: false,
  });

  if (!result.comments || result.comments.length === 0) {
    return null;
  }

  // Sort by publishedAt ascending to find the earliest
  const sorted = [...result.comments].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  return sorted[0] || null;
}

export interface YouTubeChannelResolution {
  channelId: string;
  title: string;
  customUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Resolves a channel handle, custom URL, or ID to a verified Channel ID
 */
export async function resolveYouTubeChannelId(input: string): Promise<YouTubeChannelResolution> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YouTubeApiError("YouTube API key is not configured on the server.", 500);
  }

  const trimmed = input.trim();

  // If already a standard YouTube Channel ID (starts with UC and is 24 chars)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return {
      channelId: trimmed,
      title: "YouTube Channel",
    };
  }

  // Extract handle (@username) or channel ID from URL or input
  let handle = "";
  let extractedChannelId = "";

  const channelIdMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  if (channelIdMatch) {
    extractedChannelId = channelIdMatch[1];
  }

  const handleMatch = trimmed.match(/(?:youtube\.com\/@|^@?)([\w.-]+)/);
  if (handleMatch && !extractedChannelId) {
    handle = handleMatch[1].startsWith("@") ? handleMatch[1] : `@${handleMatch[1]}`;
  }

  if (extractedChannelId) {
    return {
      channelId: extractedChannelId,
      title: "YouTube Channel",
    };
  }

  if (!handle) {
    throw new YouTubeApiError("Invalid YouTube channel URL, handle, or Channel ID.", 400);
  }

  const cacheKey = `yt:channel:${handle.toLowerCase()}`;
  return getCachedOrFetch(cacheKey, 86400, async () => {
    // 1. Try channels.list with forHandle
    const cleanHandle = handle.replace(/^@/, "");
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(
      cleanHandle
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      const isQuota = data?.error?.errors?.[0]?.reason === "quotaExceeded";
      throw new YouTubeApiError(
        isQuota ? "YouTube API daily quota exceeded. Please try again later." : "Channel lookup failed.",
        isQuota ? 429 : res.status,
        isQuota
      );
    }

    if (data.items && data.items.length > 0) {
      const ch = data.items[0];
      return {
        channelId: ch.id,
        title: ch.snippet?.title || cleanHandle,
        customUrl: ch.snippet?.customUrl,
        thumbnailUrl: ch.snippet?.thumbnails?.default?.url || ch.snippet?.thumbnails?.medium?.url,
      };
    }

    // 2. Fallback search by username / query
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
      cleanHandle
    )}&maxResults=1&key=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchRes.ok && searchData.items && searchData.items.length > 0) {
      const item = searchData.items[0];
      return {
        channelId: item.snippet?.channelId || item.id?.channelId,
        title: item.snippet?.title || cleanHandle,
        thumbnailUrl: item.snippet?.thumbnails?.default?.url,
      };
    }

    throw new YouTubeApiError(`Could not resolve YouTube channel for "${handle}".`, 404);
  });
}

/**
 * Common YouTube Playlist ID extraction regex:
 * Supports youtube.com/playlist?list=, watch?v=...&list=, youtu.be/...&list=, etc.
 */
export const YOUTUBE_PLAYLIST_REGEX =
  /(?:[?&]list=)([a-zA-Z0-9_-]+)/;

/**
 * Helper to extract a YouTube Playlist ID from a URL or raw ID string.
 */
export function extractYouTubePlaylistId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already a raw playlist ID (e.g. starts with PL, UU, FL, RD, OLAK5uy_, etc. typically 10 to 64 chars)
  if (/^[a-zA-Z0-9_-]{10,64}$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }

  const match = trimmed.match(YOUTUBE_PLAYLIST_REGEX);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Parse an ISO 8601 duration string (e.g. PT1H2M33S, PT15M, PT45S, P1DT2H) into total seconds.
 */
export function parseYouTubeDuration(duration: string): number {
  if (!duration) return 0;
  const regex = /P(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+(?:\.[0-9]+)?)S)?)?/;
  const matches = duration.match(regex);
  if (!matches) return 0;

  const days = parseInt(matches[1] || "0", 10);
  const hours = parseInt(matches[2] || "0", 10);
  const minutes = parseInt(matches[3] || "0", 10);
  const seconds = parseFloat(matches[4] || "0");

  return days * 86400 + hours * 3600 + minutes * 60 + Math.floor(seconds);
}

/**
 * Format total seconds into a readable string like "2 hours 15 minutes 30 seconds"
 */
export function formatDurationLong(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 seconds";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);

  return parts.join(" ");
}

/**
 * Format total seconds into a short readable string like "2h 15m 30s" or "15m 30s"
 */
export function formatDurationShort(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0s";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export interface SpeedBreakdownItem {
  speed: number;
  label: string;
  totalSeconds: number;
  formatted: string;
  formattedShort: string;
  timeSavedFormatted: string;
}

export interface YouTubePlaylistLengthResult {
  playlistId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl?: string;
  totalVideos: number;
  availableVideos: number;
  unavailableVideos: number;
  totalSeconds: number;
  formattedDuration: string;
  formattedDurationShort: string;
  totalMinutes: number;
  totalHours: number;
  averageVideoDurationSeconds: number;
  formattedAverageDuration: string;
  isCapped: boolean;
  capLimit: number;
  speedBreakdown: SpeedBreakdownItem[];
}

/**
 * Calculates the total length of a YouTube playlist without caching (fresh every time).
 * Paginates through playlistItems up to maxPages (default 10 pages = 500 items max).
 */
export async function fetchYouTubePlaylistLength(
  playlistId: string,
  maxPages: number = 10
): Promise<YouTubePlaylistLengthResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YouTubeApiError("YouTube API key is not configured on the server.", 500);
  }

  const cleanPlaylistId = playlistId.trim();

  // 1. Fetch playlist metadata (title, channel, thumbnails)
  let playlistTitle = "YouTube Playlist";
  let channelTitle = "";
  let channelId = "";
  let thumbnailUrl = "";

  try {
    const metaRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${encodeURIComponent(
        cleanPlaylistId
      )}&key=${apiKey}`
    );
    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      const errorReason = metaData?.error?.errors?.[0]?.reason || "";
      const errorMessage = metaData?.error?.message || "Error fetching playlist details.";
      const isQuota = errorReason === "quotaExceeded" || errorMessage.toLowerCase().includes("quota");
      throw new YouTubeApiError(
        isQuota ? "YouTube API daily quota exceeded. Please try again later." : errorMessage,
        isQuota ? 429 : metaRes.status,
        isQuota
      );
    }

    if (!metaData.items || metaData.items.length === 0) {
      throw new YouTubeApiError("Playlist not found or is set to private.", 404);
    }

    const snippet = metaData.items[0].snippet || {};
    playlistTitle = snippet.title || "YouTube Playlist";
    channelTitle = snippet.channelTitle || "";
    channelId = snippet.channelId || "";
    thumbnailUrl =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      "";
  } catch (err) {
    if (err instanceof YouTubeApiError) throw err;
    throw new YouTubeApiError("Failed to verify YouTube playlist ID.", 400);
  }

  // 2. Fetch all playlist items (video IDs) with pagination up to maxPages (max 500)
  const videoIds: string[] = [];
  let pageToken = "";
  let pagesFetched = 0;
  let hasMore = true;
  let isCapped = false;
  const maxAllowedPages = Math.min(maxPages, 10);
  const capLimit = maxAllowedPages * 50;

  while (hasMore && pagesFetched < maxAllowedPages) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(
      cleanPlaylistId
    )}&maxResults=50&key=${apiKey}`;

    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      const errorReason = data?.error?.errors?.[0]?.reason || "";
      const errorMessage = data?.error?.message || "Error fetching playlist items.";
      const isQuota = errorReason === "quotaExceeded" || errorMessage.toLowerCase().includes("quota");
      throw new YouTubeApiError(
        isQuota ? "YouTube API daily quota exceeded. Please try again later." : errorMessage,
        isQuota ? 429 : res.status,
        isQuota
      );
    }

    const items = data.items || [];
    for (const item of items) {
      const vId = item.contentDetails?.videoId;
      if (vId) {
        videoIds.push(vId);
      }
    }

    pagesFetched++;
    pageToken = data.nextPageToken || "";
    if (!pageToken) {
      hasMore = false;
    }
  }

  if (hasMore && pagesFetched >= maxAllowedPages) {
    isCapped = true;
  }

  if (videoIds.length === 0) {
    return {
      playlistId: cleanPlaylistId,
      title: playlistTitle,
      channelTitle,
      channelId,
      thumbnailUrl,
      totalVideos: 0,
      availableVideos: 0,
      unavailableVideos: 0,
      totalSeconds: 0,
      formattedDuration: "0 seconds",
      formattedDurationShort: "0s",
      totalMinutes: 0,
      totalHours: 0,
      averageVideoDurationSeconds: 0,
      formattedAverageDuration: "0 seconds",
      isCapped: false,
      capLimit,
      speedBreakdown: [
        { speed: 1, label: "1.0x (Normal)", totalSeconds: 0, formatted: "0 seconds", formattedShort: "0s", timeSavedFormatted: "0s" },
        { speed: 1.25, label: "1.25x", totalSeconds: 0, formatted: "0 seconds", formattedShort: "0s", timeSavedFormatted: "0s" },
        { speed: 1.5, label: "1.5x", totalSeconds: 0, formatted: "0 seconds", formattedShort: "0s", timeSavedFormatted: "0s" },
        { speed: 1.75, label: "1.75x", totalSeconds: 0, formatted: "0 seconds", formattedShort: "0s", timeSavedFormatted: "0s" },
        { speed: 2, label: "2.0x (Double Speed)", totalSeconds: 0, formatted: "0 seconds", formattedShort: "0s", timeSavedFormatted: "0s" },
      ],
    };
  }

  // 3. Batch video IDs in groups of 50 to fetch contentDetails.duration
  let totalSeconds = 0;
  let returnedVideoCount = 0;
  const batchSize = 50;

  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const vRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(
        batch.join(",")
      )}&key=${apiKey}`
    );
    const vData = await vRes.json();

    if (!vRes.ok) {
      const errorReason = vData?.error?.errors?.[0]?.reason || "";
      const errorMessage = vData?.error?.message || "Error fetching video duration details.";
      const isQuota = errorReason === "quotaExceeded" || errorMessage.toLowerCase().includes("quota");
      throw new YouTubeApiError(
        isQuota ? "YouTube API daily quota exceeded. Please try again later." : errorMessage,
        isQuota ? 429 : vRes.status,
        isQuota
      );
    }

    const items = vData.items || [];
    for (const item of items) {
      const durationStr = item.contentDetails?.duration;
      if (durationStr) {
        const sec = parseYouTubeDuration(durationStr);
        totalSeconds += sec;
        returnedVideoCount++;
      }
    }
  }

  const totalVideosInPlaylist = videoIds.length;
  const availableVideos = returnedVideoCount;
  const unavailableVideos = Math.max(0, totalVideosInPlaylist - availableVideos);

  const averageVideoDurationSeconds =
    availableVideos > 0 ? Math.round(totalSeconds / availableVideos) : 0;

  const totalMinutes = parseFloat((totalSeconds / 60).toFixed(2));
  const totalHours = parseFloat((totalSeconds / 3600).toFixed(2));

  // Speed calculations
  const speeds = [
    { speed: 1.0, label: "1.0x (Normal)" },
    { speed: 1.25, label: "1.25x" },
    { speed: 1.5, label: "1.5x" },
    { speed: 1.75, label: "1.75x" },
    { speed: 2.0, label: "2.0x (Double Speed)" },
  ];

  const speedBreakdown: SpeedBreakdownItem[] = speeds.map(({ speed, label }) => {
    const speedSeconds = Math.round(totalSeconds / speed);
    const savedSeconds = Math.max(0, totalSeconds - speedSeconds);
    return {
      speed,
      label,
      totalSeconds: speedSeconds,
      formatted: formatDurationLong(speedSeconds),
      formattedShort: formatDurationShort(speedSeconds),
      timeSavedFormatted: speed === 1.0 ? "0s" : formatDurationShort(savedSeconds),
    };
  });

  return {
    playlistId: cleanPlaylistId,
    title: playlistTitle,
    channelTitle,
    channelId,
    thumbnailUrl,
    totalVideos: totalVideosInPlaylist,
    availableVideos,
    unavailableVideos,
    totalSeconds,
    formattedDuration: formatDurationLong(totalSeconds),
    formattedDurationShort: formatDurationShort(totalSeconds),
    totalMinutes,
    totalHours,
    averageVideoDurationSeconds,
    formattedAverageDuration: formatDurationLong(averageVideoDurationSeconds),
    isCapped,
    capLimit,
    speedBreakdown,
  };
}

