"use client";

import * as React from "react";
import { z } from "zod";
import {
  Link2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Sparkles,
  CheckCheck,
  Video,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * ============================================================================
 * BACKLINK SITE TEMPLATES CONFIGURATION
 * ============================================================================
 * Static list of ~35 placeholder domain templates for simulated backlink generation.
 * Each template contains '{id}' as the placeholder for the YouTube Video ID.
 * Edit, add, or replace domain patterns below as needed.
 */
export const BACKLINK_SITE_TEMPLATES: string[] = [
  "https://vidindex.net/watch?v={id}",
  "https://tubestat.io/video/{id}",
  "https://webvideohub.org/embed/{id}",
  "https://streamdirectory.cc/v/{id}",
  "https://mediashare.app/watch/{id}",
  "https://clipranker.com/item/{id}",
  "https://openvideobase.net/video.php?id={id}",
  "https://trendingspot.co/watch?v={id}",
  "https://creatorstream.tv/embed/{id}",
  "https://searchtube.org/view/{id}",
  "https://videoaggregator.io/shorts/{id}",
  "https://cloudtube.me/watch?v={id}",
  "https://hyperstream.info/v/{id}",
  "https://playlink.online/video/{id}",
  "https://videopin.io/pin/{id}",
  "https://streamradar.org/watch?v={id}",
  "https://tubepulse.net/video.php?id={id}",
  "https://viewtracker.cc/v/{id}",
  "https://channelboost.me/watch/{id}",
  "https://socialvideohub.com/embed/{id}",
  "https://metaflare.tv/watch?v={id}",
  "https://streamvault.org/video/{id}",
  "https://fasttube.online/shorts/{id}",
  "https://videonavigator.net/item/{id}",
  "https://globalstream.io/watch?v={id}",
  "https://webclips.app/view/{id}",
  "https://soundandvideo.cc/player/{id}",
  "https://creatorindexer.com/v/{id}",
  "https://streammatrix.org/watch.php?v={id}",
  "https://tubepush.io/embed/{id}",
  "https://smartvideo.online/watch/{id}",
  "https://videometrix.net/v/{id}",
  "https://nexustube.cc/watch?v={id}",
  "https://viralclipshub.org/video/{id}",
  "https://linkstreamer.io/view/{id}",
];

const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

const backlinkFormSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video URL.")
    .refine((val) => {
      const trimmed = val.trim();
      return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
    }, "Please enter a valid YouTube video URL or 11-character video ID."),
});

type RowStatus = "pending" | "processing" | "success" | "failed";

interface BacklinkRow {
  id: number;
  url: string;
  status: RowStatus;
}

