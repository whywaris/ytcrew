"use client";

import * as React from "react";
import {
  Clock,
  Eye,
  AlertCircle,
  Copy,
  Check,
  Timer,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function YouTubeWatchTimeCalculator() {
  // Input State
  const [targetHours, setTargetHours] = React.useState<string>("4000");
  const [targetDurationMinutes, setTargetDurationMinutes] = React.useState<string>("3");
  const [targetDurationSeconds, setTargetDurationSeconds] = React.useState<string>("0");

  // Output State (Hidden until Calculate button is clicked)
  const [hasCalculated, setHasCalculated] = React.useState<boolean>(false);
  const [calcResultViews, setCalcResultViews] = React.useState<number>(80000);
  const [calcResultHours, setCalcResultHours] = React.useState<number>(4000);
  const [calcResultMinutes, setCalcResultMinutes] = React.useState<number>(3);
  const [calcResultSeconds, setCalcResultSeconds] = React.useState<number>(0);

  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Trigger Calculation
  const handleCalculateRequiredViews = () => {
    setError(null);

    const rawHours = targetHours.trim();
    const hNum = rawHours === "" ? 4000 : parseFloat(rawHours.replace(/,/g, ""));

    const rawMins = targetDurationMinutes.trim();
    const mNum = rawMins === "" ? 3 : parseInt(rawMins, 10);

    const rawSecs = targetDurationSeconds.trim();
    const sNum = rawSecs === "" ? 0 : parseInt(rawSecs, 10);

    if (isNaN(hNum) || hNum < 0 || isNaN(mNum) || mNum < 0 || isNaN(sNum) || sNum < 0) {
      setError("Please enter valid positive numbers.");
      return;
    }

    const totalAvgSec = mNum * 60 + sNum;
    if (totalAvgSec <= 0) {
      setError("Average watch duration must be greater than 0 seconds.");
      return;
    }

    const totalTargetSecs = hNum * 3600;
    const needed = Math.ceil(totalTargetSecs / totalAvgSec);

    setCalcResultHours(hNum);
    setCalcResultMinutes(mNum);
    setCalcResultSeconds(sNum);
    setCalcResultViews(needed);
    setHasCalculated(true);
  };

  const handleCopySummary = (summaryText: string) => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardContent className="p-6 space-y-6">
          {/* 1. Watch Hours Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>Watch Hours</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Leave empty to use default value which is 4000 Hours
            </p>
            <Input
              type="number"
              min="0"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="4000"
              className="font-mono text-base bg-background/80"
            />
          </div>

          {/* 2. Average Watch Time Section */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-primary" />
                <span>Average Watch Time of Your Videos</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Default average watch time is 3 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minutes
                </label>
                <Input
                  type="number"
                  min="0"
                  value={targetDurationMinutes}
                  onChange={(e) => setTargetDurationMinutes(e.target.value)}
                  placeholder="3"
                  className="font-mono text-base bg-background/80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Seconds
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={targetDurationSeconds}
                  onChange={(e) => setTargetDurationSeconds(e.target.value)}
                  placeholder="0"
                  className="font-mono text-base bg-background/80"
                />
              </div>
            </div>
          </div>

          {/* 3. Primary Button */}
          <div>
            <Button
              type="button"
              variant="primary"
              onClick={handleCalculateRequiredViews}
              className="w-full sm:w-auto font-semibold gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Calculate Required Views</span>
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 4. Results Box: ONLY visible after clicking calculate */}
          {hasCalculated && (
            <div className="pt-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="p-5 rounded-xl border border-primary/40 bg-primary/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-primary" />
                    <span>Views Needed</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopySummary(
                        `To get ${calcResultHours.toLocaleString()} hours of watch time, you'll need approximately ${calcResultViews.toLocaleString()} views at ${calcResultMinutes} minutes ${calcResultSeconds} seconds average watch time.`
                      )
                    }
                    className="gap-1.5 text-xs font-medium h-7 px-2.5 bg-background/60"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Result</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">
                  {calcResultViews.toLocaleString()} views
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  To get <strong className="text-foreground font-semibold">{calcResultHours.toLocaleString()}</strong> hours of watch time, you&apos;ll need approximately{" "}
                  <strong className="text-primary font-semibold">{calcResultViews.toLocaleString()}</strong> views at{" "}
                  <strong className="text-foreground font-semibold">
                    {calcResultMinutes} {calcResultMinutes === 1 ? "minute" : "minutes"}
                    {calcResultSeconds > 0 ? ` ${calcResultSeconds} seconds` : ""}
                  </strong>{" "}
                  average watch time.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
