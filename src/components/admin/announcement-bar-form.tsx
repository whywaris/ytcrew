"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnnouncementBarConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Save,
  Link as LinkIcon,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Sliders,
} from "lucide-react";

interface AnnouncementBarFormProps {
  initialConfig: AnnouncementBarConfig | null;
}

export function AnnouncementBarForm({ initialConfig }: AnnouncementBarFormProps) {
  const [id, setId] = React.useState<string | undefined>(initialConfig?.id);
  const [text, setText] = React.useState(
    initialConfig?.text || "🔥 Welcome to YT Crew! Discover 100% free creator tools designed to grow your YouTube channel."
  );
  const [linkUrl, setLinkUrl] = React.useState(initialConfig?.link_url || "");
  const [isActive, setIsActive] = React.useState(
    initialConfig ? initialConfig.is_active : true
  );

  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    if (!text.trim()) {
      setErrorMessage("Announcement text is required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        text: text.trim(),
        link_url: linkUrl.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      console.log("[Supabase Announcement Save] Payload:", payload);

      if (id) {
        // Update existing row
        const { data, error } = await supabase
          .from("announcement_bar")
          .update(payload)
          .eq("id", id)
          .select();

        if (error) {
          console.error("[Supabase Announcement Update Error]", error);
          throw new Error(error.message || "Failed to update announcement bar.");
        }

        console.log("[Supabase Announcement Update Success]", data);
        setSuccessMessage("Announcement bar updated successfully!");
      } else {
        // Insert new single row
        const { data, error } = await supabase
          .from("announcement_bar")
          .insert(payload)
          .select();

        if (error) {
          console.error("[Supabase Announcement Insert Error]", error);
          throw new Error(error.message || "Failed to create announcement bar.");
        }

        console.log("[Supabase Announcement Insert Success]", data);
        if (data && data[0]?.id) {
          setId(data[0].id);
        }
        setSuccessMessage("Announcement bar saved and activated!");
      }

      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      console.error("[Admin Announcement Save Caught Exception]", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Toast Notification Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error Saving Announcement Bar</p>
            <p className="text-xs mt-0.5 font-mono">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* 1. Live Public Site Preview */}
      <Card className="bg-[#12121c] border-[#252538] overflow-hidden shadow-xl shadow-black/20">
        <CardHeader className="pb-3 border-b border-[#1e1e2e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">
                  Live Public Preview
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Simulated top-of-page banner appearance on public routes.
                </CardDescription>
              </div>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                isActive
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-[#181824] border-[#2b2b3d] text-muted-foreground"
              }`}
            >
              {isActive ? "● Live on Site" : "○ Hidden from Public"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 bg-[#0a0a10]">
          {/* Simulated Browser Frame / Banner */}
          <div className="rounded-2xl overflow-hidden border border-[#2b2b3d] shadow-2xl bg-[#111119]">
            {/* macOS-style Window Titlebar */}
            <div className="bg-[#161622] px-4 py-2.5 flex items-center gap-2 border-b border-[#252538]">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="mx-auto text-[11px] font-mono text-muted-foreground bg-[#0d0d14] px-4 py-0.5 rounded-full border border-[#222232]">
                ytcrew.com
              </div>
            </div>

            {/* Announcement Banner Box */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-md transition-all">
              <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-90 animate-pulse text-amber-300" />
              <span className="truncate">{text || "Your announcement message will display here..."}</span>

              {linkUrl && (
                <span className="inline-flex items-center gap-1 font-bold underline underline-offset-2 ml-1 text-white hover:text-amber-200 shrink-0 transition-colors">
                  <span>Learn More</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </div>

            {/* Fake Website Header Mockup */}
            <div className="bg-[#111119] px-4 py-3 flex items-center justify-between border-t border-[#222234] opacity-80">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                  YT
                </div>
                <span className="font-extrabold text-xs text-white">YT Crew</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="hover:text-white transition-colors">Tools</span>
                <span className="hover:text-white transition-colors">Blog</span>
                <span className="hover:text-white transition-colors">About</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Announcement Settings Form */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Announcement Configuration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Broadcast sitewide updates, tool launches, guides, or special notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {/* Text Message Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Announcement Message *
            </label>
            <Input
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 🎉 We just launched the YouTube Timestamp Link Generator! Try it free."
              className="bg-[#0e0e16] border-[#2b2b3d] text-sm font-medium text-white placeholder:text-[#64748b] focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
            />
            <p className="text-[11px] text-slate-400">
              Keep it concise (100–140 characters) so it fits neatly across mobile and desktop screens.
            </p>
          </div>

          {/* Link URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Target Link URL (Optional)</span>
            </label>
            <Input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="e.g. /youtube-timestamp-link-generator or https://..."
              className="font-mono text-sm bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
            />
            <p className="text-[11px] text-slate-400">
              If provided, clicking the announcement banner will navigate visitors to this destination.
            </p>
          </div>

          {/* Status Toggle */}
          <div className="pt-4 border-t border-[#222234] flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-white">
                Activate Announcement Bar
              </label>
              <p className="text-xs text-slate-400">
                Turn on to display this banner publicly across all website pages.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                isActive ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-md shadow-amber-500/30" : "bg-[#222234] border-[#313148]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/" target="_blank" rel="noopener noreferrer">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-white hover:bg-[#1a1a28]"
          >
            <span>View Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>

        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-xl shadow-amber-500/25"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Announcement...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Announcement</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
