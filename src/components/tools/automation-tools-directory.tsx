"use client";

import * as React from "react";
import { DbAutomationTool, AutomationToolCategory, AutomationToolPricing } from "@/types";
import {
  Star,
  ExternalLink,
  Compass,
  PenTool,
  Mic,
  Video,
  Bot,
  Image as ImageIcon,
  Type,
  Search,
  BarChart3,
  Music,
  Film,
  X,
  Sparkles,
} from "lucide-react";

interface AutomationToolsDirectoryProps {
  tools: DbAutomationTool[];
}

const CATEGORY_ORDER: {
  key: AutomationToolCategory;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "niche_research",
    name: "Niche Research",
    description: "Discover profitable YouTube niches, audience demand, and untapped content opportunities.",
    icon: Compass,
  },
  {
    key: "script_writing",
    name: "Script Writing",
    description: "Generate video outlines, viral hooks, and high-retention full video scripts.",
    icon: PenTool,
  },
  {
    key: "voiceover",
    name: "Voiceover",
    description: "Ultra-realistic text-to-speech, voice cloning, and audio mastering engines.",
    icon: Mic,
  },
  {
    key: "video_editing",
    name: "Video Editing",
    description: "Automated video generation, timeline editing, B-roll insertion, and rendering.",
    icon: Video,
  },
  {
    key: "ai_avatar_faceless_video",
    name: "AI Avatar & Faceless Video Tools",
    description: "AI-generated talking avatars, automated faceless channel pipelines, and avatar presenters.",
    icon: Bot,
  },
  {
    key: "thumbnail_and_design",
    name: "Thumbnail & Design",
    description: "AI-powered thumbnail generation, face enhancement, and click-through optimization.",
    icon: ImageIcon,
  },
  {
    key: "captions_and_subtitles",
    name: "Captions & Subtitles",
    description: "Auto-captioning, animated subtitle styling, multi-language translation, and transcription.",
    icon: Type,
  },
  {
    key: "seo_and_research",
    name: "SEO & Research",
    description: "Keyword search volume, competitor tag analysis, rank tracking, and optimization tools.",
    icon: Search,
  },
  {
    key: "channel_growth_analytics",
    name: "Channel Growth / Analytics",
    description: "In-depth channel performance metrics, A/B thumbnail testing, and retention analytics.",
    icon: BarChart3,
  },
  {
    key: "audio_and_music",
    name: "Audio / Music",
    description: "Royalty-free background music, sound effects libraries, and AI voice/audio enhancers.",
    icon: Music,
  },
  {
    key: "stock_footage_media_library",
    name: "Stock Footage / Media Library",
    description: "HD & 4K B-roll clips, motion graphics templates, cinematic footage, and stock media.",
    icon: Film,
  },
];

function getPricingBadge(pricing: AutomationToolPricing) {
  switch (pricing) {
    case "free":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/30";
    case "freemium":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25 dark:border-sky-500/30";
    case "paid":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 dark:border-amber-500/30";
    default:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25 dark:border-slate-500/30";
  }
}

function getCategoryName(categoryKey: AutomationToolCategory): string {
  const cat = CATEGORY_ORDER.find((c) => c.key === categoryKey);
  return cat ? cat.name : "Automation Tool";
}

