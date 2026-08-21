"use client";

import * as React from "react";
import { z } from "zod";
import {
  MessageSquare,
  Search,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  ThumbsUp,
  Clock,
  User,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouTubeCommentItem, YouTubeVideoDetails } from "@/lib/youtube";

const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

const formSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video link.")
    .refine(
      (val) => {
        const trimmed = val.trim();
        return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
      },
      "Please enter a valid YouTube video URL or ID."
    ),
});

export function YouTubeCommentFinder() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);
  const [video, setVideo] = React.useState<YouTubeVideoDetails | null>(null);
  const [comment, setComment] = React.useState<YouTubeCommentItem | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsQuotaError(false);

    const validation = formSchema.safeParse({ url });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid URL");
      return;
    }

    setLoading(true);
    setComment(null);
    setVideo(null);

    try {
      const res = await fetch(`/api/youtube/first-comment?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to find the first comment.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      setVideo(data.video);
      setComment(data.firstComment);
      if (!data.firstComment) {
        setError("No comments found on this video or comments are turned off.");
      }
    } catch {
      setError("Network error: Could not connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const thumbnail =
    video?.thumbnails.maxres?.url ||
    video?.thumbnails.high?.url ||
    video?.thumbnails.medium?.url;

  return (
    <div className="w-full space-y-6">
      {/* Search Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Find First YouTube Comment
          </CardTitle>
          <CardDescription>
            Discover the very first comment left on any YouTube video using YouTube Data API time indexing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background/80 border-input h-11 text-sm focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="h-11 px-6 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 cursor-pointer shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find First Comment
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div
                className={`p-3.5 rounded-lg border text-sm flex items-start gap-2.5 ${
                  isQuotaError
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{isQuotaError ? "API Quota Limit" : "Notice"}</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {comment && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">Oldest Discovered Comment</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(comment.textOriginal || comment.textDisplay)}
                className="h-8 text-xs cursor-pointer border-border hover:border-primary/50"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                    Copied Comment
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Text
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Styled YouTube Comment Card */}
            <div className="p-5 sm:p-6 rounded-xl bg-background/80 border border-border/80 space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Author Avatar */}
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-primary/20 shrink-0 border border-border">
                  {comment.authorProfileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comment.authorProfileImageUrl}
                      alt={comment.authorDisplayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary font-bold">
                      {comment.authorDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Comment Header & Body */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.authorDisplayName}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(comment.publishedAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p
                    className="text-sm sm:text-base text-foreground/90 leading-relaxed break-words whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: comment.textDisplay }}
                  />

                  {/* Likes and Interactivity */}
                  <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{comment.likeCount} {comment.likeCount === 1 ? "like" : "likes"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Context */}
            {video && (
              <div className="p-4 rounded-xl border border-border/60 bg-card/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {thumbnail && (
                  <div className="w-28 sm:w-32 aspect-video rounded-md overflow-hidden shrink-0 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{video.title}</p>
                  <p className="text-xs text-muted-foreground">Channel: {video.channelTitle}</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open Video on YouTube
                  </a>
                </div>
              </div>
            )}

            {/* Pagination / Quota Disclaimer */}
            <div className="p-3.5 rounded-lg border border-border/50 bg-background/40 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="leading-relaxed">
                <strong>API Notice:</strong> YouTube&rsquo;s Data API paginates backwards up to 500 recent and chronological comment threads. For videos with hundreds of thousands of comments, this tool finds the earliest available comment indexed within YouTube API limits.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
