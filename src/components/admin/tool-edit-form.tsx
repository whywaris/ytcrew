"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DbTool, DbCategory, ToolHowToStep, ToolFAQItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Save,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  ListOrdered,
  ExternalLink,
  FileText,
  Search,
  Settings,
} from "lucide-react";

interface ToolEditFormProps {
  tool: DbTool;
  categories: DbCategory[];
}

export function ToolEditForm({ tool, categories }: ToolEditFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const originalSlug = tool.slug;

  // Form State
  const [title, setTitle] = React.useState(tool.title || "");
  const [slug, setSlug] = React.useState(tool.slug || "");
  const [shortDescription, setShortDescription] = React.useState(
    tool.short_description || ""
  );
  const [type, setType] = React.useState<"logic" | "youtube_api" | "open_api">(
    tool.type || "logic"
  );
  const [categoryId, setCategoryId] = React.useState<string>(
    tool.category_id || ""
  );
  const [status, setStatus] = React.useState<"active" | "inactive">(
    tool.status || "active"
  );

  const [howToSteps, setHowToSteps] = React.useState<ToolHowToStep[]>(
    Array.isArray(tool.how_to_steps) ? tool.how_to_steps : []
  );

  const [aboutContent, setAboutContent] = React.useState(
    tool.about_content || ""
  );

  const [faqs, setFaqs] = React.useState<ToolFAQItem[]>(
    Array.isArray(tool.faqs) ? tool.faqs : []
  );

  const [seoTitle, setSeoTitle] = React.useState(tool.seo_title || "");
  const [seoDescription, setSeoDescription] = React.useState(
    tool.seo_description || ""
  );

  // Status & Feedback
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Detect slug changes
  const hasSlugChanged = originalSlug !== slug.trim();

  // How-To Steps Handlers
  const handleAddStep = () => {
    setHowToSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: "",
        description: "",
      },
    ]);
  };

  const handleUpdateStep = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setHowToSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const handleRemoveStep = (index: number) => {
    setHowToSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepNumber: i + 1 }))
    );
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs((prev) => [
      ...prev,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const handleUpdateFaq = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
    );
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    if (!title.trim()) {
      setErrorMessage("Title is required.");
      setSaving(false);
      return;
    }

    if (!formattedSlug) {
      setErrorMessage("Slug is required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        slug: formattedSlug,
        short_description: shortDescription.trim(),
        type: type,
        category_id: categoryId || null,
        status: status,
        how_to_steps: howToSteps,
        about_content: aboutContent.trim(),
        faqs: faqs,
        seo_title: seoTitle.trim() || title.trim(),
        seo_description: seoDescription.trim() || shortDescription.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("tools")
        .update(payload)
        .eq("id", tool.id);

      if (error) {
        throw error;
      }

      setSuccessMessage("Tool updated successfully! Redirecting back...");

      // Redirect after brief delay
      setTimeout(() => {
        router.push("/admin/tools");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      console.error("Save error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to save tool changes in Supabase."
      );
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#0c0c10]/90 backdrop-blur-xl py-4 border-b border-[#252538]">
        <div className="flex items-center gap-3">
          <Link href="/admin/tools">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-[#141420] border-[#2b2b3d] text-muted-foreground hover:text-white"
              title="Back to Tools"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Edit Tool:</span>
                <span className="text-cyan-400 truncate max-w-xs sm:max-w-md">
                  {title || tool.title}
                </span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-mono">ID: {tool.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${originalSlug}`} target="_blank" rel="noopener noreferrer">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs hidden sm:inline-flex bg-[#161624] border border-[#2b2b3d] hover:bg-[#1e1e30] text-muted-foreground hover:text-white"
            >
              <span>View Live</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
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
            <p className="font-semibold">Error Saving Tool</p>
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

      {/* 1. Core Metadata & Identifiers */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Basic Tool Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure public title, slug route, classification, and publishing status.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Tool Title *
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. YouTube Timestamp Link Generator"
                className="bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                URL Slug * (Route: /{slug})
              </label>
              <Input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="youtube-timestamp-link-generator"
                className="font-mono text-sm bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* Slug Change Warning */}
          {hasSlugChanged && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold">Warning:</strong> You are changing the route slug from{" "}
                <code className="bg-black/60 px-1.5 py-0.5 rounded font-mono text-amber-200">/{originalSlug}</code> to{" "}
                <code className="bg-black/60 px-1.5 py-0.5 rounded font-mono text-amber-200">/{slug}</code>. This will alter the live URL.
              </div>
            </div>
          )}

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Short Description (H1 Subhead & Cards)
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence description shown under the tool title and on category grids..."
              className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3.5 py-2.5 text-sm text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Tool Type *
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "logic" | "youtube_api" | "open_api")
                }
                className="h-10 w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
              >
                <option value="logic">Logic (Client-side, No Backend)</option>
                <option value="youtube_api">YouTube Data API (Cached)</option>
                <option value="open_api">AI / Content Generator</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
              >
                <option value="">Unassigned</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Publishing Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
                className="h-10 w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
              >
                <option value="active">Active (Publicly Live)</option>
                <option value="inactive">Inactive (Hidden / Draft)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Numbered How-To Steps */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                How To Use Steps
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Numbered step-by-step instructions shown below the tool interface.
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddStep}
            className="gap-1.5 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Step</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {howToSteps.length > 0 ? (
            howToSteps.map((step, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-[#262638] bg-[#0e0e16]/80 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-xs font-bold shadow-xs">
                      {step.stepNumber || index + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      Step {index + 1}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                    className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Remove</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Step Title (e.g. Paste YouTube Link)"
                    value={step.title}
                    onChange={(e) =>
                      handleUpdateStep(index, "title", e.target.value)
                    }
                    className="bg-[#141420] border-[#2b2b3d] font-medium text-sm text-white placeholder:text-[#64748b] focus-visible:ring-indigo-500/30"
                  />
                  <textarea
                    rows={2}
                    placeholder="Step details and instructions..."
                    value={step.description}
                    onChange={(e) =>
                      handleUpdateStep(index, "description", e.target.value)
                    }
                    className="w-full rounded-xl border border-[#2b2b3d] bg-[#141420] px-3 py-2 text-xs text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center border border-dashed border-[#2b2b3d] rounded-2xl text-xs text-slate-400">
              No steps defined. Click &quot;Add Step&quot; to add instructions.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. About This Tool SEO Copy */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                About This Tool (SEO Content)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                2-3 paragraphs explaining features, benefits, creator use-cases, and target audience.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <textarea
            rows={7}
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            placeholder="Write comprehensive explanatory copy for creators and search engines. Separate paragraphs with double newlines..."
            className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] p-3.5 text-sm text-white placeholder:text-[#64748b] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          />
        </CardContent>
      </Card>

      {/* 4. FAQs */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Frequently Asked Questions (FAQs)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Questions & answers automatically formatted with schema.org FAQPage structured data.
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddFaq}
            className="gap-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add FAQ</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-[#262638] bg-[#0e0e16]/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    FAQ Item #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFaq(index)}
                    className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Remove</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Question (e.g. Do timestamp links work on mobile?)"
                    value={faq.question}
                    onChange={(e) =>
                      handleUpdateFaq(index, "question", e.target.value)
                    }
                    className="bg-[#141420] border-[#2b2b3d] font-medium text-sm text-white placeholder:text-[#64748b] focus-visible:ring-amber-500/30"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer details..."
                    value={faq.answer}
                    onChange={(e) =>
                      handleUpdateFaq(index, "answer", e.target.value)
                    }
                    className="w-full rounded-xl border border-[#2b2b3d] bg-[#141420] px-3 py-2 text-xs text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center border border-dashed border-[#2b2b3d] rounded-2xl text-xs text-slate-400">
              No FAQs added yet. Click &quot;Add FAQ&quot; to provide helpful answers.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Custom Manual SEO Controls */}
      <Card className="bg-[#12121c] border-[#252538] shadow-lg">
        <CardHeader className="border-b border-[#1e1e2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Manual SEO Metadata Controls
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Override standard meta tags for Google Search and OpenGraph previews.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Custom SEO Title Tag (leave blank to use Tool Title)
            </label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. YouTube Timestamp Link Generator - Free Online Tool | YT Crew"
              className="bg-[#0e0e16] border-[#2b2b3d] text-sm text-white placeholder:text-[#64748b] focus-visible:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Custom SEO Meta Description (leave blank to use Short Description)
            </label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Custom meta description for search engine SERP snippets..."
              className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-sm text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Action */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/tools">
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
          className="gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/20 font-bold"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
