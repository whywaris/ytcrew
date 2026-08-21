import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdsManager } from "@/components/admin/ads-manager";
import { DbAdSlot } from "@/types";
import { DollarSign, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Ads Manager",
};

const DEFAULT_SLOTS = [
  "header_banner",
  "sidebar",
  "in_tool_result",
  "footer",
  "blog_content",
];

export default async function AdminAdsPage() {
  const supabase = await createClient();

  // 1. Fetch current ad slots from Supabase
  const { data: currentSlotsData, error: fetchError } = await supabase
    .from("ad_slots")
    .select("*")
    .order("slot_name", { ascending: true });

  if (fetchError) {
    console.error("[Supabase Ad Slots Fetch Error]", fetchError);
  }

  let slots = (currentSlotsData as DbAdSlot[]) || [];
  const existingSlotNames = new Set(slots.map((s) => s.slot_name));

  // 2. Identify any missing default slots to seed
  const missingSlots = DEFAULT_SLOTS.filter(
    (slotName) => !existingSlotNames.has(slotName)
  );

  if (missingSlots.length > 0) {
    console.log("[Supabase Ad Slots] Seeding missing slots:", missingSlots);

    const rowsToInsert = missingSlots.map((slot_name) => ({
      slot_name,
      type: "adsense",
      ad_code: null,
      is_active: false,
      updated_at: new Date().toISOString(),
    }));

    const { data: insertedSlots, error: insertError } = await supabase
      .from("ad_slots")
      .upsert(rowsToInsert, { onConflict: "slot_name", ignoreDuplicates: true })
      .select();

    if (!insertError && insertedSlots) {
      slots = [...slots, ...(insertedSlots as DbAdSlot[])].sort((a, b) =>
        a.slot_name.localeCompare(b.slot_name)
      );
    } else if (insertError) {
      console.error("[Supabase Ad Slots Seed Error]", insertError);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252538] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Ads Manager
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Monetization</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage Google AdSense units, direct sponsor scripts, and placement visibility.
            </p>
          </div>
        </div>
      </div>

      {/* Ads Manager Table & Modal Editor */}
      <AdsManager initialSlots={slots} />
    </div>
  );
}
