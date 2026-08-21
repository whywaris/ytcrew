import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { toolDefinitions } from "@/lib/tool-definitions";

/**
 * Dynamic Sitemap Generator (Next.js 15 App Router Metadata Route)
 * Automatically served at /sitemap.xml.
 *
 * Generates URLs for:
 * 1. Core static and legal pages
 * 2. Active tools (queried from Supabase with static definition baseline)
 * 3. Published blog articles (queried from Supabase)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytcrew.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  // 1. Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/youtube-automation-tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclosure`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 2. Active Tools (Supabase + fallback registry)
  const toolMap = new Map<string, { slug: string; lastModified: Date }>();

  // Add active tools from local definitions as baseline
  for (const [slug, tool] of Object.entries(toolDefinitions)) {
    if (tool.status === "active") {
      toolMap.set(slug, {
        slug,
        lastModified: new Date(),
      });
    }
  }

  // Fetch active tools from Supabase to get the most updated records
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data: dbTools, error } = await supabase
        .from("tools")
        .select("slug, status, updated_at, created_at")
        .eq("status", "active");

      if (!error && dbTools) {
        for (const tool of dbTools) {
          if (tool.slug && tool.status === "active") {
            const timestamp = tool.updated_at || tool.created_at;
            toolMap.set(tool.slug, {
              slug: tool.slug,
              lastModified: timestamp ? new Date(timestamp) : new Date(),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Sitemap] Failed to fetch tools from Supabase:", err);
  }

  const toolEntries: MetadataRoute.Sitemap = Array.from(toolMap.values()).map(
    ({ slug, lastModified }) => ({
      url: `${baseUrl}/${slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  // 3. Published Blog Posts (Supabase)
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("slug, status, updated_at, published_at")
        .eq("status", "published");

      if (!error && posts) {
        blogEntries = posts.map((post) => {
          const timestamp = post.updated_at || post.published_at;
          return {
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: timestamp ? new Date(timestamp) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          };
        });
      }
    }
  } catch (err) {
    console.warn("[Sitemap] Failed to fetch blog posts from Supabase:", err);
  }

  return [...staticPages, ...toolEntries, ...blogEntries];
}
