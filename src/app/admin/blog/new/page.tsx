import type { Metadata } from "next";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export const metadata: Metadata = {
  title: "New Post | YT Crew Admin",
};

export default function AdminNewBlogPostPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <BlogPostForm />
    </div>
  );
}
