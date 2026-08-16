"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DbBlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Save,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Search,
  PenTool,
} from "lucide-react";

interface BlogPostFormProps {
  post?: DbBlogPost; // undefined when creating a new post
}

// Helper to convert title to URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(post?.id);

  const originalSlug = post?.slug || "";

  // Form State
  const [title, setTitle] = React.useState(post?.title || "");
  const [slug, setSlug] = React.useState(post?.slug || "");
  const [isAutoSlug, setIsAutoSlug] = React.useState(!isEditing);

  const [excerpt, setExcerpt] = React.useState(post?.excerpt || "");
  const [content, setContent] = React.useState(post?.content || "");
  const [featuredImage, setFeaturedImage] = React.useState(
    post?.featured_image || ""
  );
  const [category, setCategory] = React.useState(post?.category || "Guides");
  const [status, setStatus] = React.useState<"draft" | "published">(
    post?.status || "draft"
  );

  const [seoTitle, setSeoTitle] = React.useState(post?.seo_title || "");
  const [seoDescription, setSeoDescription] = React.useState(
    post?.seo_description || ""
  );

  // Status & Feedback
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isAutoSlug) {
      setSlug(slugify(newTitle));
    }
  };

  const handleManualSlugRegenerate = () => {
    setSlug(slugify(title));
  };

  // Detect slug changes in edit mode
  const hasSlugChanged = isEditing && originalSlug !== slug.trim();

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    const formattedSlug = slug.trim().toLowerCase();

    if (!title.trim()) {
      setErrorMessage("Post title is required.");
      setSaving(false);
      return;
    }

    if (!formattedSlug) {
      setErrorMessage("Post slug is required.");
      setSaving(false);
      return;
    }

    if (!content.trim() || content === "<p></p>") {
      setErrorMessage("Post content is required. Please write your article body.");
      setSaving(false);
      return;
    }

    try {
      // Determine published_at timestamp
      let publishedAt = post?.published_at;
      if (status === "published" && !publishedAt) {
        publishedAt = new Date().toISOString();
      }

      // Payload matching exact Supabase blog_posts table schema
      const payload = {
        title: title.trim(),
        slug: formattedSlug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        featured_image: featuredImage.trim() || null,
        category: category.trim() || null,
        status: status,
        published_at: publishedAt,
        seo_title: seoTitle.trim() || title.trim(),
        seo_description: seoDescription.trim() || excerpt.trim(),
        updated_at: new Date().toISOString(),
      };

      console.log("[Supabase Blog Save] Submitting payload:", payload);

      if (isEditing && post?.id) {
        // Update existing blog post
        const { data, error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", post.id)
          .select();

        if (error) {
          console.error("[Supabase Blog Update Error]", error);
          throw new Error(error.message || "Failed to update blog post in database.");
        }

        console.log("[Supabase Blog Update Success]", data);
        setSuccessMessage("Post updated successfully! Redirecting...");
      } else {
        // Insert new blog post
        const { data, error } = await supabase
          .from("blog_posts")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error("[Supabase Blog Insert Error]", error);
          throw new Error(error.message || "Failed to create blog post in database.");
        }

        console.log("[Supabase Blog Insert Success]", data);
        setSuccessMessage("Post created successfully! Redirecting...");
      }

      setTimeout(() => {
        router.push("/admin/blog");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      console.error("[Admin Blog Save Caught Exception]", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving to database."
      );
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Sticky Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#0c0c10]/90 backdrop-blur-xl py-4 border-b border-[#252538]">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-[#141420] border-[#2b2b3d] text-muted-foreground hover:text-white"
              title="Back to Blog List"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{isEditing ? "Edit Post:" : "Create New Post"}</span>
                {isEditing && (
                  <span className="text-rose-400 truncate max-w-xs sm:max-w-md">
                    {title || post?.title}
                  </span>
                )}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `ID: ${post?.id}` : "Draft a new article for creators"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isEditing ? "Updating..." : "Publishing..."}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditing ? "Save Changes" : "Publish Post"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error Saving Blog Post</p>
            <p className="text-xs mt-0.5 font-mono">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* 1. Basic Post Details */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Post Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Title, URL slug, category, and publication status.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Article Title *
            </label>
            <Input
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. How to Add Timestamps to YouTube Videos in 2026"
              className="bg-[#0e0e16] border-[#2b2b3d] text-base font-medium text-white placeholder:text-[#64748b] focus-visible:border-rose-500/50 focus-visible:ring-rose-500/20"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                URL Slug * (Route: /blog/{slug})
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAutoSlug(false);
                  handleManualSlugRegenerate();
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate from title</span>
              </button>
            </div>
            <Input
              required
              value={slug}
              onChange={(e) => {
                setIsAutoSlug(false);
                setSlug(slugify(e.target.value));
              }}
              placeholder="how-to-add-timestamps-to-youtube-videos"
              className="font-mono text-sm bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-rose-500/50 focus-visible:ring-rose-500/20"
            />
          </div>

          {/* Slug Change Warning on Edit */}
          {hasSlugChanged && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold">Warning:</strong> You are changing the route slug from{" "}
                <code className="bg-black/60 px-1.5 py-0.5 rounded font-mono text-amber-200">/blog/{originalSlug}</code> to{" "}
                <code className="bg-black/60 px-1.5 py-0.5 rounded font-mono text-amber-200">/blog/{slug}</code>. This will alter the live URL.
              </div>
            </div>
          )}

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Excerpt (Summary for Cards & Previews)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise 1-2 sentence preview summary of the post..."
              className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3.5 py-2.5 text-sm text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Guides, SEO, Tutorials, YouTube Tips"
                className="bg-[#0e0e16] border-[#2b2b3d] text-sm text-white placeholder:text-[#64748b] focus-visible:ring-rose-500/30"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "draft" | "published")
                }
                className="h-10 w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
              >
                <option value="draft">Draft (Unpublished)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Featured Image */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Featured Image
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                URL of the cover/banner image for this article.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Image URL
            </label>
            <Input
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/... or /images/blog/..."
              className="bg-[#0e0e16] border-[#2b2b3d] text-sm text-white placeholder:text-[#64748b] focus-visible:ring-violet-500/30"
            />
          </div>

          {featuredImage && (
            <div className="mt-2 p-2.5 border border-[#2e2e42] rounded-2xl bg-[#0e0e16] inline-block shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt="Featured preview"
                className="h-40 w-auto max-w-full rounded-xl object-cover border border-[#222234]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Article Content Body - WYSIWYG Rich Text Editor */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Article Content (Rich Text Editor) *
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Write and format your article with headings, lists, bold/italic styles, blockquotes, links, and images.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <RichTextEditor
            content={content}
            onChange={(html) => setContent(html)}
            placeholder="Write your article content here..."
          />
        </CardContent>
      </Card>

      {/* 4. Manual SEO Controls */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                SEO & OpenGraph Metadata
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Custom SEO title tag and description for search engines.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Custom SEO Title (leave blank to use Article Title)
            </label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. How to Add Timestamps to YouTube Videos - Complete Guide | YT Crew"
              className="bg-[#0e0e16] border-[#2b2b3d] text-sm text-white placeholder:text-[#64748b] focus-visible:ring-amber-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Custom SEO Meta Description (leave blank to use Excerpt)
            </label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Custom description for search engine SERP snippets..."
              className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3.5 py-2.5 text-sm text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Action */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/blog">
          <Button
            type="button"
            variant="outline"
            className="bg-[#141420] border-[#2b2b3d] text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-xl shadow-rose-500/25 font-bold"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isEditing ? "Save Changes" : "Publish Post"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
