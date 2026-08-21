"use client";

import * as React from "react";
import { z } from "zod";
import {
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Video,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

const thumbnailFormSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video URL.")
    .refine((val) => {
      const trimmed = val.trim();
      return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
    }, "Please enter a valid YouTube video URL (e.g. https://youtu.be/dQw4w9WgXcQ)."),
});

interface ThumbnailOption {
  key: string;
  name: string;
  resolution: string;
  dimensions: string;
  fileSize: string;
  url: string;
  badge: string;
}

export function YouTubeThumbnailDownloader() {
  const [url, setUrl] = React.useState("");
  const [videoId, setVideoId] = React.useState<string>("");
  const [thumbnails, setThumbnails] = React.useState<ThumbnailOption[]>([]);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  const handleFetchThumbnails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = thumbnailFormSchema.safeParse({ url });
    if (!validation.success) {
      setError(validation.error.issues?.[0]?.message || "Invalid YouTube URL");
      return;
    }

    const vidId = extractVideoId(url);
    if (!vidId) {
      setError("Could not extract a valid YouTube video ID.");
      return;
    }

    setVideoId(vidId);

    // YouTube Official Image CDN endpoints
    const items: ThumbnailOption[] = [
      {
        key: "maxres",
        name: "Maximum Resolution (HD)",
        resolution: "Full HD",
        dimensions: "1280 × 720 px",
        fileSize: "~150 KB",
        url: `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`,
        badge: "Best Quality",
      },
      {
        key: "hq",
        name: "High Quality",
        resolution: "HQ",
        dimensions: "480 × 360 px",
        fileSize: "~45 KB",
        url: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
        badge: "Standard HQ",
      },
      {
        key: "sd",
        name: "Standard Definition",
        resolution: "SD",
        dimensions: "640 × 480 px",
        fileSize: "~60 KB",
        url: `https://img.youtube.com/vi/${vidId}/sddefault.jpg`,
        badge: "Standard Def",
      },
      {
        key: "mq",
        name: "Medium Quality",
        resolution: "Medium",
        dimensions: "320 × 180 px",
        fileSize: "~20 KB",
        url: `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`,
        badge: "Compact",
      },
      {
        key: "default",
        name: "Default Thumbnail",
        resolution: "Normal",
        dimensions: "120 × 90 px",
        fileSize: "~8 KB",
        url: `https://img.youtube.com/vi/${vidId}/default.jpg`,
        badge: "Small",
      },
    ];

    setThumbnails(items);
  };

  /**
   * Client-side fetch blob download to bypass cross-origin browser navigation
   */
  const handleDownloadThumbnail = async (thumb: ThumbnailOption) => {
    setDownloadingKey(thumb.key);
    try {
      const response = await fetch(thumb.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `youtube-thumbnail-${videoId}-${thumb.key}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, falling back to new tab", err);
      window.open(thumb.url, "_blank");
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleCopyUrl = async (thumbUrl: string, key: string) => {
    try {
      await navigator.clipboard.writeText(thumbUrl);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  const handleReset = () => {
    setUrl("");
    setVideoId("");
    setThumbnails([]);
    setError(null);
  };

  const heroThumbnail = thumbnails[0];
  const gridThumbnails = thumbnails.slice(1);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardContent className="p-6 space-y-6">
          {/* Input Form Section */}
          <form onSubmit={handleFetchThumbnails} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="thumb-url-input"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>YouTube Video URL or Shorts Link</span>
                <span className="text-xs text-muted-foreground">Standard URL, Shorts, or youtu.be</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Video className="h-4 w-4" />
                </div>
                <Input
                  id="thumb-url-input"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9 bg-background/80"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button type="submit" size="lg" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Extract All Thumbnails</span>
              </Button>
              {thumbnails.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </form>

          {/* Results: Hero + Grid Layout */}
          {thumbnails.length > 0 && heroThumbnail && (
            <div className="mt-8 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Available Thumbnail Resolutions ({thumbnails.length})
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Video ID: {videoId}
                </span>
              </div>

              {/* 1. HERO THUMBNAIL (Max Resolution HD) */}
              <div className="p-4 sm:p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 shadow-md">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-black/40 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroThumbnail.url}
                    alt={heroThumbnail.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = "0.6";
                    }}
                  />
                </div>

                {/* Compact Label Row + Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-foreground text-sm">
                      {heroThumbnail.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">
                      {heroThumbnail.badge}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {heroThumbnail.dimensions}
                    </span>
                    <span className="text-muted-foreground">
                      • {heroThumbnail.fileSize}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant={copiedKey === heroThumbnail.key ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleCopyUrl(heroThumbnail.url, heroThumbnail.key)}
                      className="gap-1.5 text-xs h-8 px-3"
                    >
                      {copiedKey === heroThumbnail.key ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span className="text-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={downloadingKey === heroThumbnail.key}
                      onClick={() => handleDownloadThumbnail(heroThumbnail)}
                      className="gap-1.5 text-xs h-8 px-3"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingKey === heroThumbnail.key ? "Downloading..." : "Download"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. COMPACT 2-COLUMN GRID (Remaining Resolutions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gridThumbnails.map((thumb) => {
                  const isCopied = copiedKey === thumb.key;
                  const isDownloading = downloadingKey === thumb.key;

                  return (
                    <div
                      key={thumb.key}
                      className="p-3 sm:p-4 rounded-xl border border-border bg-card/60 space-y-2.5 flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm"
                    >
                      <div className="space-y-2">
                        {/* Thumbnail Image */}
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb.url}
                            alt={thumb.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Compact Metadata Row */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs pt-0.5">
                          <span className="font-semibold text-foreground">
                            {thumb.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                            <span>{thumb.dimensions}</span>
                            <span>•</span>
                            <span>{thumb.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                        <Button
                          type="button"
                          variant={isCopied ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleCopyUrl(thumb.url, thumb.key)}
                          className="gap-1.5 text-xs h-7 px-2.5"
                          title="Copy image URL"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-success" />
                              <span className="text-success">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isDownloading}
                          onClick={() => handleDownloadThumbnail(thumb)}
                          className="gap-1.5 text-xs h-7 px-2.5"
                        >
                          <Download className="h-3 w-3" />
                          <span>{isDownloading ? "..." : "Download"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
