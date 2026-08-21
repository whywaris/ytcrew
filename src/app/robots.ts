import type { MetadataRoute } from "next";

/**
 * List of explicit AI and LLM search/training web crawlers.
 * Explicitly whitelisted to maximize citation, indexing, and referral traffic
 * from AI search engines (ChatGPT, Claude, Perplexity, Apple AI, etc.).
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "CCBot",
  "Bytespider",
  "Applebot-Extended",
  "Amazonbot",
];

/**
 * Comprehensive Robots.txt Generator (Next.js 15 App Router Metadata Route)
 * Automatically served at /robots.txt.
 *
 * Configures:
 * 1. Default crawl permissions for all search engines (user-agent: *)
 * 2. Dedicated rule blocks for AI & LLM crawlers to guarantee indexability
 * 3. Strict disallow rules for sensitive /admin routes across all agents
 * 4. Dynamic sitemap reference
 */
export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytcrew.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const standardRule = {
    userAgent: "*",
    allow: "/",
    disallow: ["/admin", "/admin/*"],
  };

  const aiCrawlerRules = AI_CRAWLERS.map((crawler) => ({
    userAgent: crawler,
    allow: "/",
    disallow: ["/admin", "/admin/*"],
  }));

  return {
    rules: [standardRule, ...aiCrawlerRules],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
