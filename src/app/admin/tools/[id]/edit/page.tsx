import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ToolEditForm } from "@/components/admin/tool-edit-form";
import { DbTool, DbCategory } from "@/types";

export const metadata: Metadata = {
  title: "Edit Tool",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditToolPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch tool data by ID
  const { data: toolData, error: toolError } = await supabase
    .from("tools")
    .select("*")
    .eq("id", id)
    .single();

  if (toolError || !toolData) {
    console.error("Error fetching tool for edit:", toolError);
    notFound();
  }

  // Fetch all categories for the dropdown
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const tool = toolData as DbTool;
  const categories = (categoriesData as DbCategory[]) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <ToolEditForm tool={tool} categories={categories} />
    </div>
  );
}
