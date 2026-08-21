"use client";

import * as React from "react";
import { z } from "zod";
import {
  Hash,
  Sparkles,
  Copy,
  Check,
  Flame,
  Layers,
  Filter,
  RefreshCw,
  Info,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputSchema = z.object({
  keyword: z
    .string()
    .min(1, "Please enter a primary topic or keyword.")
    .max(80, "Topic too long"),
});

const NICHE_POOLS: Record<string, string[]> = {
  all: ["shorts", "trending", "viral", "youtube", "youtubeshorts", "creator", "subscribe", "video", "fyp"],
  gaming: ["gaming", "gamer", "gameplay", "pcgaming", "twitch", "gamingcommunity", "playstation", "xbox", "walkthrough", "livestream"],
  tech: ["technology", "tech", "gadgets", "innovation", "programming", "software", "ai", "technews", "review", "coding"],
  education: ["learn", "education", "tutorial", "howto", "knowledge", "study", "facts", "tips", "skills", "guide"],
  vlog: ["vlog", "lifestyle", "dailyvlog", "dayinmylife", "travel", "vlogger", "family", "behindthescenes"],
  fitness: ["fitness", "workout", "gym", "health", "bodybuilding", "nutrition", "fitnesstips", "exercise", "motivation"],
  music: ["music", "song", "musician", "producer", "beat", "newmusic", "hiphop", "remix", "artist", "livemusic"],
  business: ["business", "entrepreneur", "finance", "money", "investing", "crypto", "marketing", "success", "motivation"],
};

export function YouTubeHashtagGenerator() {
  const [keyword, setKeyword] = React.useState("");
  const [niche, setNiche] = React.useState("all");
  const [targetType, setTargetType] = React.useState<"all" | "shorts" | "long">("all");
  const [generatedTags, setGeneratedTags] = React.useState<{
    trending: string[];
    targeted: string[];
    nicheTags: string[];
  } | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedSingle, setCopiedSingle] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const cleanKeyword = (kw: string) => {
    return kw
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = inputSchema.safeParse({ keyword });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid keyword");
      return;
    }

    const base = cleanKeyword(keyword);
    if (!base) {
      setError("Please enter valid alphanumeric characters.");
      return;
    }

    // 1. Targeted Variations
    const targeted: string[] = [
      `#${base}`,
      `#${base}tips`,
      `#${base}tutorial`,
      `#${base}guide`,
      `#${base}explained`,
      `#${base}2026`,
      `#howtouse${base}`,
      `#best${base}`,
      `#${base}forbeginners`,
      `#${base}review`,
      `#learn${base}`,
      `#master${base}`,
    ];

    // 2. Trending & Platform tags
    const trendingList: string[] = [
      `#${base}shorts`,
      `#${base}viral`,
      `#${base}trending`,
      `#youtubeshorts`,
      `#shorts`,
      `#viralvideo`,
      `#trendingnow`,
      `#creators`,
      `#youtubecreator`,
      `#watchthis`,
    ];

    // 3. Niche-specific patterns
    const nicheList = (NICHE_POOLS[niche] || NICHE_POOLS.all).map((item) => `#${item}`);
    const hybridNiche = (NICHE_POOLS[niche] || NICHE_POOLS.all)
      .slice(0, 4)
      .map((item) => `#${base}${item}`);

    setGeneratedTags({
      targeted: Array.from(new Set(targeted)),
      trending: Array.from(new Set(trendingList)),
      nicheTags: Array.from(new Set([...hybridNiche, ...nicheList])),
    });
  };

  const getAllTagsList = () => {
    if (!generatedTags) return [];
    return [
      ...generatedTags.targeted,
      ...generatedTags.trending,
      ...generatedTags.nicheTags,
    ];
  };

  const handleCopyAll = () => {
    const all = getAllTagsList().join(" ");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedSingle(tag);
    setTimeout(() => setCopiedSingle(null), 1500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Input Generator Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            YouTube Hashtag Generator
          </CardTitle>
          <CardDescription>
            Generate high-performing, niche-targeted hashtags optimized for YouTube algorithm discovery and Shorts feed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="e.g. video editing, bitcoin, minecraft, yoga"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-background/80 border-input h-11 text-sm focus-visible:ring-primary"
                />
              </div>
              <Button
                type="submit"
                className="h-11 px-6 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Hashtags
              </Button>
            </div>

            {/* Niche & Target Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-primary" /> Category / Niche
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background/80 px-3 text-xs focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                >
                  <option value="all">General / Multi-niche</option>
                  <option value="gaming">Gaming & Esports</option>
                  <option value="tech">Technology & Coding</option>
                  <option value="education">Education & Tutorials</option>
                  <option value="vlog">Vlogging & Lifestyle</option>
                  <option value="fitness">Fitness & Health</option>
                  <option value="music">Music & Production</option>
                  <option value="business">Business & Finance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" /> Content Format
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as "all" | "shorts" | "long")}
                  className="w-full h-9 rounded-md border border-input bg-background/80 px-3 text-xs focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                >
                  <option value="all">Universal (Shorts + Long-form)</option>
                  <option value="shorts">YouTube Shorts Focused</option>
                  <option value="long">Long-form Video Focused</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Generated Output */}
      {generatedTags && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Generated YouTube Hashtags ({getAllTagsList().length})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Formatted with &ldquo;#&rdquo; and ready to paste directly into your video description or title.
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={handleCopyAll}
                className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {copiedAll ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                    Copied All Tags!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy All Hashtags
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Section 1: Topic Specific */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Highly Targeted Topic Hashtags
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedTags.targeted.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleCopySingle(tag)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border hover:border-primary/60 hover:bg-card transition-all cursor-pointer text-foreground group"
                  >
                    <span>{tag}</span>
                    {copiedSingle === tag ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Trending & Viral */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Trending & Shorts Discovery
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedTags.trending.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleCopySingle(tag)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border hover:border-primary/60 hover:bg-card transition-all cursor-pointer text-foreground group"
                  >
                    <span>{tag}</span>
                    {copiedSingle === tag ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Niche Ecosystem */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Niche Ecosystem & Community Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedTags.nicheTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleCopySingle(tag)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border hover:border-primary/60 hover:bg-card transition-all cursor-pointer text-foreground group"
                  >
                    <span>{tag}</span>
                    {copiedSingle === tag ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* YouTube SEO Best Practice Tip */}
            <div className="p-3.5 rounded-lg border border-border/50 bg-background/40 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="leading-relaxed">
                <strong>YouTube Best Practice:</strong> YouTube recommends using 3 to 15 relevant hashtags per video. The first 3 hashtags in your description will appear above your video title or in search snippets. Adding more than 60 hashtags causes YouTube to ignore all hashtags on that video.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
