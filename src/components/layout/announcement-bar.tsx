import { createPublicClient } from "@/lib/supabase/server";
import { AnnouncementBarClient } from "./announcement-bar-client";
import { AnnouncementBarConfig } from "@/types";

export async function AnnouncementBar() {
  try {
    const supabase = createPublicClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("announcement_bar")
      .select("*")
      .limit(1)
      .maybeSingle();

    const config = data as AnnouncementBarConfig | null;

    return <AnnouncementBarClient config={config} />;
  } catch (err) {
    console.warn("Could not load announcement bar:", err);
    return null;
  }
}
