"use client";

import * as React from "react";
import { z } from "zod";
import {
  Tag,
  Search,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Film,
  RefreshCw,
  FolderOpen,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouTubeVideoDetails } from "@/lib/youtube";

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
      "Please provide a valid YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
    ),
});

export function YouTubeCategoryChecker() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);
  const [videoData, setVideoData] = React.useState<YouTubeVideoDetails | null>(null);
  const [copiedCategory, setCopiedCategory] = React.useState(false);

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
    setVideoData(null);

    try {
      const res = await fetch(`/api/youtube/video-info?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to retrieve video details.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      setVideoData(data.data);
    } catch {
      setError("Network error: Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCategory(true);
    setTimeout(() => setCopiedCategory(false), 2000);
  };

  const thumbnail =
    videoData?.thumbnails.maxres?.url ||
    videoData?.thumbnails.high?.url ||
    videoData?.thumbnails.medium?.url ||
    videoData?.thumbnails.default?.url;

  return (
    <div className="w-full space-y-6">
      {/* Input Form Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Check YouTube Video Category
          </CardTitle>
          <CardDescription>
            Enter any YouTube video link or Short to discover its official internal category classification.
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
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Category
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
                  <p className="font-medium">{isQuotaError ? "API Quota Limit" : "Error"}</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {videoData && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Video Category Result</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(videoData.categoryName)}
                className="h-8 text-xs cursor-pointer border-border hover:border-primary/50"
              >
                {copiedCategory ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Category
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Primary Category Banner */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">
                  Official YouTube Category
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {videoData.categoryName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Internal Category ID: {videoData.categoryId}
                </p>
              </div>

              <div className="px-4 py-2 rounded-lg bg-background/80 border border-border text-xs font-medium text-muted-foreground">
                Verified via YouTube Data API
              </div>
            </div>

            {/* Video Context Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl border border-border/60 bg-background/40">
              {thumbnail && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border/60 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt={videoData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-[10px] text-white font-medium px-2 py-0.5 rounded">
                    ID: {videoData.id}
                  </div>
                </div>
              )}

              <div className={`space-y-3 ${thumbnail ? "md:col-span-2" : "md:col-span-3"}`}>
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                  {videoData.title}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">Channel: {videoData.channelTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Published:{" "}
                      {videoData.publishedAt
                        ? new Date(videoData.publishedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${videoData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