export function AutomationToolsDirectory({ tools }: AutomationToolsDirectoryProps) {
  const [selectedTool, setSelectedTool] = React.useState<DbAutomationTool | null>(null);

  // Close modal on Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedTool(null);
      }
    }

    if (selectedTool) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedTool]);

  const featuredTools = tools.filter((t) => t.is_featured);

  return (
    <>
      <div className="space-y-14">
        {/* A. FEATURED SECTION */}
        {featuredTools.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Star className="h-4 w-4 fill-amber-500 dark:fill-amber-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <span>Featured Automation Tools</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    {featuredTools.length} featured
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setSelectedTool(tool)}
                  className="group relative flex items-center justify-between gap-4 p-5 rounded-2xl border text-left cursor-pointer min-w-0 bg-card hover:bg-card/90 border-indigo-500/40 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Tool Logo / Fallback Icon */}
                    <div className="relative shrink-0">
                      {tool.logo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          className="h-12 w-12 rounded-xl object-contain bg-secondary/80 border border-border p-2"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center font-bold text-base">
                          {tool.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Star className="h-2.5 w-2.5 fill-white" />
                      </div>
                    </div>

                    {/* Tool Name & Badge */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="font-bold text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {tool.name}
                      </h4>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPricingBadge(
                          tool.pricing
                        )}`}
                      >
                        {tool.pricing}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-1">
                    <span>View</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* B. CATEGORY-GROUPED DIRECTORY SECTIONS */}
        <div className="space-y-12 sm:space-y-16">
          {CATEGORY_ORDER.map((cat) => {
            const categoryTools = tools.filter((t) => t.category === cat.key);
            if (categoryTools.length === 0) return null;

            const Icon = cat.icon;

            return (
              <div key={cat.key} className="space-y-5">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <span>{cat.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"}
                      </span>
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                </div>

                {/* Simplified Spacious Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setSelectedTool(tool)}
                      className="group relative flex items-center justify-between gap-4 p-5 rounded-2xl border text-left cursor-pointer min-w-0 bg-card hover:bg-card/90 border-border hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Tool Logo / Fallback Icon */}
                        <div className="relative shrink-0">
                          {tool.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={tool.logo_url}
                              alt={tool.name}
                              className="h-12 w-12 rounded-xl object-contain bg-secondary/80 border border-border p-2"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center font-bold text-base">
                              {tool.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {tool.is_featured && (
                            <div className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                              <Star className="h-2.5 w-2.5 fill-white" />
                            </div>
                          )}
                        </div>

                        {/* Tool Name & Badge */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <h4 className="font-bold text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {tool.name}
                          </h4>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPricingBadge(
                              tool.pricing
                            )}`}
                          >
                            {tool.pricing}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 flex items-center gap-1">
                        <span>Details</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOOL DETAILS MODAL / DIALOG (Theme-Aware Light & Dark Mode)                */}
      {/* ========================================================================= */}
      {selectedTool && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-tool-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTool(null);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-card text-card-foreground border border-border shadow-2xl shadow-black/20 dark:shadow-black/80 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Ambient Background Glow inside Modal */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-600/20 blur-[60px] rounded-full"
            />

            {/* Header: Logo, Name, Badge, Close Button */}
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Logo */}
                {selectedTool.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedTool.logo_url}
                    alt={selectedTool.name}
                    className="h-14 w-14 rounded-2xl object-contain bg-secondary/80 border border-border p-2 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm">
                    {selectedTool.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 id="modal-tool-title" className="font-extrabold text-xl sm:text-2xl text-foreground truncate">
                      {selectedTool.name}
                    </h3>
                    {selectedTool.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Star className="h-3 w-3 fill-amber-500 dark:fill-amber-400" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPricingBadge(
                        selectedTool.pricing
                      )}`}
                    >
                      {selectedTool.pricing}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{getCategoryName(selectedTool.category)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                aria-label="Close modal"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Description Body (Full, Untruncated) */}
            <div className="relative z-10 space-y-2 pt-1 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                About This Tool
              </h4>
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                {selectedTool.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="relative z-10 pt-2 flex flex-col sm:flex-row gap-3">
              {(() => {
                const isAffiliate = Boolean(
                  selectedTool.affiliate_url && selectedTool.affiliate_url.trim().length > 0
                );
                const targetUrl = isAffiliate
                  ? selectedTool.affiliate_url!
                  : selectedTool.website_url;
                const relAttribute = isAffiliate
                  ? "noopener noreferrer nofollow sponsored"
                  : "noopener noreferrer";

                return (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel={relAttribute}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                );
              })()}

              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="px-5 py-3.5 rounded-xl text-sm font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
