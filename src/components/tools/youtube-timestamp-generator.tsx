"use client";

import * as React from "react";
import { z } from "zod";
import { Copy, Check, ExternalLink, RefreshCw, Clock, Video, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Regex to match and extract 11-character YouTube video IDs from various formats:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://m.youtube.com/watch?v=ID
 * - https://youtube.com/shorts/ID
 * - https://www.youtube.com/embed/ID
 * - Plain video ID (11 chars)
 */
const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

/**
 * Zod validation schema for timestamp link inputs
 */
const timestampFormSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video URL.")
    .refine((val) => {
      const trimmed = val.trim();
      return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
    }, "Please enter a valid YouTube video URL (e.g. https://youtu.be/dQw4w9WgXcQ)."),
  hours: z.number().int().min(0, "Hours cannot be negative").max(999, "Hours too large"),
  minutes: z.number().int().min(0, "Minutes cannot be negative").max(59, "Minutes must be 0-59"),
  seconds: z.number().int().min(0, "Seconds cannot be negative").max(59, "Seconds must be 0-59"),
});

export function YouTubeTimestampGenerator() {
  const [url, setUrl] = React.useState("");
  const [hours, setHours] = React.useState<string>("0");
  const [minutes, setMinutes] = React.useState<string>("1");
  const [seconds, setSeconds] = React.useState<string>("30");

  const [generatedUrl, setGeneratedUrl] = React.useState<string>("");
  const [videoId, setVideoId] = React.useState<string>("");
  const [totalSeconds, setTotalSeconds] = React.useState<number>(0);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Helper function to extract YouTube ID from string
   */
  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const match = trimmed.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  /**
   * Parse human-readable timestamp input (e.g., pasting "01:25" or "1:05:30")
   */
  const handleTimeFormatPaste = (value: string) => {
    const parts = value.trim().split(":").map((p) => parseInt(p, 10));
    if (parts.some(isNaN)) return;

    if (parts.length === 3) {
      // HH:MM:SS
      setHours(String(parts[0]));
      setMinutes(String(parts[1]));
      setSeconds(String(parts[2]));
    } else if (parts.length === 2) {
      // MM:SS
      setHours("0");
      setMinutes(String(parts[0]));
      setSeconds(String(parts[1]));
    } else if (parts.length === 1) {
      // Seconds only
      const totalSec = parts[0];
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setHours(String(h));
      setMinutes(String(m));
      setSeconds(String(s));
    }
  };

  /**
   * Generate Timestamp URL handler
   */
  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const hNum = parseInt(hours, 10) || 0;
    const mNum = parseInt(minutes, 10) || 0;
    const sNum = parseInt(seconds, 10) || 0;

    const validation = timestampFormSchema.safeParse({
      url,
      hours: hNum,
      minutes: mNum,
      seconds: sNum,
    });

    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || "Invalid input";
      setError(firstError);
      return;
    }

    const calculatedTotalSeconds = hNum * 3600 + mNum * 60 + sNum;

    if (calculatedTotalSeconds < 0) {
      setError("Timestamp cannot be negative.");
      return;
    }

    const extractedId = extractVideoId(url);
    if (!extractedId) {
      setError("Could not find a valid YouTube video ID in the provided URL.");
      return;
    }

    setVideoId(extractedId);
    setTotalSeconds(calculatedTotalSeconds);

    // Format: https://youtu.be/VIDEO_ID?t=SECONDS
    const resultUrl = `https://youtu.be/${extractedId}?t=${calculatedTotalSeconds}`;
    setGeneratedUrl(resultUrl);
  };

  /**
   * Clipboard Copy handler with temporary feedback state
   */
  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  /**
   * Reset form fields
   */
  const handleReset = () => {
    setUrl("");
    setHours("0");
    setMinutes("0");
    setSeconds("0");
    setGeneratedUrl("");
    setVideoId("");
    setTotalSeconds(0);
    setError(null);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            <span>Generate Timestamp Link</span>
          </CardTitle>
          <CardDescription>
            Enter any YouTube video link and the exact time you want the video to start playing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Video URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="youtube-url"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>YouTube Video URL</span>
                <span className="text-xs text-muted-foreground">Standard, Short, or youtu.be link</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Video className="h-4 w-4" />
                </div>
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9 bg-background/80"
                  aria-invalid={!!error}
                />
              </div>
            </div>

            {/* Timestamp Inputs (Hours, Minutes, Seconds) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Start At Timestamp
                </label>
                <span className="text-xs text-muted-foreground">
                  Total: {parseInt(hours, 10) || 0}h {parseInt(minutes, 10) || 0}m {parseInt(seconds, 10) || 0}s (
                  {(parseInt(hours, 10) || 0) * 3600 +
                    (parseInt(minutes, 10) || 0) * 60 +
                    (parseInt(seconds, 10) || 0)}
                  s)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Hours
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max="999"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="text-center font-mono font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Minutes
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="text-center font-mono font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Seconds
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="text-center font-mono font-medium"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Timestamp Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-muted-foreground">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleTimeFormatPaste("00:30")}
                  className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  0:30
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeFormatPaste("01:00")}
                  className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  1:00
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeFormatPaste("05:00")}
                  className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  5:00
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeFormatPaste("10:00")}
                  className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  10:00
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" size="lg" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate Timestamp Link</span>
              </Button>
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
            </div>
          </form>

          {/* Generated Result Output */}
          {generatedUrl && (
            <div className="mt-8 pt-6 border-t border-border space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" />
                  Your Timestamped YouTube Link:
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  t={totalSeconds}s
                </span>
              </div>

              {/* URL Output Box with Copy Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    readOnly
                    value={generatedUrl}
                    className="font-mono text-sm bg-background border-primary/40 text-primary font-medium select-all pr-4"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={copied ? "secondary" : "primary"}
                    onClick={handleCopy}
                    className="gap-1.5 flex-1 sm:flex-initial"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-success font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Open timestamped link in new tab"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Embedded Player Preview (Optional Interactive Verification) */}
              {videoId && (
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Live Preview (Starts at {totalSeconds}s):</p>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${totalSeconds}&autoplay=0`}
                      title="YouTube Video Preview with Timestamp"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