export function YouTubeVideoBacklinkGenerator() {
  const [url, setUrl] = React.useState("");
  const [videoId, setVideoId] = React.useState<string>("");
  const [rows, setRows] = React.useState<BacklinkRow[]>([]);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const simulationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clean up any ongoing timer on unmount
  React.useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      }
    };
  }, []);

  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  const startSimulation = (vidId: string) => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
    }

    // Pre-calculate randomized target statuses (~75-80% success rate)
    const preparedItems = BACKLINK_SITE_TEMPLATES.map((template, idx) => ({
      id: idx + 1,
      url: template.replace("{id}", vidId),
      targetStatus: (Math.random() < 0.78 ? "success" : "failed") as "success" | "failed",
    }));

    // Initialize all rows with pending, first one in processing
    setRows(
      preparedItems.map((item, idx) => ({
        id: item.id,
        url: item.url,
        status: idx === 0 ? "processing" : "pending",
      }))
    );
    setIsSimulating(true);

    const processStep = (stepIndex: number) => {
      setRows((prevRows) => {
        const nextRows = [...prevRows];
        // 1. Resolve current row
        if (stepIndex < preparedItems.length) {
          nextRows[stepIndex] = {
            id: preparedItems[stepIndex].id,
            url: preparedItems[stepIndex].url,
            status: preparedItems[stepIndex].targetStatus,
          };
        }
        // 2. Set next row to processing
        if (stepIndex + 1 < preparedItems.length) {
          nextRows[stepIndex + 1] = {
            id: preparedItems[stepIndex + 1].id,
            url: preparedItems[stepIndex + 1].url,
            status: "processing",
          };
        }
        return nextRows;
      });

      const nextIndex = stepIndex + 1;
      if (nextIndex < preparedItems.length) {
        const delay = Math.floor(Math.random() * 50) + 110;
        simulationTimerRef.current = setTimeout(() => processStep(nextIndex), delay);
      } else {
        setIsSimulating(false);
      }
    };

    simulationTimerRef.current = setTimeout(() => processStep(0), 120);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = backlinkFormSchema.safeParse({ url });
    if (!validation.success) {
      setError(validation.error.issues?.[0]?.message || "Invalid YouTube video URL");
      return;
    }

    const vidId = extractVideoId(url);
    if (!vidId) {
      setError("Could not extract a valid YouTube video ID.");
      return;
    }

    setVideoId(vidId);
    startSimulation(vidId);
  };

  const handleReset = () => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
    }
    setUrl("");
    setVideoId("");
    setRows([]);
    setIsSimulating(false);
    setError(null);
    setCopiedId(null);
    setCopiedAll(false);
  };

  const handleGenerateAgain = () => {
    if (!videoId) return;
    startSimulation(videoId);
  };

  const handleCopySingle = async (linkUrl: string, id: number) => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleCopyAll = async () => {
    if (rows.length === 0) return;
    try {
      const allUrls = rows.map((r) => r.url).join("\n");
      await navigator.clipboard.writeText(allUrls);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy all links", err);
    }
  };

  // Status counters
  const successCount = rows.filter((r) => r.status === "success").length;
  const failedCount = rows.filter((r) => r.status === "failed").length;
  const processedCount = successCount + failedCount;
  const totalCount = rows.length;
  const progressPercent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Link2 className="h-5 w-5 text-primary" />
            <span>YouTube Backlink Generator</span>
          </CardTitle>
          <CardDescription>
            Simulate submitting your YouTube video across authoritative aggregator, player, and directory networks to boost video discoverability.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="backlink-video-url"
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
                  id="backlink-video-url"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9 bg-background/80"
                  disabled={isSimulating}
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
              <Button
                type="submit"
                size="lg"
                className="flex-1 gap-2"
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Submissions ({processedCount}/{totalCount})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Backlinks</span>
                  </>
                )}
              </Button>

              {rows.length > 0 && !isSimulating && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleGenerateAgain}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Generate Again</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <span>Reset</span>
                  </Button>
                </>
              )}
            </div>
          </form>

          {/* Results Section */}
          {rows.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
              {/* Progress & Summary Bar */}
              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      Simulated Submission Results
                    </span>
                    {isSimulating && (
                      <Badge variant="default" className="gap-1 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Submitting...</span>
                      </Badge>
                    )}
                    {!isSimulating && processedCount === totalCount && (
                      <Badge variant="success" className="gap-1">
                        <Check className="h-3 w-3" />
                        <span>Completed</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border">
                      Total: <strong>{totalCount}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-success/15 text-success border border-success/20">
                      Success: <strong>{successCount}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-destructive/15 text-destructive border border-destructive/20">
                      Failed: <strong>{failedCount}</strong>
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-200 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Video ID: {videoId}</span>
                    <span>{progressPercent}% Complete ({processedCount} / {totalCount})</span>
                  </div>
                </div>
              </div>

              {/* Action Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {rows.length} simulated backlink endpoints
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  disabled={isSimulating || rows.length === 0}
                  className="gap-1.5 text-xs h-8"
                >
                  {copiedAll ? (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-success" />
                      <span className="text-success font-semibold">All URLs Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy All URLs</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Backlinks Table */}
              <div className="rounded-xl border border-border overflow-hidden bg-card/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/60 text-muted-foreground font-medium text-xs border-b border-border">
                      <tr>
                        <th className="py-3 px-3 sm:px-4 w-12 text-center">#</th>
                        <th className="py-3 px-3 sm:px-4">Backlink URL</th>
                        <th className="py-3 px-3 sm:px-4 w-32 sm:w-36 text-center">Status</th>
                        <th className="py-3 px-3 sm:px-4 w-16 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {rows.map((row) => {
                        const isCopied = copiedId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            {/* Row Number */}
                            <td className="py-2.5 px-3 sm:px-4 text-center font-mono text-xs text-muted-foreground">
                              {row.id}
                            </td>

                            {/* Constructed URL */}
                            <td className="py-2.5 px-3 sm:px-4">
                              <span className="font-mono text-xs text-foreground/90 select-all break-all hover:text-primary transition-colors">
                                {row.url}
                              </span>
                            </td>

                            {/* Status Column */}
                            <td className="py-2.5 px-3 sm:px-4 text-center">
                              {row.status === "pending" && (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] font-normal text-muted-foreground"
                                >
                                  Pending
                                </Badge>
                              )}

                              {row.status === "processing" && (
                                <Badge
                                  variant="default"
                                  className="text-[11px] gap-1 animate-pulse bg-primary/20 text-primary border-primary/30"
                                >
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Processing</span>
                                </Badge>
                              )}

                              {row.status === "success" && (
                                <Badge
                                  variant="success"
                                  className="text-[11px] gap-1 font-semibold"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-success" />
                                  <span>Success</span>
                                </Badge>
                              )}

                              {row.status === "failed" && (
                                <Badge
                                  variant="destructive"
                                  className="text-[11px] gap-1 font-semibold"
                                >
                                  <XCircle className="h-3 w-3 text-destructive" />
                                  <span>Failed</span>
                                </Badge>
                              )}
                            </td>

                            {/* Copy Action */}
                            <td className="py-2.5 px-3 sm:px-4 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopySingle(row.url, row.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Copy URL"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-success" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
