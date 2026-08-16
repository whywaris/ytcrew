"use client";

import * as React from "react";
import {
  Type,
  Copy,
  Check,
  Filter,
  CheckCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FontStyleDefinition {
  id: string;
  name: string;
  category: "bold" | "script" | "decorative" | "symbols" | "minimal";
  transform: (text: string) => string;
}

// Unicode character mapping helper
function mapChars(text: string, upperStart: number, lowerStart: number, numStart?: number): string {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Uppercase A-Z (65 - 90)
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(upperStart + (code - 65));
      }
      // Lowercase a-z (97 - 122)
      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(lowerStart + (code - 97));
      }
      // Digits 0-9 (48 - 57)
      if (numStart !== undefined && code >= 48 && code <= 57) {
        return String.fromCodePoint(numStart + (code - 48));
      }
      return char;
    })
    .join("");
}

// Small caps mapping dictionary
const SMALL_CAPS_MAP: Record<string, string> = {
  a: "ᴀ",
  b: "ʙ",
  c: "ᴄ",
  d: "ᴅ",
  e: "ᴇ",
  f: "ꜰ",
  g: "ɢ",
  h: "ʜ",
  i: "ɪ",
  j: "ᴊ",
  k: "ᴋ",
  l: "ʟ",
  m: "ᴍ",
  n: "ɴ",
  o: "ᴏ",
  p: "ᴘ",
  q: "ǫ",
  r: "ʀ",
  s: "s",
  t: "ᴛ",
  u: "ᴜ",
  v: "ᴠ",
  w: "ᴡ",
  x: "x",
  y: "ʏ",
  z: "ᴢ",
};

const FONT_STYLES: FontStyleDefinition[] = [
  {
    id: "bold-sans",
    name: "Bold Sans (Modern)",
    category: "bold",
    transform: (t) => mapChars(t, 0x1d5d4, 0x1d5ee, 0x1d7ec),
  },
  {
    id: "bold-serif",
    name: "Bold Serif (Classic)",
    category: "bold",
    transform: (t) => mapChars(t, 0x1d400, 0x1d41a, 0x1d7ce),
  },
  {
    id: "italic-sans",
    name: "Italic Sans",
    category: "minimal",
    transform: (t) => mapChars(t, 0x1d608, 0x1d622),
  },
  {
    id: "bold-italic",
    name: "Bold Italic Sans",
    category: "bold",
    transform: (t) => mapChars(t, 0x1d63c, 0x1d656),
  },
  {
    id: "script-bold",
    name: "Cursive / Bold Script",
    category: "script",
    transform: (t) => mapChars(t, 0x1d4d0, 0x1d4ea),
  },
  {
    id: "monospace",
    name: "Monospace (Coder Style)",
    category: "minimal",
    transform: (t) => mapChars(t, 0x1d670, 0x1d68a, 0x1d7f6),
  },
  {
    id: "double-struck",
    name: "Double-Struck (Blackboard)",
    category: "decorative",
    transform: (t) => mapChars(t, 0x1d538, 0x1d552, 0x1d7d8),
  },
  {
    id: "fraktur-gothic",
    name: "Gothic / Fraktur",
    category: "decorative",
    transform: (t) => mapChars(t, 0x1d56c, 0x1d586),
  },
  {
    id: "fraktur-bold",
    name: "Bold Gothic Fraktur",
    category: "decorative",
    transform: (t) => mapChars(t, 0x1d5a0, 0x1d5ba),
  },
  {
    id: "small-caps",
    name: "Small Capitals",
    category: "minimal",
    transform: (t) =>
      t
        .toLowerCase()
        .split("")
        .map((c) => SMALL_CAPS_MAP[c] || c)
        .join(""),
  },
  {
    id: "bubble-circled",
    name: "Circled Bubble Ⓣⓔⓧⓣ",
    category: "symbols",
    transform: (t) => mapChars(t, 0x24b6, 0x24d0, 0x2460),
  },
  {
    id: "inverted-bubble",
    name: "Inverted Dark Bubble 🅃🄴🅇🅃",
    category: "symbols",
    transform: (t) => mapChars(t, 0x1f150, 0x1f170),
  },
  {
    id: "squared",
    name: "Square Boxed [T][E][X][T]",
    category: "symbols",
    transform: (t) =>
      t
        .split("")
        .map((c) => (c === " " ? "  " : `[${c}]`))
        .join(""),
  },
  {
    id: "fullwidth",
    name: "Wide / Aesthetic Ｆｕｌｌｗｉｄｔｈ",
    category: "decorative",
    transform: (t) => mapChars(t, 0xff21, 0xff41, 0xff10),
  },
  {
    id: "strikethrough",
    name: "Strikethrough T̶e̶x̶t̶",
    category: "symbols",
    transform: (t) =>
      t
        .split("")
        .map((c) => `${c}\u0336`)
        .join(""),
  },
  {
    id: "underline",
    name: "Underline T̲e̲x̲t̲",
    category: "symbols",
    transform: (t) =>
      t
        .split("")
        .map((c) => `${c}\u0332`)
        .join(""),
  },
  {
    id: "sparkles-framed",
    name: "Sparkles Framed ✨ Text ✨",
    category: "decorative",
    transform: (t) => `✨ ${t} ✨`,
  },
];

