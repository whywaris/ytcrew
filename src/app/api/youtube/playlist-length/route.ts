import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  extractYouTubePlaylistId,
  fetchYouTubePlaylistLength,
  YouTubeApiError,
  YOUTUBE_PLAYLIST_REGEX,
} from "@/lib/youtube";

const querySchema = z.object({
  url: z
    .string()
    .min(1, "Please provide a YouTube playlist URL or Playlist ID.")
    .refine(
      (val) => {
        const trimmed = val.trim();
        return (
          YOUTUBE_PLAYLIST_REGEX.test(trimmed) ||
          (/^[a-zA-Z0-9_-]{10,64}$/.test(trimmed) && !trimmed.includes("."))
        );
      },
      {
        message: "Invalid YouTube playlist URL or Playlist ID format.",
      }
    ),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url") || searchParams.get("playlistId") || searchParams.get("id");

    if (!urlParam) {
      return NextResponse.json(
        { error: "Please provide a YouTube playlist URL or Playlist ID." },
        { status: 400 }
      );
    }

    const validation = querySchema.safeParse({ url: urlParam });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid playlist input." },
        { status: 400 }
      );
    }

    const playlistId = extractYouTubePlaylistId(urlParam);
    if (!playlistId) {
      return NextResponse.json(
        { error: "Could not extract a valid YouTube playlist ID from the provided input." },
        { status: 400 }
      );
    }

    const result = await fetchYouTubePlaylistLength(playlistId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: error.isQuotaError },
        { status: error.statusCode }
      );
    }

    console.error("[API/YouTube/playlist-length] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while calculating playlist length." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = body.url || body.playlistId || body.id;

    if (!input) {
      return NextResponse.json(
        { error: "Please provide a YouTube playlist URL or Playlist ID in the request body." },
        { status: 400 }
      );
    }

    const validation = querySchema.safeParse({ url: input });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid playlist input." },
        { status: 400 }
      );
    }

    const playlistId = extractYouTubePlaylistId(input);
    if (!playlistId) {
      return NextResponse.json(
        { error: "Could not extract a valid YouTube playlist ID from the provided input." },
        { status: 400 }
      );
    }

    const result = await fetchYouTubePlaylistLength(playlistId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: error.isQuotaError },
        { status: error.statusCode }
      );
    }

    console.error("[API/YouTube/playlist-length] POST Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while calculating playlist length." },
      { status: 500 }
    );
  }
}
