"use client";

import * as React from "react";
import { Link2, Check } from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function SocialShare({
  url,
  title,
  className = "",
  orientation = "vertical",
}: SocialShareProps) {
  const [copied, setCopied] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState(url);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  // Exact ordered list of share platforms: X, Facebook, Reddit, LinkedIn
  const sharePlatforms = [
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg
          className="h-5 w-5 fill-current text-foreground"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      hoverEffect: "hover:border-foreground/40 hover:scale-105",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg
          className="h-5 w-5 fill-[#1877F2]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      hoverEffect: "hover:border-[#1877F2]/50 hover:bg-[#1877F2]/5 hover:scale-105",
    },
    {
      name: "Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: (
        <svg
          className="h-5 w-5 fill-[#FF4500]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      hoverEffect: "hover:border-[#FF4500]/50 hover:bg-[#FF4500]/5 hover:scale-105",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg
          className="h-5 w-5 fill-[#0A66C2]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      hoverEffect: "hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5 hover:scale-105",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col items-center gap-2.5" : "flex-row items-center gap-2"
      } ${className}`}
      aria-label="Share this guide"
    >
      {sharePlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${platform.name}`}
          aria-label={`Share on ${platform.name}`}
          className={`h-10 w-10 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-center transition-all duration-200 ${platform.hoverEffect}`}
        >
          {platform.icon}
        </a>
      ))}

      {/* Copy Link Button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? "Link Copied!" : "Copy post link"}
          aria-label="Copy post link"
          className={`h-10 w-10 rounded-xl bg-card border shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 ${
            copied
              ? "text-emerald-500 border-emerald-500/50 bg-emerald-500/10"
              : "text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary/70"
          }`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in-50" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>

        {/* Floating Copied Toast Tooltip */}
        {copied && (
          <div
            className={`absolute z-30 pointer-events-none whitespace-nowrap px-2 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-lg shadow-emerald-950/20 animate-in fade-in zoom-in-95 ${
              isVertical
                ? "left-full ml-2.5 top-1/2 -translate-y-1/2"
                : "bottom-full mb-2 left-1/2 -translate-x-1/2"
            }`}
          >
            Copied!
          </div>
        )}
      </div>
    </div>
  );
}
