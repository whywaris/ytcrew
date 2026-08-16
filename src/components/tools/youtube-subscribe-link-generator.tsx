"use client";

import * as React from "react";
import { z } from "zod";
import {
  UserPlus,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Video,
  Share2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const subscribeFormSchema = z.object({
  channelInput: z
    .string()
    .min(1, "Please enter a YouTube channel URL, handle (@name), or Channel ID.")
    .max(200, "Input is too long"),
});

export function YouTubeSubscribeLinkGenerator() {
  const [channelInput, setChannelInput] = React.useState("");
  const [buttonText, setButtonText] = React.useState("Subscribe on YouTube");
  const [generatedUrl, setGeneratedUrl] = React.useState("");
  const [embedHtml, setEmbedHtml] = React.useState("");
  const [markdownCode, setMarkdownCode] = React.useState("");
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedEmbed, setCopiedEmbed] = React.useState(false);
  const [copiedMd, setCopiedMd] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Parse channel input and normalize to direct subscription link
   */
  const processSubscribeLink = (input: string): string | null => {
    let clean = input.trim();
    if (!clean) return null;

    // 1. If user provided a handle (e.g. "@MrBeast" or "MrBeast")
    if (clean.startsWith("@")) {
      return `https://www.youtube.com/${clean}?sub_confirmation=1`;
    }

    // 2. If already a full URL
    if (clean.includes("youtube.com") || clean.includes("youtu.be")) {
      // Remove any existing sub_confirmation param first
      clean = clean.replace(/([?&])sub_confirmation=[0-9]/g, "");
      clean = clean.replace(/[?&]$/, "");
      const delimiter = clean.includes("?") ? "&" : "?";
      return `${clean}${delimiter}sub_confirmation=1`;
    }

    // 3. If standard Channel ID (UC...)
    if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
      return `https://www.youtube.com/channel/${clean}?sub_confirmation=1`;
    }

    // 4. Default assume handle or vanity custom name
    const handleName = clean.startsWith("@") ? clean : `@${clean}`;
    return `https://www.youtube.com/${handleName}?sub_confirmation=1`;
  };

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = subscribeFormSchema.safeParse({ channelInput });
    if (!validation.success) {
      setError(validation.error.issues?.[0]?.message || "Invalid input");
      return;
    }

    const subUrl = processSubscribeLink(channelInput);
    if (!subUrl) {
      setError("Please enter a valid YouTube channel URL, handle, or ID.");
      return;
    }

    setGeneratedUrl(subUrl);

    // Generate responsive HTML button snippet
    const htmlSnippet = `<a href="${subUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background-color:#FF0000;color:#FFFFFF;font-family:sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:24px;box-shadow:0 2px 5px rgba(0,0,0,0.2);">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
  ${buttonText || "Subscribe on YouTube"}
</a>`;
    setEmbedHtml(htmlSnippet);

    // Markdown snippet
    const mdSnippet = `[![${buttonText || "Subscribe on YouTube"}](https://img.shields.io/badge/YouTube-Subscribe-red?style=for-the-badge&logo=youtube)](${subUrl})`;
    setMarkdownCode(mdSnippet);
  };

  const copyToClipboard = async (
    text: string,
    setFlag: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      setTimeout(() => setFlag(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleReset = () => {
    setChannelInput("");
    setGeneratedUrl("");
    setEmbedHtml("");
    setMarkdownCode("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>YouTube 1-Click Subscribe Link Generator</span>
          </CardTitle>
          <CardDescription>
            Create instant subscription deep links that prompt visitors with an automatic &quot;Confirm Channel Subscription&quot; dialog when opened.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="channel-input"
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>Channel URL, Handle, or Channel ID</span>
                <span className="text-xs text-muted-foreground">e.g. @MrBeast, UCX6OQ3DkcsbYNE6H8uQQuVA</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Video className="h-4 w-4 text-red-500" />
                </div>
                <Input
                  id="channel-input"
                  placeholder="https://www.youtube.com/@mkbhd or @mkbhd"
                  value={channelInput}
                  onChange={(e) => {
                    setChannelInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9 bg-background/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Custom CTA Button Text (Optional)
              </label>
              <Input
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Subscribe on YouTube"
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
                <span>Generate Subscribe Link</span>
              </Button>
              {generatedUrl && (
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

          {/* Results Output */}
          {generatedUrl && (
            <div className="mt-8 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
              {/* Direct Link Card */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Share2 className="h-4 w-4 text-primary" />
                    Auto-Confirmation Subscribe URL:
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    readOnly
                    value={generatedUrl}
                    className="font-mono text-xs sm:text-sm bg-background border-primary/40 text-primary font-medium select-all"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={copiedLink ? "secondary" : "primary"}
                      onClick={() => copyToClipboard(generatedUrl, setCopiedLink)}
                      className="gap-1.5 flex-1 sm:flex-initial"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-success font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Test subscribe link in new tab"
                        aria-label="Test subscribe link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Embeddable HTML Button Code */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Code2 className="h-4 w-4 text-primary" />
                    Embeddable HTML Subscribe Button:
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(embedHtml, setCopiedEmbed)}
                    className="gap-1.5 text-xs"
                  >
                    {copiedEmbed ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span className="text-success">Copied HTML</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  readOnly
                  rows={4}
                  value={embedHtml}
                  className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-background/80 text-muted-foreground select-all focus:outline-none"
                />

                {/* Live Button Preview */}
                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Button Preview:</span>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition-transform hover:scale-105"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>{buttonText || "Subscribe on YouTube"}</span>
                  </a>
                </div>
              </div>

              {/* Markdown Badge Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    GitHub / Markdown Badge:
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(markdownCode, setCopiedMd)}
                    className="gap-1 text-xs h-7"
                  >
                    {copiedMd ? (
                      <span className="text-success font-semibold">Copied!</span>
                    ) : (
                      <span>Copy Markdown</span>
                    )}
                  </Button>
                </div>
                <Input
                  readOnly
                  value={markdownCode}
                  className="font-mono text-xs bg-background/80 text-muted-foreground select-all"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
