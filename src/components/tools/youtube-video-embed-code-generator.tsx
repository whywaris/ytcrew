"use client";

import * as React from "react";
import { z } from "zod";
import {
  Code,
  Sparkles,
  Copy,
  Check,
  Eye,
  Sliders,
  Maximize2,
  Lock,
  Play,
  VolumeX,
  Repeat,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function YouTubeVideoEmbedCodeGenerator() {
  const [url, setUrl] = React.useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [aspectRatio, setAspectRatio] = React.useState("16:9");
  const [customWidth, setCustomWidth] = React.useState("560");
  const [customHeight, setCustomHeight] = React.useState("315");
  const [responsiveWrapper, setResponsiveWrapper] = React.useState(true);
  const [autoplay, setAutoplay] = React.useState(false);
  const [mute, setMute] = React.useState(false);
  const [loop, setLoop] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [privacyEnhanced, setPrivacyEnhanced] = React.useState(true);
  const [startSeconds, setStartSeconds] = React.useState("");
  const [endSeconds, setEndSeconds] = React.useState("");

  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const extractId = (val: string): string | null => {
    const trimmed = val.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  const videoId = extractId(url) || "dQw4w9WgXcQ";

  // Build query params
  const buildParams = () => {
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (mute) params.set("mute", "1");
    if (!showControls) params.set("controls", "0");
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", videoId);
    }
    const startNum = parseInt(startSeconds, 10);
    if (!isNaN(startNum) && startNum > 0) params.set("start", String(startNum));
    const endNum = parseInt(endSeconds, 10);
    if (!isNaN(endNum) && endNum > 0) params.set("end", String(endNum));
    return params.toString();
  };

  const domain = privacyEnhanced ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
  const queryString = buildParams();
  const embedSrc = `${domain}/embed/${videoId}${queryString ? `?${queryString}` : ""}`;

  // Generate HTML code
  const generateEmbedHtml = () => {
    if (responsiveWrapper) {
      return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 8px;">
  <iframe
    src="${embedSrc}"
    title="YouTube video player"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
</div>`;
    }

    return `<iframe
  width="${customWidth}"
  height="${customHeight}"
  src="${embedSrc}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmbedHtml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls & Configuration Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            YouTube Embed Code Generator
          </CardTitle>
          <CardDescription>
            Customize and generate responsive, mobile-ready HTML iframe embed codes with privacy mode and playback controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">YouTube Video URL or ID</label>
            <Input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-background/80 border-input h-11 text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Configuration Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border/40">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={responsiveWrapper}
                onChange={(e) => setResponsiveWrapper(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>100% Responsive Width (CSS Wrapper)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyEnhanced}
                onChange={(e) => setPrivacyEnhanced(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Privacy-Enhanced (No-Cookie Domain)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Show Player Controls</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Autoplay (Muted by browser rule)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mute}
                onChange={(e) => setMute(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Start Muted</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Loop Video Automatically</span>
            </label>
          </div>

          {/* Start / End Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start Time (in seconds)</label>
              <Input
                type="number"
                placeholder="e.g. 30"
                min="0"
                value={startSeconds}
                onChange={(e) => setStartSeconds(e.target.value)}
                className="h-9 text-xs bg-background/80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">End Time (in seconds, optional)</label>
              <Input
                type="number"
                placeholder="e.g. 120"
                min="0"
                value={endSeconds}
                onChange={(e) => setEndSeconds(e.target.value)}
                className="h-9 text-xs bg-background/80"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview & Generated Code */}
      <Card className="border border-border bg-card/90 shadow-md overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Live Embed Preview & Code</CardTitle>
            </div>
            <Button
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                  Copied HTML!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Live Iframe Player */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Interactive Player Preview
            </p>
            <div className="w-full rounded-xl overflow-hidden border border-border shadow-inner bg-black aspect-video max-w-2xl mx-auto">
              <iframe
                src={embedSrc}
                title="YouTube Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* HTML Code Block */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              HTML Iframe Snippet
            </p>
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-background border border-border text-xs font-mono text-foreground/90 overflow-x-auto select-all leading-relaxed">
                {generateEmbedHtml()}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
