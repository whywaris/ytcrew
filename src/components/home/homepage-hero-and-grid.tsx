"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HeroSearch } from "./hero-search";
import {
  Sparkles,
  Search,
  ArrowRight,
  Clock,
  Video,
  UserCheck,
  Users,
  MessageSquare,
  Image as ImageIcon,
  UserPlus,
  Crop,
  Link2,
  Calculator,
  Download,
  Type,
  Wrench,
  Layers,
  FilterX,
  Zap,
  Hash,
  Rss,
  QrCode,
  FileCode,
  Tag,
  Shuffle,
  BarChart3,
  ListOrdered,
  ChevronRight,
} from "lucide-react";

export interface ToolItem {
  id?: string;
  slug: string;
  title: string;
  short_description?: string | null;
  icon?: string | null;
  type?: "logic" | "youtube_api" | "open_api" | string;
  category_id?: string | null;
  category_slug?: string | null;
  category_name?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface HomepageHeroAndGridProps {
  tools: ToolItem[];
  categories: CategoryItem[];
}

/**
 * Fixed category priority order:
 * 1. Video Tools
 * 2. Channel Tools
 * 3. SEO Tools
 * 4. Generator Tools
 * 5. Comment Tools
 * 6. Calculators
 */
function getCategoryPriority(slugOrName: string): number {
  const key = slugOrName.toLowerCase().replace(/[-_]/g, " ");
  if (key.includes("video")) return 1;
  if (key.includes("channel")) return 2;
  if (key.includes("seo")) return 3;
  if (key.includes("generator")) return 4;
  if (key.includes("comment")) return 5;
  if (key.includes("calculator")) return 6;
  return 99;
}

/**
 * Maps a category name/slug to a relevant Lucide icon.
 */
function getCategoryIcon(slugOrName: string): React.ComponentType<{ className?: string }> {
  const key = slugOrName.toLowerCase().replace(/[-_]/g, " ");
  if (key.includes("video")) return Video;
  if (key.includes("channel")) return Users;
  if (key.includes("seo")) return Search;
  if (key.includes("generator")) return Sparkles;
  if (key.includes("comment")) return MessageSquare;
  if (key.includes("calculator")) return Calculator;
  return Layers;
}

/**
 * Maps a tool slug or icon name to a Lucide icon component.
 */
function getToolIcon(slug: string, iconName?: string | null): React.ComponentType<{ className?: string }> {
  if (iconName) {
    switch (iconName.toLowerCase()) {
      case "clock": return Clock;
      case "video": return Video;
      case "usercheck": return UserCheck;
      case "users": return Users;
      case "messagesquare": return MessageSquare;
      case "image": return ImageIcon;
      case "userplus": return UserPlus;
      case "crop": return Crop;
      case "link2": return Link2;
      case "calculator": return Calculator;
      case "download": return Download;
      case "type": return Type;
      case "zap": return Zap;
      case "sparkles": return Sparkles;
      case "hash": return Hash;
      case "rss": return Rss;
      case "qrcode": return QrCode;
      case "filecode": return FileCode;
      case "tag": return Tag;
      case "search": return Search;
      case "shuffle": return Shuffle;
      case "barchart3": return BarChart3;
      case "listordered": return ListOrdered;
    }
  }

  switch (slug) {
    case "youtube-timestamp-link-generator":
      return Clock;
    case "youtube-video-frame-by-frame":
      return Video;
    case "youtube-name-generator":
      return UserCheck;
    case "fake-youtube-comment-generator":
      return MessageSquare;
    case "youtube-banner-resizer":
      return ImageIcon;
    case "youtube-subscribe-link-generator":
      return UserPlus;
    case "youtube-thumbnail-resizer":
      return Crop;
    case "youtube-backlink-generator":
      return Link2;
    case "youtube-watch-time-calculator":
      return Calculator;
    case "youtube-thumbnail-downloader":
      return Download;
    case "youtube-font-generator":
      return Type;
    case "youtube-category-checker":
      return BarChart3;
    case "tag-extractor":
      return Tag;
    case "youtube-comment-finder":
      return Search;
    case "random-youtube-comment-picker":
      return Shuffle;
    case "hashtag-generator":
      return Hash;
    case "youtube-rss-feed":
      return Rss;
    case "youtube-chapters":
      return ListOrdered;
    case "youtube-embed-code-generator":
      return FileCode;
    case "youtube-qr-code":
      return QrCode;
    default:
      return Wrench;
  }
}

/**
 * Checks whether a tool belongs to a given category by ID, slug, or name.
 */
function isToolInCategory(tool: ToolItem, category: CategoryItem): boolean {
  if (tool.category_id && tool.category_id === category.id) return true;
  if (tool.category_slug && tool.category_slug.toLowerCase() === category.slug.toLowerCase()) return true;
  if (tool.category_name && tool.category_name.toLowerCase() === category.name.toLowerCase()) return true;
  return false;
}

/**
 * Compact, dense list-style tool card component.
 */
function CompactToolCard({ tool }: { tool: ToolItem }) {
  const Icon = getToolIcon(tool.slug, tool.icon);

  return (
    <Link
      href={`/${tool.slug}`}
      className="group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-card/75 hover:bg-card border border-border/70 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-w-0"
    >
      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors truncate">
          {tool.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate leading-relaxed mt-0.5">
          {tool.short_description || "High-performance YouTube creator utility"}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
    </Link>
  );
}

export function HomepageHeroAndGrid({ tools, categories }: HomepageHeroAndGridProps) {
  const searchParams = useSearchParams();

  // Category filter state (default "all" or initialized from ?category= query param)
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);

  // Sync category state when searchParams change (e.g., user clicks footer link)
  React.useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  // Handle category selection and update URL without full page reload
  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const params = new URLSearchParams(window.location.search);
    if (categorySlug === "all") {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }
    const queryString = params.toString();
    const newPath = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState(null, "", newPath);
  };