export function YouTubeFontGenerator() {
  const [inputText, setInputText] = React.useState("Subscribe to YT Crew");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);

  const filteredStyles = FONT_STYLES.filter((style) => {
    if (selectedCategory === "all") return true;
    return style.category === selectedCategory;
  });

  const handleCopy = async (styledText: string, id: string) => {
    try {
      await navigator.clipboard.writeText(styledText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyAll = async () => {
    try {
      const allText = filteredStyles
        .map((s) => `${s.name}:\n${s.transform(inputText || "Sample Text")}`)
        .join("\n\n");
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  const handleReset = () => {
    setInputText("");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Type className="h-5 w-5 text-primary" />
            <span>YouTube Fancy Font Generator</span>
          </CardTitle>
          <CardDescription>
            Transform standard text into eye-catching Unicode fonts for your YouTube video titles, descriptions, community posts, and channel about bios.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Text Input Area */}
          <div className="space-y-2">
            <label
              htmlFor="font-input-text"
              className="text-sm font-medium text-foreground flex items-center justify-between"
            >
              <span>Type or Paste Your YouTube Text</span>
              <span className="text-xs text-muted-foreground">
                {inputText.length} characters
              </span>
            </label>
            <div className="relative">
              <Input
                id="font-input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your title or bio here..."
                className="text-base bg-background/80 py-6 pr-20"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              {[
                { id: "all", label: "All Styles" },
                { id: "bold", label: "Bold & Strong" },
                { id: "script", label: "Cursive & Script" },
                { id: "decorative", label: "Gothic & Aesthetic" },
                { id: "symbols", label: "Circled & Boxed" },
                { id: "minimal", label: "Clean & Monospace" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedCategory === tab.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="gap-1.5 text-xs ml-auto"
            >
              {copiedAll ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-success" />
                  <span className="text-success font-semibold">All Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy All Styles</span>
                </>
              )}
            </Button>
          </div>

          {/* Font Results Grid */}
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {filteredStyles.map((style) => {
                const transformed = style.transform(inputText || "Sample YouTube Font");
                const isCopied = copiedId === style.id;

                return (
                  <div
                    key={style.id}
                    onClick={() => handleCopy(transformed, style.id)}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      isCopied
                        ? "border-success/60 bg-success/10 text-success"
                        : "border-border bg-card/60 hover:border-primary/50 hover:bg-card/90"
                    }`}
                  >
                    <div className="space-y-1 pr-4 flex-1 overflow-hidden">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        {style.name}
                      </span>
                      <p className="text-base sm:text-lg text-foreground font-medium truncate select-all">
                        {transformed}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={isCopied ? "secondary" : "primary"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(transformed, style.id);
                      }}
                      className="gap-1.5 text-xs shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span className="text-success font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
