"use client";

import * as React from "react";
import { z } from "zod";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  url: string;
  badge: string;
  qualityDesc: string;
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
        resolution: "1080p / 720p HD",
        dimensions: "1280 × 720 px (or 1920 × 1080)",
        url: `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`,
        badge: "Best Quality",
        qualityDesc: "Crisp full-HD resolution for banners and social promotion.",
      },
      {
        key: "hq",
        name: "High Quality (HQ)",
        resolution: "HQ Standard",
        dimensions: "480 × 360 px",
        url: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
        badge: "High Res",
        qualityDesc: "Standard high resolution available for 100% of YouTube videos.",
      },
      {
        key: "sd",
        name: "Standard Definition (SD)",
        resolution: "SD Standard",
        dimensions: "640 × 480 px",
        url: `https://img.youtube.com/vi/${vidId}/sddefault.jpg`,
        badge: "SD",
        qualityDesc: "Clear standard-definition format.",
      },
      {
        key: "mq",
        name: "Medium Quality (MQ)",
        resolution: "Medium",
        dimensions: "320 × 180 px",
        url: `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`,
        badge: "Medium",
        qualityDesc: "Compact file size suitable for previews and widgets.",
      },
      {
        key: "default",
        name: "Normal Thumbnail",
        resolution: "Small",
        dimensions: "120 × 90 px",
        url: `https://img.youtube.com/vi/${vidId}/default.jpg`,
        badge: "Low Res",
        qualityDesc: "Default low-res thumbnail stream icon.",
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

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>YouTube Thumbnail Downloader</span>
          </CardTitle>
          <CardDescription>
            Download HD and 4K YouTube video thumbnails in all available resolutions (1080p, 720p, 480p, and SD) with zero quality loss.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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

          {/* Results Display */}
          {thumbnails.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Available Thumbnail Resolutions ({thumbnails.length})
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Video ID: {videoId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {thumbnails.map((thumb) => {
                  const isCopied = copiedKey === thumb.key;
                  const isDownloading = downloadingKey === thumb.key;

                  return (
                    <div
                      key={thumb.key}
                      className="p-4 rounded-xl border border-border bg-card/60 space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-sm"
                    >
                      <div className="space-y-2">
                        {/* Header Badges */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">
                            {thumb.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                            {thumb.dimensions}
                          </span>
                        </div>

                        {/* Image Preview Box */}
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb.url}
                            alt={thumb.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If maxres isn't available for very old videos, fallback notice
                              (e.target as HTMLElement).style.opacity = "0.5";
                            }}
                          />
                        </div>

                        <p className="text-xs text-muted-foreground">{thumb.qualityDesc}</p>
                      </div>

                      {/* Download & Copy Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isDownloading}
                          onClick={() => handleDownloadThumbnail(thumb)}
                          className="flex-1 gap-1.5 text-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{isDownloading ? "Downloading..." : "Download"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant={isCopied ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleCopyUrl(thumb.url, thumb.key)}
                          className="gap-1.5 text-xs"
                          title="Copy direct image link"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-success" />
                              <span className="text-success">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </Button>

                        <a
                          href={thumb.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Open thumbnail in new tab"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
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
