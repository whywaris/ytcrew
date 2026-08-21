import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { DbCategory } from "@/types";
import { FolderTree, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  // Fetch categories with related tools to compute count
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, description, created_at, tools(id)")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("[Supabase Categories Fetch Error]", categoriesError);
  }

  // Format categories with count of assigned tools
  const categories: DbCategory[] = (categoriesData || []).map(
    (cat: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      created_at?: string;
      tools?: Array<{ id: string }>;
    }) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      created_at: cat.created_at,
      tools_count: Array.isArray(cat.tools) ? cat.tools.length : 0,
    })
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252538] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
            <FolderTree className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Categories
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Taxonomy</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Organize YouTube creator tools and resources into navigable categories.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Manager Table & Modal View */}
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
