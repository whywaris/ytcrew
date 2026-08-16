"use client";

import * as React from "react";
import { z } from "zod";
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Gauge,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Regex to match and extract 11-character YouTube video IDs
 */
const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

const frameFormSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video URL.")
    .refine((val) => {
      const trimmed = val.trim();
      return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
    }, "Please enter a valid YouTube video URL or ID (e.g. https://youtu.be/dQw4w9WgXcQ)."),
});

// Declare global YT interface for YouTube IFrame API
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export function YouTubeVideoFrameByFrame() {
  const [url, setUrl] = React.useState("");
  const [loadedVideoId, setLoadedVideoId] = React.useState<string>("");
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState<number>(1);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [apiReady, setApiReady] = React.useState(false);

  const playerRef = React.useRef<YTPlayer | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const playerContainerId = React.useId().replace(/:/g, "_") + "_yt_player";

  // Load YouTube IFrame API once
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const existingScript = document.getElementById("yt-iframe-api-script");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setApiReady(true);
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Poll current time when player is running
  const startPolling = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 50);
  }, []);

  const stopPolling = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize or re-create Player when loadedVideoId changes and API is ready
  React.useEffect(() => {
    if (!apiReady || !loadedVideoId) return;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore cleanup errors
      }
      playerRef.current = null;
    }

    const playerElement = document.getElementById(playerContainerId);
    if (!playerElement || !window.YT) return;

    playerRef.current = new window.YT.Player(playerContainerId, {
      videoId: loadedVideoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration() || 0);
          setCurrentTime(0);
        },
        onStateChange: (event) => {
          if (event.data === window.YT?.PlayerState.PLAYING) {
            setIsPlaying(true);
            startPolling();
          } else {
            setIsPlaying(false);
            stopPolling();
            if (playerRef.current) {
              setCurrentTime(playerRef.current.getCurrentTime());
            }
          }
        },
      },
    });

    return () => {
      stopPolling();
    };
  }, [loadedVideoId, apiReady, playerContainerId, startPolling, stopPolling]);

  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const match = trimmed.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  const handleLoadVideo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = frameFormSchema.safeParse({ url });
    if (!validation.success) {
      setError(validation.error.issues?.[0]?.message || "Invalid YouTube URL");
      return;
    }

    const vidId = extractVideoId(url);
    if (!vidId) {
      setError("Could not extract a valid YouTube video ID.");
      return;
    }

    setLoadedVideoId(vidId);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const seekRelative = (seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, currentTime + seconds);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const formatTimestampDetailed = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = Math.floor(totalSec % 60);
    const milliseconds = Math.floor((totalSec % 1) * 1000);

    const pad = (n: number, z = 2) => String(n).padStart(z, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
  };

  const getShareableTimestampUrl = () => {
    if (!loadedVideoId) return "";
    const wholeSeconds = Math.floor(currentTime);
    return `https://youtu.be/${loadedVideoId}?t=${wholeSeconds}`;
  };

  const handleCopyLink = async () => {
    const link = getShareableTimestampUrl();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleReset = () => {
    setUrl("");
    setLoadedVideoId("");
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Video className="h-5 w-5 text-primary" />
            <span>YouTube Frame By Frame Video Player</span>
          </CardTitle>
          <CardDescription>
            Step through any YouTube video forward or backward with high-precision time seeking, slow-motion playback, and instant timestamp copying.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Form */}
          <form onSubmit={handleLoadVideo} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="frame-video-url"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>YouTube Video URL or ID</span>
                <span className="text-xs text-muted-foreground">Standard URL, Shorts, or youtu.be</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Video className="h-4 w-4" />
                </div>
                <Input
                  id="frame-video-url"
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
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" size="lg" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Load & Inspect Video</span>
              </Button>
              {loadedVideoId && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              )}
            </div>
          </form>

          {/* Interactive Player & Stepper Controls */}
          {loadedVideoId && (
            <div className="mt-6 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
              {/* YouTube Embed Container */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black shadow-inner">
                <div id={playerContainerId} className="w-full h-full" />
              </div>

              {/* Realtime Time Readout Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-secondary/30 border border-border/80 text-center">
                <div className="space-y-0.5">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Current Position
                  </span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-primary">
                    {formatTimestampDetailed(currentTime)}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Exact Seconds
                  </span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-foreground">
                    {currentTime.toFixed(3)}s
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Video Length
                  </span>
                  <div className="text-xl sm:text-2xl font-mono font-semibold text-muted-foreground">
                    {duration > 0 ? formatTimestampDetailed(duration) : "--:--"}
                  </div>
                </div>
              </div>

              {/* Fine-Grained Frame Seeking Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Frame-by-Frame Stepper</span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Approximate frame step: ±0.033s (30fps) to ±0.1s
                  </span>
                </div>

                {/* Primary Step Buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => seekRelative(-5)}
                    className="gap-1 font-mono text-xs"
                    title="Rewind 5 seconds"
                  >
                    <ChevronsLeft className="h-3 w-3" />
                    -5s
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => seekRelative(-1)}
                    className="gap-1 font-mono text-xs"
                    title="Rewind 1 second"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    -1s
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => seekRelative(-0.1)}
                    className="font-mono text-xs font-semibold"
                    title="Step backward ~3 frames (0.1s)"
                  >
                    -0.1s
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => seekRelative(-0.033)}
                    className="font-mono text-xs font-semibold"
                    title="Step backward 1 frame (0.033s)"
                  >
                    -1 Frame
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => seekRelative(0.033)}
                    className="font-mono text-xs font-semibold"
                    title="Step forward 1 frame (0.033s)"
                  >
                    +1 Frame
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => seekRelative(0.1)}
                    className="font-mono text-xs font-semibold"
                    title="Step forward ~3 frames (0.1s)"
                  >
                    +0.1s
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => seekRelative(1)}
                    className="gap-1 font-mono text-xs"
                    title="Forward 1 second"
                  >
                    +1s
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => seekRelative(5)}
                    className="gap-1 font-mono text-xs"
                    title="Forward 5 seconds"
                  >
                    +5s
                    <ChevronsRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Playback Controls & Speed */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={isPlaying ? "destructive" : "primary"}
                      size="sm"
                      onClick={togglePlayPause}
                      className="gap-1.5"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-current" />
                          <span>Play</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Playback Rate Buttons */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground mr-1">
                      <Gauge className="h-3.5 w-3.5" />
                      <span>Speed:</span>
                    </div>
                    {[0.25, 0.5, 0.75, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleRateChange(rate)}
                        className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                          playbackRate === rate
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copy Frame Timestamp Link Output */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Copy Timestamp Link for This Frame:
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    t={Math.floor(currentTime)}s
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    readOnly
                    value={getShareableTimestampUrl()}
                    className="font-mono text-xs sm:text-sm bg-background border-primary/40 text-primary font-medium select-all"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={copied ? "secondary" : "primary"}
                      onClick={handleCopyLink}
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
                      href={getShareableTimestampUrl()}
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
              </div>

              {/* Technical Note */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-card/60 border border-border/60 text-xs text-muted-foreground">
                <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>How frame stepping works:</strong> Standard web embedded YouTube players don&apos;t expose raw video decoding frames directly. This tool uses fine-grained sub-second player seeks (approx. 33ms per step at 30fps) and dynamic playback rate deceleration to allow you to inspect exact moments without needing to download large video files.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
