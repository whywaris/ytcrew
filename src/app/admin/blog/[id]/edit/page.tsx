import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { DbBlogPost } from "@/types";

export const metadata: Metadata = {
  title: "Edit Post",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: postData, error: postError } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (postError || !postData) {
    console.error("Error fetching blog post for edit:", postError);
    notFound();
  }

  const post = postData as DbBlogPost;

  return (
    <div className="max-w-4xl mx-auto">
      <BlogPostForm post={post} />
    </div>
  );
}
