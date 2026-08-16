import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementBarForm } from "@/components/admin/announcement-bar-form";
import { AnnouncementBarConfig } from "@/types";
import { Megaphone, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Announcement Bar | YT Crew Admin",
};

export default async function AdminAnnouncementPage() {
  const supabase = await createClient();

  // Fetch the single announcement bar config row
  const { data, error } = await supabase
    .from("announcement_bar")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Supabase Announcement Fetch Error]", error);
  }

  const initialConfig = data as AnnouncementBarConfig | null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252538] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Announcement Bar
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Sitewide Alert</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Configure sitewide banner announcements, new tool alerts, and promotional links.
            </p>
          </div>
        </div>
      </div>

      {/* Form & Live Preview */}
      <AnnouncementBarForm initialConfig={initialConfig} />
    </div>
  );
}
