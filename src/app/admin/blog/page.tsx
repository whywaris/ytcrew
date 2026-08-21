import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BlogPostsTable } from "@/components/admin/blog-posts-table";
import { DbBlogPost } from "@/types";
import { BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Blog",
};

export default async function AdminManageBlogPage() {
  const supabase = await createClient();

  const { data: postsData, error: postsError } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Error loading blog posts for admin:", postsError);
  }

  const posts = (postsData as DbBlogPost[]) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252538] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-md shadow-rose-500/10">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Manage Blog
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Sparkles className="h-3 w-3" />
                <span>Editorial</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Create, edit, publish, and manage creator guides, tutorials, and tips.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Table View */}
      <BlogPostsTable initialPosts={posts} />
    </div>
  );
}
