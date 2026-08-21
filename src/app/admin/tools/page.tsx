import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ToolsListTable } from "@/components/admin/tools-list-table";
import { DbTool, DbCategory } from "@/types";
import { Wrench, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Tools",
};

export default async function AdminManageToolsPage() {
  const supabase = await createClient();

  // Fetch tools list with category relation
  const { data: toolsData, error: toolsError } = await supabase
    .from("tools")
    .select("*, categories(id, name)")
    .order("created_at", { ascending: false });

  // Fetch available categories for filtering/display
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (toolsError) {
    console.error("Error loading tools for admin:", toolsError);
  }

  const tools = (toolsData as unknown as DbTool[]) || [];
  const categories = (categoriesData as DbCategory[]) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252538] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Manage Tools
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Catalog</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Search, filter, toggle publishing statuses, and edit YouTube creator tools.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Table View */}
      <ToolsListTable initialTools={tools} categories={categories} />
    </div>
  );
}
