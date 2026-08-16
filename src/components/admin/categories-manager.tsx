"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DbCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  RefreshCw,
  X,
  ShieldAlert,
  Wrench,
} from "lucide-react";

// Helper to convert category name to URL-friendly slug
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

interface CategoriesManagerProps {
  initialCategories: DbCategory[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = React.useState<DbCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<DbCategory | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [isAutoSlug, setIsAutoSlug] = React.useState(true);

  // Deletion Modal State
  const [categoryToDelete, setCategoryToDelete] = React.useState<DbCategory | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Feedback State
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  // Filtered categories
  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => {
      const q = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    });
  }, [categories, searchQuery]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setIsAutoSlug(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (category: DbCategory) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || "");
    setIsAutoSlug(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Name change handler with auto-slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (isAutoSlug) {
      setFormSlug(slugify(val));
    }
  };

  // Save Category (Insert or Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const formattedSlug = formSlug.trim().toLowerCase();

    if (!formName.trim()) {
      setFormError("Category name is required.");
      setSaving(false);
      return;
    }

    if (!formattedSlug) {
      setFormError("Slug is required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        slug: formattedSlug,
        description: formDescription.trim() || null,
      };

      console.log("[Supabase Category Save] Payload:", payload);

      if (editingCategory) {
        // Update existing category
        const { data, error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id)
          .select();

        if (error) {
          console.error("[Supabase Category Update Error]", error);
          throw new Error(error.message || "Failed to update category.");
        }

        console.log("[Supabase Category Update Success]", data);

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? { ...c, ...payload, tools_count: c.tools_count || 0 }
              : c
          )
        );

        setNotification({
          type: "success",
          message: `Category "${formName.trim()}" updated successfully.`,
        });
      } else {
        // Insert new category
        const { data, error } = await supabase
          .from("categories")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error("[Supabase Category Insert Error]", error);
          throw new Error(error.message || "Failed to create category.");
        }

        console.log("[Supabase Category Insert Success]", data);

        if (data && data[0]) {
          setCategories((prev) => [
            ...prev,
            { ...data[0], tools_count: 0 },
          ]);
        }

        setNotification({
          type: "success",
          message: `Category "${formName.trim()}" created successfully.`,
        });
      }

      setIsModalOpen(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error("[Admin Category Save Caught Exception]", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Category Execution
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    // Guard: Block if tools are assigned
    if ((categoryToDelete.tools_count || 0) > 0) {
      return;
    }

    const idToDelete = categoryToDelete.id;
    setDeletingId(idToDelete);

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", idToDelete);

      if (error) {
        console.error("[Supabase Category Delete Error]", error);
        throw new Error(error.message || "Failed to delete category.");
      }

      setCategories((prev) => prev.filter((c) => c.id !== idToDelete));
      setNotification({
        type: "success",
        message: `Category "${categoryToDelete.name}" deleted successfully.`,
      });
      setCategoryToDelete(null);

      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error("Delete category error:", err);
      setNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to delete category.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Alert */}
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141422] border border-[#2e2e42] rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#252538] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <FolderTree className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg text-white">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Error Message */}
              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-mono">{formError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Category Name *
                </label>
                <Input
                  required
                  value={formName}
                  onChange={handleNameChange}
                  placeholder="e.g. Generators, Resizers, SEO Tools"
                  className="bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                  autoFocus
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoSlug(false);
                      setFormSlug(slugify(formName));
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Auto-generate</span>
                  </button>
                </div>
                <Input
                  required
                  value={formSlug}
                  onChange={(e) => {
                    setIsAutoSlug(false);
                    setFormSlug(slugify(e.target.value));
                  }}
                  placeholder="generators"
                  className="font-mono text-sm bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this category for navigation and browsing..."
                  className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3.5 py-2.5 text-sm text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#252538]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="bg-[#1a1a2a] border-[#2b2b3d] text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / In-Use Blocking Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#141422] border border-[#2e2e42] rounded-3xl p-6 shadow-2xl space-y-4">
            {/* Condition: Category has tools assigned -> BLOCK deletion */}
            {(categoryToDelete.tools_count || 0) > 0 ? (
              <>
                <div className="flex items-center gap-3 text-amber-400">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      Cannot Delete Category
                    </h3>
                    <p className="text-xs text-slate-400">
                      Active dependencies detected
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
                  This category currently has{" "}
                  <strong className="text-white">{categoryToDelete.tools_count} tool(s)</strong> assigned to
                  it. Please reassign or remove those tools first in{" "}
                  <strong className="text-white">Manage Tools</strong> before
                  deleting this category.
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#252538]">
                  <Link href="/admin/tools">
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs bg-[#1a1a2a] border border-[#2b2b3d] text-cyan-300 hover:bg-cyan-500/20">
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Go to Manage Tools</span>
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryToDelete(null)}
                    className="bg-[#1a1a2a] border-[#2b2b3d] text-slate-300 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              /* Condition: 0 tools -> Confirm Delete */
              <>
                <div className="flex items-center gap-3 text-red-400">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      Confirm Delete Category
                    </h3>
                    <p className="text-xs text-slate-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  Are you sure you want to permanently delete category{" "}
                  <strong className="text-white">
                    &ldquo;{categoryToDelete.name}&rdquo;
                  </strong>
                  ?
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#252538]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryToDelete(null)}
                    disabled={deletingId === categoryToDelete.id}
                    className="bg-[#1a1a2a] border-[#2b2b3d] text-slate-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteCategory}
                    disabled={deletingId === categoryToDelete.id}
                    className="gap-1.5 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
                  >
                    {deletingId === categoryToDelete.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Category</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter and Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#141420] p-4 rounded-2xl border border-[#252538]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4 text-emerald-400/80" />
          </div>
          <Input
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 text-sm"
          />
        </div>

        {/* Add Category Button */}
        <Button
          onClick={handleOpenAdd}
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Categories Table Container */}
      <div className="rounded-2xl border border-[#252538] bg-[#12121c] overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181826] text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-[#252538]">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Taxonomy Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Tools Assigned</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2d]">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const toolsCount = cat.tools_count || 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#1a1a28] transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-white group-hover:text-emerald-300 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                            <FolderTree className="h-3.5 w-3.5" />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-300 bg-[#161624] px-2.5 py-1 rounded-lg border border-[#262638]">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                        {cat.description || "—"}
                      </td>

                      {/* Tools Assigned Count */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                            toolsCount > 0
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-[#181824] border-[#2b2b3d] text-slate-400"
                          }`}
                        >
                          {toolsCount} {toolsCount === 1 ? "Tool" : "Tools"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(cat)}
                            className="h-8 px-2.5 gap-1 text-xs bg-[#1a1a2a] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-[#2b2b3f] transition-all"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCategoryToDelete(cat)}
                            className="h-8 px-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete Category"
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
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FolderTree className="h-8 w-8 text-emerald-400/40" />
                      <p className="font-bold text-white">
                        No categories found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchQuery
                          ? `No categories matched "${searchQuery}".`
                          : "Create your first category (e.g. Generators, Resizers, SEO Tools) using the button above."}
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
            Showing <strong className="text-white">{filteredCategories.length}</strong> of{" "}
            <strong className="text-white">{categories.length}</strong> categorie(s)
          </span>
        </div>
      </div>
    </div>
  );
}
