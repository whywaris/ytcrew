"use client";

import * as React from "react";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  Calculator,
  Eye,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const YPP_WATCH_TIME_GOAL = 4000; // 4,000 public watch hours

type CalculationMode = "views_duration" | "direct_hours";

export function YouTubeWatchTimeCalculator() {
  const [calcMode, setCalcMode] = React.useState<CalculationMode>("views_duration");
  const [views, setViews] = React.useState<string>("25000");
  const [durationMinutes, setDurationMinutes] = React.useState<string>("4");
  const [durationSeconds, setDurationSeconds] = React.useState<string>("30");
  const [directHours, setDirectHours] = React.useState<string>("1875");

  const [totalHours, setTotalHours] = React.useState<number>(1875);
  const [totalMinutes, setTotalMinutes] = React.useState<number>(112500);
  const [progressPercent, setProgressPercent] = React.useState<number>(46.88);
  const [remainingHours, setRemainingHours] = React.useState<number>(2125);
  const [viewsNeeded, setViewsNeeded] = React.useState<number>(28334);
  const [error, setError] = React.useState<string | null>(null);

  // Recalculate watch time
  const calculateWatchTime = React.useCallback(() => {
    setError(null);

    let calculatedHours = 0;
    let avgDurationTotalSec = 0;

    if (calcMode === "views_duration") {
      const vNum = parseFloat(views.replace(/,/g, "")) || 0;
      const mNum = parseInt(durationMinutes, 10) || 0;
      const sNum = parseInt(durationSeconds, 10) || 0;

      if (vNum < 0 || mNum < 0 || sNum < 0) {
        setError("Values cannot be negative.");
        return;
      }

      avgDurationTotalSec = mNum * 60 + sNum;
      const totalWatchSeconds = vNum * avgDurationTotalSec;
      calculatedHours = totalWatchSeconds / 3600;
    } else {
      const hNum = parseFloat(directHours.replace(/,/g, "")) || 0;
      if (hNum < 0) {
        setError("Hours cannot be negative.");
        return;
      }
      calculatedHours = hNum;
    }

    const calculatedMins = Math.round(calculatedHours * 60);
    const progress = Math.min(100, (calculatedHours / YPP_WATCH_TIME_GOAL) * 100);
    const remaining = Math.max(0, YPP_WATCH_TIME_GOAL - calculatedHours);

    // Calculate views needed to reach 4000 hrs if in views mode and duration > 0
    let needed = 0;
    if (calcMode === "views_duration" && avgDurationTotalSec > 0 && remaining > 0) {
      needed = Math.ceil((remaining * 3600) / avgDurationTotalSec);
    } else if (remaining > 0) {
      // Assuming typical 4 min avg duration default
      needed = Math.ceil((remaining * 3600) / 240);
    }

    setTotalHours(calculatedHours);
    setTotalMinutes(calculatedMins);
    setProgressPercent(progress);
    setRemainingHours(remaining);
    setViewsNeeded(needed);
  }, [calcMode, views, durationMinutes, durationSeconds, directHours]);

  React.useEffect(() => {
    calculateWatchTime();
  }, [calculateWatchTime]);

  const isMonetized = totalHours >= YPP_WATCH_TIME_GOAL;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Calculator className="h-5 w-5 text-primary" />
            <span>YouTube Watch Time & Monetization Calculator</span>
          </CardTitle>
          <CardDescription>
            Calculate your channel&apos;s total watch time hours and track exact progress toward the YouTube Partner Program (YPP) 4,000 public watch hours requirement.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-border p-1 bg-secondary/30">
            <button
              type="button"
              onClick={() => setCalcMode("views_duration")}
              className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                calcMode === "views_duration"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calculate by Views & Average Duration
            </button>
            <button
              type="button"
              onClick={() => setCalcMode("direct_hours")}
              className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                calcMode === "direct_hours"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Check Progress by Total Hours
            </button>
          </div>

          {/* Form Inputs */}
          {calcMode === "views_duration" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Total Video Views</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  placeholder="e.g. 25000"
                  className="font-mono text-base bg-background/80"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Duration (Minutes)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="4"
                  className="font-mono text-base bg-background/80"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Duration (Seconds)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="30"
                  className="font-mono text-base bg-background/80"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Current Watch Time in Hours</span>
              </label>
              <Input
                type="number"
                min="0"
                value={directHours}
                onChange={(e) => setDirectHours(e.target.value)}
                placeholder="e.g. 1875"
                className="font-mono text-lg bg-background/80"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Summary Dashboard */}
          <div className="pt-6 border-t border-border space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Watch Time */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Total Watch Time
                </span>
                <div className="text-2xl font-bold font-mono text-primary">
                  {totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hrs
                </div>
                <span className="text-xs text-muted-foreground">
                  ~{totalMinutes.toLocaleString()} minutes
                </span>
              </div>

              {/* Progress Percentage */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  YPP Progress
                </span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {progressPercent.toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground">Target: 4,000 hrs</span>
              </div>

              {/* Remaining Hours */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Hours Remaining
                </span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {remainingHours <= 0
                    ? "Goal Reached!"
                    : `${remainingHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hrs`}
                </div>
                <span className="text-xs text-muted-foreground">
                  {remainingHours <= 0 ? "Eligible for YPP" : "Needed in 365 days"}
                </span>
              </div>

              {/* Views Needed */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  Views Needed
                </span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {remainingHours <= 0 ? "0" : `~${viewsNeeded.toLocaleString()}`}
                </div>
                <span className="text-xs text-muted-foreground">At your current avg retention</span>
              </div>
            </div>

            {/* Visual Monetization Progress Bar */}
            <div className="p-5 rounded-xl border border-border bg-card/80 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award
                    className={`h-5 w-5 ${isMonetized ? "text-success fill-success" : "text-primary"}`}
                  />
                  <span className="text-sm font-bold text-foreground">
                    4,000 Watch Hours Monetization Threshold
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isMonetized
                      ? "bg-success/20 text-success border border-success/40"
                      : "bg-primary/20 text-primary border border-primary/40"
                  }`}
                >
                  {isMonetized ? "Qualified for YPP 🎉" : `${(4000 - remainingHours).toFixed(0)} / 4,000 hrs`}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-4 rounded-full bg-secondary overflow-hidden relative border border-border">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isMonetized ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>0 hrs</span>
                <span>1,000 hrs (25%)</span>
                <span>2,000 hrs (50%)</span>
                <span>3,000 hrs (75%)</span>
                <span className="font-semibold text-foreground">4,000 hrs (100%)</span>
              </div>
            </div>

            {/* Monetization Status Note */}
            {isMonetized ? (
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-bold">Congratulations! You meet the Watch Time requirement!</p>
                  <p className="text-success/90">
                    Your channel has accumulated over 4,000 public watch hours in the past 12 months. Make sure you also meet the 1,000 subscribers requirement and 2-step verification to submit your application in YouTube Studio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-muted-foreground flex items-start gap-3 text-xs">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>YouTube Monetization Rule:</strong> YouTube requires <strong>4,000 valid public watch hours</strong> within the last 365 consecutive days. Watch hours from Shorts, private videos, unlisted videos, and ad campaigns do not count toward this total.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
