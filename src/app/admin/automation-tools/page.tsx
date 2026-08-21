import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AutomationToolsManager } from "@/components/admin/automation-tools-manager";
import { DbAutomationTool } from "@/types";
import { Bot, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Automation Tools",
};

export default async function AdminAutomationToolsPage() {
  const supabase = await createClient();

  // Fetch automation tools
  const { data: toolsData, error: toolsError } = await supabase
    .from("automation_tools")
    .select("*")
    .order("created_at", { ascending: false });

  if (toolsError) {
    console.error("[Supabase Admin Automation Tools Fetch Error]", toolsError);
  }

  const tools = (toolsData as unknown as DbAutomationTool[]) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252538] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-500/10">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Automation Tools
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Affiliate Directory</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage external AI and software tools, affiliate links, categories, and featured placements.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Manager */}
      <AutomationToolsManager initialTools={tools} />
    </div>
  );
}
