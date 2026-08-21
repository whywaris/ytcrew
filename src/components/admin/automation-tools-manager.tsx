"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { DbAutomationTool, AutomationToolCategory, AutomationToolPricing } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  X,
  Sparkles,
  Star,
  Globe,
  Tag,
  DollarSign,
  Filter,
} from "lucide-react";

// Category Enum Map
export const AUTOMATION_CATEGORIES: { value: AutomationToolCategory; label: string }[] = [
  { value: "niche_research", label: "Niche Research" },
  { value: "script_writing", label: "Script Writing" },
  { value: "voiceover", label: "Voiceover" },
  { value: "video_editing", label: "Video Editing" },
  { value: "ai_avatar_faceless_video", label: "AI Avatar & Faceless Video Tools" },
  { value: "thumbnail_and_design", label: "Thumbnail & Design" },
  { value: "captions_and_subtitles", label: "Captions & Subtitles" },
  { value: "seo_and_research", label: "SEO & Research" },
  { value: "channel_growth_analytics", label: "Channel Growth / Analytics" },
  { value: "audio_and_music", label: "Audio / Music" },
  { value: "stock_footage_media_library", label: "Stock Footage / Media Library" },
];

export const PRICING_OPTIONS: { value: AutomationToolPricing; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
];

// Helper to convert name to URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function getPricingBadge(pricing: AutomationToolPricing) {
  switch (pricing) {
    case "free":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "freemium":
      return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    case "paid":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

interface AutomationToolsManagerProps {
  initialTools: DbAutomationTool[];
}

export function AutomationToolsManager({ initialTools }: AutomationToolsManagerProps) {
  const [tools, setTools] = React.useState<DbAutomationTool[]>(initialTools);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [pricingFilter, setPricingFilter] = React.useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTool, setEditingTool] = React.useState<DbAutomationTool | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formCategory, setFormCategory] = React.useState<AutomationToolCategory>("script_writing");
  const [formLogoUrl, setFormLogoUrl] = React.useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = React.useState("");
  const [formAffiliateUrl, setFormAffiliateUrl] = React.useState("");
  const [formPricing, setFormPricing] = React.useState<AutomationToolPricing>("freemium");
  const [formIsFeatured, setFormIsFeatured] = React.useState(false);
  const [formStatus, setFormStatus] = React.useState<"active" | "inactive">("active");
  const [isAutoSlug, setIsAutoSlug] = React.useState(true);

  // Deletion Modal State
  const [toolToDelete, setToolToDelete] = React.useState<DbAutomationTool | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Status Toggling State
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // Feedback State
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  // Filter tools
  const filteredTools = React.useMemo(() => {
    return tools.filter((tool) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" || tool.category === categoryFilter;

      const matchesPricing =
        pricingFilter === "all" || tool.pricing === pricingFilter;

      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [tools, searchQuery, categoryFilter, pricingFilter]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingTool(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormCategory("script_writing");
    setFormLogoUrl("");
    setFormWebsiteUrl("");
    setFormAffiliateUrl("");
    setFormPricing("freemium");
    setFormIsFeatured(false);
    setFormStatus("active");
    setIsAutoSlug(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (tool: DbAutomationTool) => {
    setEditingTool(tool);
    setFormName(tool.name);
    setFormSlug(tool.slug);
    setFormDescription(tool.description || "");
    setFormCategory(tool.category || "other");
    setFormLogoUrl(tool.logo_url || "");
    setFormWebsiteUrl(tool.website_url || "");
    setFormAffiliateUrl(tool.affiliate_url || "");
    setFormPricing(tool.pricing || "freemium");
    setFormIsFeatured(!!tool.is_featured);
    setFormStatus(tool.status || "active");
    setIsAutoSlug(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Name Input Change (with auto-slug)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (isAutoSlug) {
      setFormSlug(slugify(val));
    }
  };

  // Save Tool (Create or Update)
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const formattedSlug = formSlug.trim().toLowerCase();

    if (!formName.trim()) {
      setFormError("Tool name is required.");
      setSaving(false);
      return;
    }

    if (!formattedSlug) {
      setFormError("Slug is required.");
      setSaving(false);
      return;
    }

    if (!formWebsiteUrl.trim()) {
      setFormError("Website URL is required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: formName.trim(),
      slug: formattedSlug,
      description: formDescription.trim(),
      category: formCategory,
      logo_url: formLogoUrl.trim() || null,
      website_url: formWebsiteUrl.trim(),
      affiliate_url: formAffiliateUrl.trim() || null,
      pricing: formPricing,
      is_featured: formIsFeatured,
      status: formStatus,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingTool) {
        // Update existing tool
        const { data, error } = await supabase
          .from("automation_tools")
          .update(payload)
          .eq("id", editingTool.id)
          .select()
          .single();

        if (error) {
          console.error("Supabase automation tool update error:", error);
          setFormError(error.message || "Failed to update tool.");
          setSaving(false);
          return;
        }

        setTools((prev) =>
          prev.map((t) => (t.id === editingTool.id ? (data as DbAutomationTool) : t))
        );

        setNotification({
          type: "success",
          message: `Successfully updated "${payload.name}".`,
        });
      } else {
        // Create new tool
        const { data, error } = await supabase
          .from("automation_tools")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase automation tool insert error:", error);
          setFormError(error.message || "Failed to create tool.");
          setSaving(false);
          return;
        }

        setTools((prev) => [data as DbAutomationTool, ...prev]);

        setNotification({
          type: "success",
          message: `Successfully added "${payload.name}".`,
        });
      }

      setIsModalOpen(false);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: unknown) {
      console.error("Unexpected error saving tool:", err);
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (tool: DbAutomationTool) => {
    const newStatus = tool.status === "active" ? "inactive" : "active";
    setTogglingId(tool.id);

    try {
      const { error } = await supabase
        .from("automation_tools")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tool.id);

      if (error) {
        console.error("Failed to update status:", error);
        setNotification({
          type: "error",
          message: `Failed to update status: ${error.message}`,
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (tool: DbAutomationTool) => {
    const newFeatured = !tool.is_featured;

    try {
      const { error } = await supabase
        .from("automation_tools")
        .update({
          is_featured: newFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tool.id);

      if (error) {
        console.error("Failed to update featured flag:", error);
        return;
      }

      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, is_featured: newFeatured } : t))
      );
    } catch (err) {
      console.error("Toggle featured error:", err);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!toolToDelete) return;
    setDeletingId(toolToDelete.id);

    try {
      const { error } = await supabase
        .from("automation_tools")
        .delete()
        .eq("id", toolToDelete.id);

      if (error) {
        console.error("Failed to delete automation tool:", error);
        setNotification({
          type: "error",
          message: `Delete failed: ${error.message}`,
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      setTools((prev) => prev.filter((t) => t.id !== toolToDelete.id));
      setNotification({
        type: "success",
        message: `Tool "${toolToDelete.name}" deleted successfully.`,
      });
      setToolToDelete(null);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar: Search, Filters & Add Tool Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search automation tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#14141e] border-[#2b2b3d] text-white placeholder:text-muted-foreground rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#14141e] border border-[#2b2b3d] px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5 text-purple-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#14141e]">All Categories</option>
              {AUTOMATION_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-[#14141e]">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Filter */}
          <div className="flex items-center gap-1.5 bg-[#14141e] border border-[#2b2b3d] px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#14141e]">All Pricing</option>
              {PRICING_OPTIONS.map((p) => (
                <option key={p.value} value={p.value} className="bg-[#14141e]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action: Add Tool */}
        <Button
          type="button"
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Automation Tool</span>
        </Button>
      </div>

      {/* Table Card */}
      <div className="border border-[#252538] rounded-2xl bg-[#12121c] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#181826] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-[#252538]">
              <tr>
                <th className="px-6 py-4">Tool Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4 text-center">Featured</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Links</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e30]">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Bot className="h-8 w-8 text-slate-600" />
                      <p className="font-medium text-slate-400">No automation tools found</p>
                      <p className="text-xs">
                        {searchQuery
                          ? "Try a different search term or reset filters."
                          : "Get started by adding your first automation tool."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => {
                  const categoryLabel =
                    AUTOMATION_CATEGORIES.find((c) => c.value === tool.category)?.label ||
                    tool.category;

                  const isToggling = togglingId === tool.id;

                  return (
                    <tr
                      key={tool.id}
                      className="hover:bg-[#161624] transition-colors group"
                    >
                      {/* Name & Logo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tool.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={tool.logo_url}
                              alt={tool.name}
                              className="h-9 w-9 rounded-xl object-contain bg-white/5 border border-[#2b2b3d] p-1 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                              {tool.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                              <span className="truncate">{tool.name}</span>
                              {tool.is_featured && (
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {tool.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-[#1a1a2c] text-purple-300 border border-[#2d2d48]">
                          <Tag className="h-3 w-3 text-purple-400" />
                          <span>{categoryLabel}</span>
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getPricingBadge(
                            tool.pricing
                          )}`}
                        >
                          {tool.pricing}
                        </span>
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(tool)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                            tool.is_featured
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
                              : "bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                          }`}
                          title={tool.is_featured ? "Featured on public directory" : "Not featured"}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              tool.is_featured ? "fill-amber-400" : ""
                            }`}
                          />
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleStatus(tool)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                            tool.status === "active"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-slate-500/15 border-slate-500/30 text-slate-400 hover:bg-slate-500/25"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                tool.status === "active"
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-slate-500"
                              }`}
                            />
                          )}
                          <span className="capitalize">{tool.status}</span>
                        </button>
                      </td>

                      {/* Links Out */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={tool.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#1a1a2c] text-slate-400 hover:text-white border border-[#2d2d48] transition-colors"
                            title="Direct Website URL"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                          {tool.affiliate_url && (
                            <a
                              href={tool.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 transition-colors"
                              title="Affiliate Link Active"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tool)}
                            className="p-2 rounded-lg bg-[#1b1b2a] text-slate-300 hover:text-white hover:bg-purple-600/30 border border-[#2e2e46] hover:border-purple-500/40 transition-all cursor-pointer"
                            title="Edit Tool"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToolToDelete(tool)}
                            className="p-2 rounded-lg bg-[#1b1b2a] text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-[#2e2e46] hover:border-rose-500/40 transition-all cursor-pointer"
                            title="Delete Tool"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Tool */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#13131d] border border-[#2d2d44] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#252538] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingTool ? "Edit Automation Tool" : "Add New Automation Tool"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Directory tool listing and affiliate referral tracking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveTool} className="space-y-4">
              {/* Row 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tool Name <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. ElevenLabs, Descript, InVideo"
                    value={formName}
                    onChange={handleNameChange}
                    className="bg-[#181826] border-[#2e2e46] text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Slug <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. elevenlabs"
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value);
                      setIsAutoSlug(false);
                    }}
                    className="bg-[#181826] border-[#2e2e46] text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="One or two sentence summary of what this tool does for YouTube creators..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl bg-[#181826] border border-[#2e2e46] p-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Row 2: Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AutomationToolCategory)}
                    className="w-full rounded-xl bg-[#181826] border border-[#2e2e46] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {AUTOMATION_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-[#181826]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Pricing Model <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formPricing}
                    onChange={(e) => setFormPricing(e.target.value as AutomationToolPricing)}
                    className="w-full rounded-xl bg-[#181826] border border-[#2e2e46] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {PRICING_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value} className="bg-[#181826]">
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Logo URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Logo URL <span className="text-muted-foreground">(Optional image or CDN link)</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formLogoUrl}
                  onChange={(e) => setFormLogoUrl(e.target.value)}
                  className="bg-[#181826] border-[#2e2e46] text-white rounded-xl"
                />
              </div>

              {/* Row 4: Website URL & Affiliate URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Website URL <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="url"
                    required
                    placeholder="https://toolwebsite.com"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    className="bg-[#181826] border-[#2e2e46] text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Affiliate URL <span className="text-purple-400">(Optional)</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://partner.tool.com/ref?id=ytcrew"
                    value={formAffiliateUrl}
                    onChange={(e) => setFormAffiliateUrl(e.target.value)}
                    className="bg-[#181826] border-[#2e2e46] text-white rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to use Website URL directly as the link.
                  </p>
                </div>
              </div>

              {/* Row 5: Featured & Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Featured Toggle */}
                <div className="p-3.5 rounded-xl border border-[#2b2b3d] bg-[#161622] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Featured Tool</span>
                    <span className="text-[11px] text-muted-foreground">
                      Show in top Featured section
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsFeatured(!formIsFeatured)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                      formIsFeatured ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${
                        formIsFeatured ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Status Toggle */}
                <div className="p-3.5 rounded-xl border border-[#2b2b3d] bg-[#161622] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Published Status</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formStatus === "active" ? "Active (visible on site)" : "Inactive (hidden)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormStatus(formStatus === "active" ? "inactive" : "active")
                    }
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                      formStatus === "active" ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${
                        formStatus === "active" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252538]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl gap-2 shadow-lg shadow-purple-500/20"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingTool ? "Save Changes" : "Create Tool"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {toolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13131d] border border-rose-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Automation Tool?</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">&quot;{toolToDelete.name}&quot;</strong>? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setToolToDelete(null)}
                disabled={Boolean(deletingId)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingId)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl gap-2 shadow-lg shadow-rose-600/25"
              >
                {deletingId && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Delete Tool</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
