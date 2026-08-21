"use client";

import * as React from "react";
import { z } from "zod";
import {
  Trophy,
  Gift,
  Search,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Shuffle,
  ThumbsUp,
  Clock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouTubeCommentItem } from "@/lib/youtube";

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
      "Please provide a valid YouTube video link or ID."
    ),
});

export function RandomYouTubeCommentPicker() {
  const [url, setUrl] = React.useState("");
  const [includeReplies, setIncludeReplies] = React.useState(false);
  const [filterKeyword, setFilterKeyword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = React.useState(false);

  // Cached comments pool in client session
  const [commentsPool, setCommentsPool] = React.useState<YouTubeCommentItem[]>([]);
  const [selectedWinner, setSelectedWinner] = React.useState<YouTubeCommentItem | null>(null);
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [previousWinners, setPreviousWinners] = React.useState<YouTubeCommentItem[]>([]);

  const handleFetchComments = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsQuotaError(false);

    const validation = formSchema.safeParse({ url });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid URL");
      return;
    }

    setLoading(true);
    setSelectedWinner(null);
    setPreviousWinners([]);

    try {
      const res = await fetch(
        `/api/youtube/comments?url=${encodeURIComponent(url.trim())}&includeReplies=${includeReplies}&maxPages=5`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to retrieve comments.");
        if (data.isQuotaError) {
          setIsQuotaError(true);
        }
        return;
      }

      if (!data.data || data.data.length === 0) {
        setError("No comments found for this video. Make sure comments are enabled and public.");
        return;
      }

      setCommentsPool(data.data);
      pickRandomWinner(data.data);
    } catch {
      setError("Network error: Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredComments = (pool: YouTubeCommentItem[] = commentsPool) => {
    if (!filterKeyword.trim()) return pool;
    const kw = filterKeyword.trim().toLowerCase();
    return pool.filter((c) =>
      c.textDisplay.toLowerCase().includes(kw) || c.textOriginal.toLowerCase().includes(kw)
    );
  };

  const pickRandomWinner = (pool: YouTubeCommentItem[] = commentsPool) => {
    const eligible = getFilteredComments(pool);
    if (eligible.length === 0) {
      setError(`No comments matched the filter keyword "${filterKeyword}".`);
      return;
    }

    setIsShuffling(true);

    // Fun slot-machine shuffle animation
    let shuffleCount = 0;
    const maxShuffles = 10;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * eligible.length);
      setSelectedWinner(eligible[randomIdx]);
      shuffleCount++;

      if (shuffleCount >= maxShuffles) {
        clearInterval(interval);
        const finalWinner = eligible[Math.floor(Math.random() * eligible.length)];
        setSelectedWinner(finalWinner);
        setIsShuffling(false);
        setPreviousWinners((prev) => [finalWinner, ...prev.filter((p) => p.id !== finalWinner.id)]);
      }
    }, 80);
  };

  const handleCopyWinner = () => {
    if (!selectedWinner) return;
    const text = `🎉 Giveaway Winner: ${selectedWinner.authorDisplayName}\nComment: "${selectedWinner.textOriginal || selectedWinner.textDisplay}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Form Input Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Random YouTube Comment Picker & Giveaway Winner
          </CardTitle>
          <CardDescription>
            Fairly pick a random YouTube comment winner for your giveaways, contests, and promotions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFetchComments} className="space-y-4">
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
                    Fetching Comments...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Load & Pick Winner
                  </>
                )}
              </Button>
            </div>

            {/* Filter & Options Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeReplies}
                    onChange={(e) => setIncludeReplies(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Include replies in draw (default: top-level only)</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Optional: Filter by keyword (e.g. #giveaway)"
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  className="h-8 text-xs bg-background/60"
                />
              </div>
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

      {/* Winner Spotlight Card */}
      {selectedWinner && (
        <Card className="border-2 border-primary/40 bg-gradient-to-b from-card to-background shadow-xl overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4 bg-primary/5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400 animate-bounce" />
                <CardTitle className="text-base font-bold text-foreground">
                  Giveaway Winner Selected!
                </CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWinner}
                  className="h-8 text-xs cursor-pointer border-border hover:border-primary/50"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Result
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => pickRandomWinner()}
                  disabled={isShuffling}
                  className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Shuffle className={`mr-1.5 h-3.5 w-3.5 ${isShuffling ? "animate-spin" : ""}`} />
                  Pick Another
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Winner Card */}
            <div className="p-6 rounded-2xl bg-card border border-primary/30 shadow-inner space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-primary/20 shrink-0 border-2 border-primary">
                  {selectedWinner.authorProfileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedWinner.authorProfileImageUrl}
                      alt={selectedWinner.authorDisplayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary font-bold text-xl">
                      {selectedWinner.authorDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-bold text-foreground">
                        {selectedWinner.authorDisplayName}
                      </span>
                      {selectedWinner.authorChannelUrl && (
                        <a
                          href={selectedWinner.authorChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          Channel <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedWinner.publishedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p
                    className="text-sm sm:text-base text-foreground font-medium bg-background/60 p-4 rounded-xl border border-border/50 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: selectedWinner.textDisplay }}
                  />

                  <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{selectedWinner.likeCount} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pool Statistics */}
            <div className="flex items-center justify-between text-xs text-muted-foreground p-3 rounded-lg bg-background/50 border border-border/40">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>
                  Pool Size: <strong>{getFilteredComments().length}</strong> eligible comments loaded in memory
                </span>
              </div>
              <span className="italic">Zero re-API quota used when re-picking</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
