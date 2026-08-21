"use client";

import * as React from "react";
import { z } from "zod";
import {
  Rss,
  Search,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Radio,
  Sparkles,
  RefreshCw,
  Code2,
  Tv,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouTubeChannelResolution } from "@/lib/youtube";

const channelInputSchema = z.object({
  input: z
    .string()
    .min(1, "Please enter a YouTube Channel URL, @handle, or Channel ID.")
    .max(200, "Input is too long"),
});

export function YouTubeRssFeedGenerator() {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);
  const [feedResult, setFeedResult] = React.useState<{
    channelId: string;
    channelTitle: string;
    thumbnailUrl?: string;
    rssUrl: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsQuotaError(false);

    const validation = channelInputSchema.safeParse({ input });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid input");
      return;
    }

    const trimmed = input.trim();

    // 1. Direct Channel ID detection (Zero API call needed!)
    const directChannelMatch = trimmed.match(/^UC[\w-]{22}$/) || trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    if (directChannelMatch) {
      const cid = directChannelMatch[1] || directChannelMatch[0];
      setFeedResult({
        channelId: cid,
        channelTitle: "YouTube Channel",
        rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`,
      });
      return;
    }

    // 2. Resolve handle or username via API endpoint
    setLoading(true);
    setFeedResult(null);

    try {
      const res = await fetch(`/api/youtube/channel-id?input=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to locate YouTube Channel.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      const resData: YouTubeChannelResolution = data.data;
      setFeedResult({
        channelId: resData.channelId,
        channelTitle: resData.title,
        thumbnailUrl: resData.thumbnailUrl,
        rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${resData.channelId}`,
      });
    } catch {
      setError("Network error: Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Input Generator Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Rss className="h-5 w-5 text-primary" />
            YouTube RSS Feed Generator
          </CardTitle>
          <CardDescription>
            Turn any YouTube channel link, custom @handle, or Channel ID into an official XML RSS feed URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="e.g. @MrBeast, https://youtube.com/@veritasium, or UCX6OQ3DkcsbYNE6H8uQQuVA"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-background/80 border-input h-11 text-sm focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 px-6 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 cursor-pointer shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    Get RSS Feed
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

      {/* Generated Feed Card */}
      {feedResult && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-base font-semibold">Channel RSS Feed URL</CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={feedResult.rssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-card text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Test Feed
                </a>
                <Button
                  size="sm"
                  onClick={() => handleCopy(feedResult.rssUrl)}
                  className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                      Copied Feed URL!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy RSS Feed URL
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Feed URL Display */}
            <div className="p-4 rounded-xl bg-background/90 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  Direct XML RSS Feed
                </p>
                <p className="font-mono text-xs sm:text-sm text-primary break-all select-all font-semibold">
                  {feedResult.rssUrl}
                </p>
              </div>
            </div>

            {/* Channel Info */}
            <div className="p-4 rounded-xl border border-border/60 bg-card/40 flex items-center gap-4">
              {feedResult.thumbnailUrl && (
                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={feedResult.thumbnailUrl}
                    alt={feedResult.channelTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{feedResult.channelTitle}</h4>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  Channel ID: {feedResult.channelId}
                </p>
              </div>
            </div>

            {/* Practical Use Cases Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-primary" /> Feed Readers
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste into Feedly, Inoreader, or NetNewsWire to read video updates without YouTube ads.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Discord & Slack Bots
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Post instant video notifications in Discord channels via webhooks when a new video drops.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" /> Zapier & IFTTT
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trigger automated cross-posting to Twitter/X, Facebook pages, or email newsletters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