  // Reset category filter
  const handleResetFilters = () => {
    handleCategorySelect("all");
  };

  // Sort categories in the fixed order: Video, Channel, SEO, Generator, Comment, Calculators
  const sortedCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => {
      const pA = getCategoryPriority(a.slug || a.name);
      const pB = getCategoryPriority(b.slug || b.name);
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Active single-category tools (when selectedCategory !== "all")
  const singleCategoryTools = React.useMemo(() => {
    if (selectedCategory === "all") return [];
    return tools.filter(
      (tool) =>
        (tool.category_slug && tool.category_slug.toLowerCase() === selectedCategory.toLowerCase()) ||
        tool.category_id === selectedCategory
    );
  }, [tools, selectedCategory]);

  const activeCategoryObj = React.useMemo(() => {
    if (selectedCategory === "all") return null;
    return (
      categories.find(
        (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.id === selectedCategory
      ) || null
    );
  }, [categories, selectedCategory]);

  const isSingleCategory = selectedCategory !== "all";

  return (
    <div>
      {/* ========================================================================= */}
      {/* 1. HERO SECTION ("Studio Glow" treatment)                                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/40 bg-[#0A0A0C]">
        {/* Soft Decorative Glow Blob 1: Top-Left Indigo (#6366F1, ~25% opacity) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-12 sm:-top-8 sm:left-4 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[#6366F1]/25 blur-[75px]"
        />

        {/* Soft Decorative Glow Blob 2: Bottom-Right Coral/Red (#FF3B30, ~18% opacity) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -right-12 sm:bottom-0 sm:right-6 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[#FF3B30]/18 blur-[75px]"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10 space-y-6">
          {/* Frosted Badge Pill above H1 */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(99,102,241,0.15)] backdrop-blur-md border border-[rgba(99,102,241,0.3)] text-[#A5A6F6] text-xs sm:text-sm font-semibold tracking-wide shadow-sm shadow-indigo-500/10">
              <span>⚡ 100% Free YouTube Tools</span>
            </div>
          </div>

          {/* Main H1 Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] max-w-3xl mx-auto">
              <span className="text-indigo-400">Free SEO</span> YouTube Tools to Grow Your Channel
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
              Everything a YouTube creator needs to rank higher, save time, and grow faster — zero cost, zero hassle.
            </p>
          </div>

          {/* Search Bar with Live Suggestions (Scoped strictly to dropdown) */}
          <div className="pt-2">
            <HeroSearch fallbackTools={tools} />
          </div>

          {/* Trust Strip below Search */}
          <p className="text-xs sm:text-sm text-muted-foreground pt-1">
            No signup required · Fast · Free forever
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TOOLS DISPLAY SECTION                                                  */}
      {/* ========================================================================= */}
      <section id="tools" className="py-12 sm:py-16 scroll-mt-16">
        <div id="categories" className="scroll-mt-16" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {isSingleCategory ? (
            /* A. SINGLE CATEGORY FILTERED VIEW */
            <div>
              {(() => {
                const CategoryIcon = getCategoryIcon(activeCategoryObj?.slug || selectedCategory);
                const categoryName = activeCategoryObj?.name || selectedCategory;

                return (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8 border-b border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                            <span>{categoryName}</span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {singleCategoryTools.length} {singleCategoryTools.length === 1 ? "tool" : "tools"}
                            </span>
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {activeCategoryObj?.description ||
                              `Free YouTube ${categoryName.toLowerCase()} designed to optimize your channel workflow.`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <FilterX className="h-3.5 w-3.5" />
                        <span>View all categories</span>
                      </button>
                    </div>

                    {singleCategoryTools.length === 0 ? (
                      <div className="py-16 px-6 text-center border border-dashed border-border/80 rounded-3xl bg-card/40 max-w-md mx-auto space-y-4">
                        <p className="text-sm text-muted-foreground">
                          No tools found in this category.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
                        >
                          <span>View All Tools</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        {singleCategoryTools.map((tool) => (
                          <CompactToolCard key={tool.slug} tool={tool} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* C. FULL CATEGORY-SECTIONED LAYOUT (DEFAULT) */
            <div className="space-y-12 sm:space-y-16">
              {sortedCategories.map((category) => {
                const categoryTools = tools.filter((t) => isToolInCategory(t, category));

                // If category has zero tools, don't render an empty section
                if (categoryTools.length === 0) return null;

                const CategoryIcon = getCategoryIcon(category.slug || category.name);
                const displayTools = categoryTools.slice(0, 6);

                return (
                  <div key={category.id || category.slug} className="space-y-5">
                    {/* Category Section Header */}
                    <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                          <span>{category.name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"}
                          </span>
                        </h2>
                      </div>

                      {/* View All Link */}
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(category.slug)}
                        className="group/link inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        title={`View all ${category.name}`}
                      >
                        <span>View all</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Compact Grid: 3 columns desktop (lg:grid-cols-3), 2 tablet (sm:grid-cols-2), 1 mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                      {displayTools.map((tool) => (
                        <CompactToolCard key={tool.slug} tool={tool} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

