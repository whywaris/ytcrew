"use client";

import * as React from "react";
import { z } from "zod";
import {
  Bookmark,
  Search,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Clock,
  ListOrdered,
  Sparkles,
  RefreshCw,
  FileQuestion,
  Play,
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
      "Please provide a valid YouTube video URL or ID."
    ),
});

export interface ExtractedChapter {
  timestamp: string;
  totalSeconds: number;
  title: string;
  timestampUrl: string;
}

export function YouTubeVideoChapters() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);
  const [videoData, setVideoData] = React.useState<YouTubeVideoDetails | null>(null);
  const [chapters, setChapters] = React.useState<ExtractedChapter[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  /**
   * Parse video description line by line for timestamp chapter patterns
   * Examples:
   * 00:00 - Introduction
   * 01:45 Step 1: Setting up
   * 1:12:30 Conclusion & Outro
   */
  const parseChaptersFromDescription = (description: string, videoId: string): ExtractedChapter[] => {
    if (!description) return [];

    const lines = description.split(/\r?\n/);
    const parsed: ExtractedChapter[] = [];

    // Regex matching HH:MM:SS or MM:SS at the start or enclosed in brackets/parentheses
    const timePattern = /(?:(?:(\d{1,2}):)?(\d{1,2}):(\d{2}))/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const match = trimmed.match(timePattern);
      if (match) {
        const fullTimestamp = match[0];
        const hours = match[1] ? parseInt(match[1], 10) : 0;
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);

        if (minutes < 60 && seconds < 60) {
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;

          // Remove timestamp and leading punctuation (- , : |) from line to extract title
          let title = trimmed.replace(fullTimestamp, "").trim();
          title = title.replace(/^[-–—:|\s]+|[-–—:|\s]+$/g, "").trim();
          if (!title) {
            title = `Chapter at ${fullTimestamp}`;
          }

          parsed.push({
            timestamp: fullTimestamp,
            totalSeconds,
            title,
            timestampUrl: `https://youtu.be/${videoId}?t=${totalSeconds}`,
          });
        }
      }
    }

    return parsed;
  };

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
    setChapters([]);
    setHasSearched(false);

    try {
      const res = await fetch(`/api/youtube/video-info?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to retrieve video chapters.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      const vid = data.data;
      setVideoData(vid);
      const parsed = parseChaptersFromDescription(vid.description, vid.id);
      setChapters(parsed);
      setHasSearched(true);
    } catch {
      setError("Network error: Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (chapters.length === 0) return;
    const formatted = chapters.map((c) => `${c.timestamp} ${c.title}`).join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyChapterLink = (c: ExtractedChapter, index: number) => {
    navigator.clipboard.writeText(c.timestampUrl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const thumbnail =
    videoData?.thumbnails.maxres?.url ||
    videoData?.thumbnails.high?.url ||
    videoData?.thumbnails.medium?.url;

  return (
    <div className="w-full space-y-6">
      {/* Input Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Extract YouTube Video Chapters & Timestamps
          </CardTitle>
          <CardDescription>
            Extract all chapter timestamps, section markers, and direct clickable jump links from any YouTube video.
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
                    Find Chapters
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

      {/* Chapters Output */}
      {hasSearched && videoData && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-primary" />
                  Video Chapters ({chapters.length})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Extracted from &ldquo;{videoData.title}&rdquo;
                </CardDescription>
              </div>

              {chapters.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleCopyAll}
                  className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {copiedAll ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                      Copied Chapters!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy All Chapters
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {chapters.length > 0 ? (
              <div className="space-y-2">
                {chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-background border border-border/80 hover:border-primary/50 hover:bg-card transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <a
                        href={chapter.timestampUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                        title="Jump to this chapter on YouTube"
                      >
                        <Play className="h-3 w-3" />
                        {chapter.timestamp}
                      </a>
                      <span className="text-sm font-medium text-foreground truncate">
                        {chapter.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyChapterLink(chapter, idx)}
                        className="h-7 text-xs px-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="mr-1 h-3 w-3 text-emerald-400" />
                            Link Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            Copy Link
                          </>
                        )}
                      </Button>

                      <a
                        href={chapter.timestampUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-border bg-background/50 text-center space-y-2">
                <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">No Chapters Detected</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  No timestamped chapter markers (like &ldquo;00:00 Intro&rdquo;) were detected in this video&rsquo;s description. The creator has not defined chapters for this video.
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
                <p className="text-xs font-semibold text-foreground line-clamp-1">{videoData.title}</p>
                <p className="text-xs text-muted-foreground">Channel: {videoData.channelTitle}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${videoData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Watch Video on YouTube
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
