"use client";

import * as React from "react";
import { z } from "zod";
import Image from "next/image";
import {
  Clock,
  PlaySquare,
  ListVideo,
  Gauge,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Zap,
  Info,
  Timer,
  Film,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  YouTubePlaylistLengthResult,
  YOUTUBE_PLAYLIST_REGEX,
} from "@/lib/youtube";

const playlistInputSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube playlist URL or Playlist ID.")
    .refine(
      (val) => {
        const trimmed = val.trim();
        return (
          YOUTUBE_PLAYLIST_REGEX.test(trimmed) ||
          (/^[a-zA-Z0-9_-]{10,64}$/.test(trimmed) && !trimmed.includes("."))
        );
      },
      "Please enter a valid YouTube playlist URL (e.g. https://www.youtube.com/playlist?list=PL...) or raw Playlist ID."
    ),
});

export function YouTubePlaylistLengthCalculator() {
  const [inputUrl, setInputUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);
  const [result, setResult] = React.useState<YouTubePlaylistLengthResult | null>(null);
  const [copiedSummary, setCopiedSummary] = React.useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsQuotaError(false);

    const validation = playlistInputSchema.safeParse({ url: inputUrl });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid YouTube playlist URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/youtube/playlist-length?url=${encodeURIComponent(inputUrl.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to calculate playlist length. Please verify the playlist is public.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      setResult(data.data);
    } catch {
      setError("Network error: Could not reach the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const summaryText = `🎵 YouTube Playlist Duration Summary:
📌 Title: ${result.title}
📺 Channel: ${result.channelTitle || "Unknown"}
⏱️ Total Duration (1.0x): ${result.formattedDuration} (${result.totalMinutes.toLocaleString()} mins)
🔢 Total Videos: ${result.totalVideos} videos (${result.availableVideos} available)
📊 Average Video Length: ${result.formattedAverageDuration}
⚡ Playback Speeds:
  • 1.25x: ${result.speedBreakdown.find((s) => s.speed === 1.25)?.formatted || "N/A"}
  • 1.5x:  ${result.speedBreakdown.find((s) => s.speed === 1.5)?.formatted || "N/A"}
  • 1.75x: ${result.speedBreakdown.find((s) => s.speed === 1.75)?.formatted || "N/A"}
  • 2.0x:  ${result.speedBreakdown.find((s) => s.speed === 2.0)?.formatted || "N/A"}
Calculated with YT Crew (ytcrew.com)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleReset = () => {
    setInputUrl("");
    setResult(null);
    setError(null);
    setIsQuotaError(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            <span>YouTube Playlist Length Calculator</span>
          </CardTitle>
          <CardDescription>
            Enter any public YouTube playlist URL or Playlist ID to instantly calculate its total watch time, average video duration, and speed breakdowns.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9WAqUEx564E"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  className="pr-10 bg-background/60 focus:bg-background border-border text-sm"
                />
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl("")}
                    aria-label="Clear playlist input"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading || !inputUrl.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shrink-0 shadow-md shadow-primary/20 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Calculate Length
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepts full playlist URLs (e.g. <code className="text-primary/90 font-mono">youtube.com/playlist?list=PL...</code>), video URLs with playlist parameters, or raw Playlist IDs.
            </p>
          </form>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
              {isQuotaError ? (
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {isQuotaError ? "YouTube API Quota Limit Reached" : "Calculation Error"}
                </p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <Card className="border-border bg-card/60 animate-pulse">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Clock className="w-6 h-6 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-semibold text-foreground">Fetching Playlist Data...</h3>
              <p className="text-xs text-muted-foreground">
                Retrieving video durations and crunching total watch times across all playlist items.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Playlist Metadata Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              {result.thumbnailUrl ? (
                <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-border bg-secondary/50">
                  <Image
                    src={result.thumbnailUrl}
                    alt={result.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-14 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <ListVideo className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-foreground text-base sm:text-lg truncate">
                  {result.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {result.channelTitle && (
                    <span>By <span className="text-foreground font-medium">{result.channelTitle}</span></span>
                  )}
                  <span>•</span>
                  <span>{result.totalVideos} {result.totalVideos === 1 ? "video" : "videos"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <a
                href={`https://www.youtube.com/playlist?list=${encodeURIComponent(result.playlistId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary text-xs text-foreground font-medium transition-colors"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="gap-1.5 text-xs font-medium cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Summary
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Notices: Capped or Unavailable Videos */}
          {(result.isCapped || result.unavailableVideos > 0) && (
            <div className="space-y-2">
              {result.isCapped && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
                  <Info className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    This playlist contains more than {result.capLimit} videos. To preserve API resources, calculation is based on the first <strong>{result.capLimit}</strong> videos.
                  </span>
                </div>
              )}
              {result.unavailableVideos > 0 && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs text-blue-300">
                  <Info className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>
                    Note: <strong>{result.unavailableVideos}</strong> video{result.unavailableVideos === 1 ? " is" : "s are"} private or deleted in this playlist and could not be factored into the duration.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Duration */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Total Duration</span>
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-black text-foreground">
                  {result.formattedDurationShort}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.formattedDuration}
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                ≈ {result.totalMinutes.toLocaleString()} minutes
              </div>
            </div>

            {/* Total Videos */}
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Videos</span>
                <Film className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-black text-foreground">
                  {result.totalVideos.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.availableVideos} accessible videos
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {result.unavailableVideos > 0
                  ? `${result.unavailableVideos} private/deleted`
                  : "All videos accessible"}
              </div>
            </div>

            {/* Average Video Length */}
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Video</span>
                <Timer className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-black text-foreground">
                  {result.formattedAverageDuration}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Per playlist item
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {result.averageVideoDurationSeconds} seconds / video
              </div>
            </div>

            {/* 2x Playback Speed */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">At 2.0x Speed</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-black text-emerald-300">
                  {result.speedBreakdown.find((s) => s.speed === 2.0)?.formattedShort || "0s"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Double speed watch time
                </div>
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium">
                ⚡ Saves {result.speedBreakdown.find((s) => s.speed === 2.0)?.timeSavedFormatted || "0s"}
              </div>
            </div>
          </div>

          {/* Speed Breakdown Table Card */}
          <Card className="border-border bg-card shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Gauge className="h-4 w-4 text-primary" />
                <span>Estimated Watch Time by Playback Speed</span>
              </CardTitle>
              <CardDescription className="text-xs">
                See exactly how much time you save when speeding up YouTube playback.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Speed</th>
                    <th className="py-3 px-4">Total Watch Time</th>
                    <th className="py-3 px-4">Duration (Compact)</th>
                    <th className="py-3 px-4 text-right">Time Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {result.speedBreakdown.map((item) => (
                    <tr
                      key={item.speed}
                      className={`hover:bg-secondary/20 transition-colors ${
                        item.speed === 1.0 ? "bg-primary/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold flex items-center gap-2">
                        {item.speed === 1.0 && <span className="w-2 h-2 rounded-full bg-primary" />}
                        {item.label}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {item.formatted}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {item.formattedShort}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {item.speed === 1.0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-emerald-400">-{item.timeSavedFormatted}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 text-xs font-medium cursor-pointer"
            >
              <PlaySquare className="w-3.5 h-3.5" />
              Calculate Another Playlist
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopySummary}
              className="gap-2 text-xs font-semibold shadow-sm cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied Full Summary!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Playlist Summary
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
