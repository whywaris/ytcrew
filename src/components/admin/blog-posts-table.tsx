"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DbBlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface BlogPostsTableProps {
  initialPosts: DbBlogPost[];
}

export function BlogPostsTable({ initialPosts }: BlogPostsTableProps) {
  const [posts, setPosts] = React.useState<DbBlogPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [postToDelete, setPostToDelete] = React.useState<DbBlogPost | null>(null);

  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  // Extract unique categories from posts
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  // Statistics
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.length - publishedCount;

  // Filter posts
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : post.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ? true : post.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [posts, searchQuery, statusFilter, categoryFilter]);

  // Handle instant status toggle
  const handleToggleStatus = async (post: DbBlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    const previousPosts = [...posts];

    // Set published_at if transitioning to published for the first time
    const updatedPublishedAt =
      nextStatus === "published" && !post.published_at
        ? new Date().toISOString()
        : post.published_at;

    // 1. Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              status: nextStatus,
              published_at: updatedPublishedAt,
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );

    setUpdatingId(post.id);
    setNotification(null);

    try {
      // 2. Persist in Supabase
      const { error } = await supabase
        .from("blog_posts")
        .update({
          status: nextStatus,
          published_at: updatedPublishedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (error) {
        throw error;
      }

      setNotification({
        type: "success",
        message: `Post "${post.title}" changed to ${nextStatus}.`,
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error("Failed to update post status in Supabase:", err);
      // Revert optimistic update
      setPosts(previousPosts);
      setNotification({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update blog post status in database.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Delete Confirmation & Execution
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    const idToDelete = postToDelete.id;
    setDeletingId(idToDelete);
    setNotification(null);

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", idToDelete);

      if (error) {
        throw error;
      }

      setPosts((prev) => prev.filter((p) => p.id !== idToDelete));
      setNotification({
        type: "success",
        message: `Post "${postToDelete.title}" deleted successfully.`,
      });
      setPostToDelete(null);

      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error("Failed to delete post:", err);
      setNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to delete post.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-0.5 text-muted-foreground hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Quick Stats Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141420] border border-[#252538] text-xs">
          <span className="text-muted-foreground">Total Articles:</span>
          <span className="font-bold text-white">{posts.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium">Published:</span>
          <span className="font-bold text-emerald-300">{publishedCount}</span>
        </div>
        {draftCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-medium">Drafts:</span>
            <span className="font-bold text-amber-300">{draftCount}</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#141422] border border-[#2e2e42] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Confirm Delete Post
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">
                &ldquo;{postToDelete.title}&rdquo;
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#222234]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPostToDelete(null)}
                disabled={deletingId === postToDelete.id}
                className="bg-[#1a1a2a] border-[#2e2e42] text-muted-foreground hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeletePost}
                disabled={deletingId === postToDelete.id}
                className="gap-1.5 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
              >
                {deletingId === postToDelete.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Post</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#141420] p-4 rounded-2xl border border-[#252538]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4 text-rose-400/80" />
          </div>
          <Input
            placeholder="Search posts by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0e0e16] border-[#2b2b3d] focus-visible:border-rose-500/50 focus-visible:ring-rose-500/20 text-sm"
          />
        </div>

        {/* Dropdowns & New Post Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-rose-400 hidden sm:inline-block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* New Post Button */}
          <Link href="/admin/blog/new">
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#252538] bg-[#12121c] overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181826] text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-[#252538]">
              <tr>
                <th className="px-6 py-4">Title & Excerpt</th>
                <th className="px-6 py-4">Article Path</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Published Date</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2d]">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isUpdating = updatingId === post.id;
                  const isPublished = post.status === "published";

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-[#1a1a28] transition-colors group"
                    >
                      {/* Title & Excerpt */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                          {post.title}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {post.excerpt || "No excerpt provided"}
                        </p>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-300 bg-[#161624] px-2.5 py-1 rounded-lg border border-[#262638]">
                          <span>/blog/{post.slug}</span>
                        </span>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(post)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none disabled:opacity-50 ${
                            isPublished
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-xs shadow-emerald-500/10"
                              : "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-xs shadow-amber-500/10"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin text-rose-400" />
                          ) : (
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isPublished
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-amber-400"
                              }`}
                            />
                          )}
                          <span className="capitalize">{post.status}</span>
                        </button>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {post.category ? (
                          <span className="px-2.5 py-1 rounded-md bg-[#1c1626] border border-rose-500/20 text-rose-300 font-medium text-xs">
                            {post.category}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {post.published_at ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-rose-400/80" />
                            <span>
                              {new Date(post.published_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Not published</span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {toolDateFormat(post.updated_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 px-2.5 gap-1.5 text-xs bg-[#1a1a2a] hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-[#2b2b3f] transition-all"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPostToDelete(post)}
                            className="h-8 px-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete Post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="h-8 w-8 text-rose-400/40" />
                      <p className="font-bold text-white">No articles found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchQuery
                          ? `No articles matched your search query "${searchQuery}".`
                          : "No blog posts currently published or drafted."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#161624] border-t border-[#252538] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredPosts.length}</strong> of{" "}
            <strong className="text-white">{posts.length}</strong> post(s)
          </span>
        </div>
      </div>
    </div>
  );
}

function toolDateFormat(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
