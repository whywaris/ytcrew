import { createPublicClient } from "@/lib/supabase/server";
import { AdSlotRenderer } from "./ad-slot-renderer";
import { DbAdSlot } from "@/types";

export interface AdSlotProps {
  slotName: string;
}

/**
 * Server Component that queries the Supabase "ad_slots" table by slot_name.
 * If active and configured with ad_code, renders the AdSlotRenderer.
 * Fails silently and returns null if no active ad is found.
 */
export async function AdSlot({ slotName }: AdSlotProps) {
  try {
    const supabase = createPublicClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("ad_slots")
      .select("*")
      .eq("slot_name", slotName)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const slot = data as DbAdSlot | null;

    if (!slot || !slot.is_active || !slot.ad_code) {
      return null;
    }

    return (
      <AdSlotRenderer
        slotName={slotName}
        adCode={slot.ad_code}
        isActive={slot.is_active}
      />
    );
  } catch (err) {
    console.warn(`[AdSlot] Could not load ad slot "${slotName}":`, err);
    return null;
  }
}

export default AdSlot;
