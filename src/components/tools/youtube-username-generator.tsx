"use client";

import * as React from "react";
import { z } from "zod";
import {
  UserCheck,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Hash,
  Smile,
  Gamepad2,
  Briefcase,
  Layers,
  CheckCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const usernameFormSchema = z.object({
  keyword: z
    .string()
    .min(1, "Please enter at least one keyword, niche, or topic.")
    .max(50, "Keyword is too long"),
  style: z.enum(["creative", "professional", "gaming", "funny", "tech", "minimal"]),
  includeNumbers: z.boolean(),
  includePrefixSuffix: z.boolean(),
});

type StylePreference = "creative" | "professional" | "gaming" | "funny" | "tech" | "minimal";

const STYLE_WORD_BANKS: Record<
  StylePreference,
  { prefixes: string[]; suffixes: string[]; buzzwords: string[] }
> = {
  creative: {
    prefixes: ["The", "Real", "Crafty", "Pixel", "Studio", "Vibe", "Daily", "Artisan", "Echo", "Loom"],
    suffixes: ["Hub", "Verse", "Works", "Lab", "Space", "Craft", "Chronicles", "Visions", "Sphere", "Lounge"],
    buzzwords: ["Creative", "Inspire", "Spark", "Canvas", "Palette", "Prism", "Muse", "Mosaic"],
  },
  professional: {
    prefixes: ["Official", "Prime", "Apex", "Global", "Elite", "Pro", "Core", "Nexus", "Summit", "Vanguard"],
    suffixes: ["Media", "Insights", "Consult", "HQ", "Group", "Network", "Collective", "Digest", "Review", "Channel"],
    buzzwords: ["Leadership", "Strategy", "Focus", "Expert", "Advisors", "Solutions", "Impact", "Mastery"],
  },
  gaming: {
    prefixes: ["Gamer", "Shadow", "Hyper", "Cyber", "Pixel", "Turbo", "Ghost", "Ninja", "Stealth", "Apex"],
    suffixes: ["Plays", "Gaming", "Squad", "Arcade", "Zone", "Loot", "Clutch", "Quest", "GG", "Reign"],
    buzzwords: ["Raid", "Respawn", "Vortex", "Glitch", "Sniper", "LevelUp", "Boss", "Overdrive"],
  },
  funny: {
    prefixes: ["NotSo", "Captain", "Silly", "Mega", "Uncle", "Derpy", "Crazy", "Super", "Sir", "Epic"],
    suffixes: ["Bloopers", "Memes", "Chaos", "Chronicles", "Laughs", "Giggle", "Fails", "Shenanigans", "Wtf", "Show"],
    buzzwords: ["Goofy", "Pickle", "Banana", "Potato", "Noodle", "Waffle", "Quirk", "Bamboozle"],
  },
  tech: {
    prefixes: ["Tech", "Code", "Byte", "Binary", "Silicon", "Cyber", "Dev", "Algorithm", "Bit", "Cloud"],
    suffixes: ["Hacks", "Stacks", "Logs", "Bytes", "Forge", "Terminal", "Matrix", "Circuit", "Bytes", "Lab"],
    buzzwords: ["Engine", "System", "Vector", "Syntax", "Protocol", "Framework", "Kernel", "Logic"],
  },
  minimal: {
    prefixes: ["Just", "Simply", "Pure", "True", "Mono", "Raw", "Base", "Plain"],
    suffixes: ["Co", "Club", "Log", "Now", "One", "Box", "Feed", "Spot"],
    buzzwords: ["Flow", "Form", "Space", "Tone", "Mark", "Line"],
  },
};

const GENERAL_AFFIXES = {
  prefixes: ["Go", "Hey", "TheReal", "Meet", "Inside", "That", "Just", "I_Am", "Watch"],
  suffixes: ["TV", "YT", "HQ", "Zone", "Central", "Corner", "Cast", "Live", "Daily"],
  numbers: ["01", "7", "24", "99", "101", "360", "777", "88"],
};

export function YouTubeUsernameGenerator() {
  const [keyword, setKeyword] = React.useState("TechReview");
  const [style, setStyle] = React.useState<StylePreference>("creative");
  const [includeNumbers, setIncludeNumbers] = React.useState(false);
  const [includePrefixSuffix, setIncludePrefixSuffix] = React.useState(true);

  const [generatedNames, setGeneratedNames] = React.useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Generate usernames algorithm
  const generateUsernames = React.useCallback(
    (kw: string, currentStyle: StylePreference, withNumbers: boolean, withAffixes: boolean) => {
      const cleanKeyword = kw.trim().replace(/[^a-zA-Z0-9_]/g, "");
      if (!cleanKeyword) return [];

      const bank = STYLE_WORD_BANKS[currentStyle];
      const results = new Set<string>();

      // Strategy 1: Prefix + Keyword
      bank.prefixes.forEach((p) => {
        results.add(`${p}${cleanKeyword}`);
      });

      // Strategy 2: Keyword + Suffix
      bank.suffixes.forEach((s) => {
        results.add(`${cleanKeyword}${s}`);
      });

      // Strategy 3: Keyword + Buzzword
      bank.buzzwords.forEach((b) => {
        results.add(`${cleanKeyword}${b}`);
        results.add(`${b}${cleanKeyword}`);
      });

      // Strategy 4: General Affixes
      if (withAffixes) {
        GENERAL_AFFIXES.prefixes.forEach((p) => {
          results.add(`${p}${cleanKeyword}`);
        });
        GENERAL_AFFIXES.suffixes.forEach((s) => {
          results.add(`${cleanKeyword}${s}`);
        });
      }

      // Strategy 5: Prefix + Keyword + Suffix
      const randomPrefix = bank.prefixes[Math.floor(Math.random() * bank.prefixes.length)];
      const randomSuffix = bank.suffixes[Math.floor(Math.random() * bank.suffixes.length)];
      results.add(`${randomPrefix}${cleanKeyword}${randomSuffix}`);

      // Strategy 6: With numbers
      let namesArray = Array.from(results);

      if (withNumbers) {
        namesArray = namesArray.map((name, i) => {
          if (i % 2 === 0) {
            const num = GENERAL_AFFIXES.numbers[i % GENERAL_AFFIXES.numbers.length];
            return `${name}${num}`;
          }
          return name;
        });
      }

      // Shuffle and pick 15-18 distinct suggestions
      const shuffled = namesArray.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 16);
    },
    []
  );

  // Initial load generation
  React.useEffect(() => {
    const initial = generateUsernames("TechVibe", "creative", false, true);
    setGeneratedNames(initial);
  }, [generateUsernames]);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = usernameFormSchema.safeParse({
      keyword,
      style,
      includeNumbers,
      includePrefixSuffix,
    });

    if (!validation.success) {
      setError(validation.error.issues?.[0]?.message || "Invalid input");
      return;
    }

    const suggestions = generateUsernames(keyword, style, includeNumbers, includePrefixSuffix);
    setGeneratedNames(suggestions);
  };

  const handleCopyOne = async (name: string, index: number) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyAll = async () => {
    if (generatedNames.length === 0) return;
    try {
      await navigator.clipboard.writeText(generatedNames.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  const styleIcons: Record<StylePreference, React.ReactNode> = {
    creative: <Sparkles className="h-4 w-4" />,
    professional: <Briefcase className="h-4 w-4" />,
    gaming: <Gamepad2 className="h-4 w-4" />,
    funny: <Smile className="h-4 w-4" />,
    tech: <Layers className="h-4 w-4" />,
    minimal: <SlidersHorizontal className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>YouTube Username & Handle Generator</span>
          </CardTitle>
          <CardDescription>
            Generate catchy, memorable, and available YouTube channel names and handle suggestions tailored to your niche.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Keyword Input */}
            <div className="space-y-2">
              <label
                htmlFor="username-keyword"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>Niche, Keyword, or Your Name</span>
                <span className="text-xs text-muted-foreground">e.g. Gaming, Chef, DailyVlog, Tech</span>
              </label>
              <Input
                id="username-keyword"
                placeholder="e.g. Finance, Craft, Code, Travel"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (error) setError(null);
                }}
                className="bg-background/80"
              />
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Channel Style & Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    "creative",
                    "professional",
                    "gaming",
                    "funny",
                    "tech",
                    "minimal",
                  ] as StylePreference[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                      style === s
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border bg-secondary/40 hover:bg-secondary/70 text-muted-foreground"
                    }`}
                  >
                    {styleIcons[s]}
                    <span className="capitalize">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options Toggle Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span>Include numbers (e.g. 24, 101, 360)</span>
              </label>

              <label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePrefixSuffix}
                  onChange={(e) => setIncludePrefixSuffix(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Include creator tags (e.g. TV, HQ, Central)</span>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit & Shuffle Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" size="lg" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate Usernames</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleGenerate()}
                className="gap-2"
                title="Generate fresh combinations"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Shuffle More</span>
              </Button>
            </div>
          </form>

          {/* Results Grid */}
          {generatedNames.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Generated Suggestions ({generatedNames.length})
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Click any username to copy it directly to your clipboard.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyAll}
                  className="gap-1.5 text-xs"
                >
                  {copiedAll ? (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-success" />
                      <span className="text-success font-semibold">All Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {generatedNames.map((name, idx) => {
                  const isCopied = copiedIndex === idx;
                  return (
                    <div
                      key={name + idx}
                      onClick={() => handleCopyOne(name, idx)}
                      className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        isCopied
                          ? "border-success/60 bg-success/10 text-success"
                          : "border-border/80 bg-background/60 hover:border-primary/50 hover:bg-card/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-5">
                          {idx + 1}.
                        </span>
                        <span className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          @{name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isCopied ? (
                          <span className="text-xs font-semibold text-success flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Copied
                          </span>
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
