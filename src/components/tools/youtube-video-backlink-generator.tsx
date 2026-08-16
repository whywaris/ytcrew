"use client";

import * as React from "react";
import { z } from "zod";
import {
  Link2,
  Copy,
  Check,
  Code2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
  MessageSquare,
  CheckCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/;

const backlinkSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video URL.")
    .refine((val) => {
      const trimmed = val.trim();
      return YOUTUBE_URL_REGEX.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed);
    }, "Please enter a valid YouTube video URL."),
  anchor: z.string().max(120, "Anchor text too long").optional(),
});

interface BacklinkSnippet {
  id: string;
  title: string;
  format: string;
  code: string;
  description: string;
  icon: React.ReactNode;
}

export function YouTubeVideoBacklinkGenerator() {
  const [url, setUrl] = React.useState("");
  const [anchorText, setAnchorText] = React.useState("");
  const [snippets, setSnippets] = React.useState<BacklinkSnippet[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = backlinkSchema.safeParse({ url, anchor: anchorText });
    if (!validation.success) {
      setError(validation.error.issues?.[0]?.message || "Invalid input");
      return;
    }

    const vidId = extractVideoId(url);
    if (!vidId) {
      setError("Could not extract a valid YouTube video ID.");
      return;
    }

    const canonicalUrl = `https://www.youtube.com/watch?v=${vidId}`;
    const shortUrl = `https://youtu.be/${vidId}`;
    const thumbUrl = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
    const label = anchorText.trim() || "Watch this video on YouTube";

    const generated: BacklinkSnippet[] = [
      {
        id: "html-standard",
        title: "Standard HTML Hyperlink",
        format: "HTML",
        code: `<a href="${canonicalUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`,
        description: "Best for blogs, website content, footers, and guest posts.",
        icon: <Code2 className="h-4 w-4 text-primary" />,
      },
      {
        id: "html-thumbnail",
        title: "HTML Visual Thumbnail Card",
        format: "HTML + Image",
        code: `<a href="${canonicalUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;font-family:sans-serif;">
  <img src="${thumbUrl}" alt="${label}" width="480" style="border-radius:8px;display:block;max-width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
  <span style="display:block;margin-top:6px;font-weight:bold;color:#6366F1;">${label} &rarr;</span>
</a>`,
        description: "Eye-catching banner preview linking straight to your YouTube video.",
        icon: <Sparkles className="h-4 w-4 text-primary" />,
      },
      {
        id: "markdown",
        title: "Markdown Link",
        format: "Markdown",
        code: `[${label}](${canonicalUrl})`,
        description: "Ideal for GitHub README files, Notion, Reddit, Discord, and Slack.",
        icon: <FileText className="h-4 w-4 text-primary" />,
      },
      {
        id: "markdown-image",
        title: "Markdown Image Banner Link",
        format: "Markdown",
        code: `[![${label}](${thumbUrl})](${canonicalUrl})`,
        description: "Clickable thumbnail card in markdown documentation.",
        icon: <FileText className="h-4 w-4 text-primary" />,
      },
      {
        id: "bbcode",
        title: "Forum BBCode",
        format: "BBCode",
        code: `[URL=${canonicalUrl}]${label}[/URL]`,
        description: "Compatible with vBulletin, XenForo, phpBB, and community forums.",
        icon: <MessageSquare className="h-4 w-4 text-primary" />,
      },
      {
        id: "shortlink",
        title: "Clean Short URL",
        format: "Shortlink",
        code: shortUrl,
        description: "Clean share link for social media bios, X (Twitter), and descriptions.",
        icon: <Link2 className="h-4 w-4 text-primary" />,
      },
    ];

    setSnippets(generated);
  };

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyAll = async () => {
    if (snippets.length === 0) return;
    try {
      const allText = snippets
        .map((s) => `<!-- ${s.title} -->\n${s.code}`)
        .join("\n\n");
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  const handleReset = () => {
    setUrl("");
    setAnchorText("");
    setSnippets([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Link2 className="h-5 w-5 text-primary" />
            <span>YouTube Video Backlink Code Generator</span>
          </CardTitle>
          <CardDescription>
            Generate SEO-optimized HTML, Markdown, and BBCode embed snippets pointing to your YouTube video to build high-authority external referral traffic.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="backlink-video-url"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>YouTube Video URL</span>
                <span className="text-xs text-muted-foreground">Standard, Shorts, or youtu.be link</span>
              </label>
              <Input
                id="backlink-video-url"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                className="bg-background/80"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="backlink-anchor-text"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>Anchor Text / Video Title (Optional)</span>
                <span className="text-xs text-muted-foreground">e.g. &quot;How to Master YouTube SEO 2026&quot;</span>
              </label>
              <Input
                id="backlink-anchor-text"
                placeholder="Watch this video on YouTube"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                className="bg-background/80"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button type="submit" size="lg" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate Backlinks</span>
              </Button>
              {snippets.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </form>

          {/* Snippets Output Grid */}
          {snippets.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Ready-to-Use Backlink Snippets ({snippets.length})
                </span>
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
                      <span>Copy All Snippets</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {snippets.map((snip) => {
                  const isCopied = copiedId === snip.id;
                  return (
                    <div
                      key={snip.id}
                      className="p-4 rounded-xl border border-border bg-card/60 space-y-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {snip.icon}
                          <span className="text-sm font-semibold text-foreground">
                            {snip.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                            {snip.format}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant={isCopied ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleCopy(snip.code, snip.id)}
                          className="gap-1.5 text-xs h-8"
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

                      <p className="text-xs text-muted-foreground">{snip.description}</p>

                      <textarea
                        readOnly
                        rows={snip.code.includes("\n") ? 3 : 1}
                        value={snip.code}
                        className="w-full font-mono text-xs p-2.5 rounded-lg border border-input bg-background/80 text-primary select-all focus:outline-none"
                      />
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
