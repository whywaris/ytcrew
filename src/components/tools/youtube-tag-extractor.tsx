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
  Download,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  FileText,
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
    .min(1, "Please enter a YouTube video URL.")
    .refine(
      (val) => {
        const trimmed = val.trim();
        return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
      },
      "Please enter a valid YouTube video URL or Video ID."
    ),
});

export function YouTubeTagExtractor() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);
  const [videoData, setVideoData] = React.useState<YouTubeVideoDetails | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

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
        setError(data.error || "Failed to extract tags from this video.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      setVideoData(data.data);
    } catch {
      setError("Network error: Could not reach the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!videoData?.tags || videoData.tags.length === 0) return;
    const tagsText = videoData.tags.join(", ");
    navigator.clipboard.writeText(tagsText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (tag: string, index: number) => {
    navigator.clipboard.writeText(tag);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleDownloadTxt = () => {
    if (!videoData?.tags || videoData.tags.length === 0) return;
    const content = videoData.tags.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `youtube-tags-${videoData.id}.txt`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const thumbnail =
    videoData?.thumbnails.maxres?.url ||
    videoData?.thumbnails.high?.url ||
    videoData?.thumbnails.medium?.url;

  return (
    <div className="w-full space-y-6">
      {/* Input Box */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Extract YouTube Video Tags
          </CardTitle>
          <CardDescription>
            Uncover all hidden SEO meta tags used by any public YouTube video or Short in seconds.
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
                    Extracting...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Extract Tags
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
                  <p className="font-medium">{isQuotaError ? "API Quota Limit" : "Extraction Error"}</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {videoData && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Extracted Video Tags ({videoData.tags.length})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  From &ldquo;{videoData.title}&rdquo;
                </CardDescription>
              </div>

              {videoData.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTxt}
                    className="h-8 text-xs cursor-pointer border-border hover:border-primary/50"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download TXT
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopyAll}
                    className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                        Copied All!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy All Tags
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Tags Grid / Chips */}
            {videoData.tags.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {videoData.tags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopySingle(tag, idx)}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border hover:border-primary/60 hover:bg-card transition-all cursor-pointer text-foreground"
                      title="Click to copy single tag"
                    >
                      <span>{tag}</span>
                      {copiedIndex === idx ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Tip: Click any individual tag badge above to copy it to your clipboard.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border bg-background/50 text-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">No Public Tags Found</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  This video does not have any public tags assigned in its YouTube metadata. Not all creators add tags, and some videos rely entirely on video descriptions and automatic categorization.
                </p>
              </div>
            )}

            {/* Video Context Preview */}
            <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {thumbnail && (
                <div className="w-28 sm:w-32 aspect-video rounded-md overflow-hidden shrink-0 border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt={videoData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-xs font-medium text-foreground line-clamp-1">{videoData.title}</p>
                <p className="text-xs text-muted-foreground">
                  Channel: {videoData.channelTitle} • Category: {videoData.categoryName}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${videoData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-0.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Video
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
