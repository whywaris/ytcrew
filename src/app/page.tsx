import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  HomepageHeroAndGrid,
  ToolItem,
  CategoryItem,
} from "@/components/home/homepage-hero-and-grid";
import { createPublicClient } from "@/lib/supabase/server";
import { toolDefinitions } from "@/lib/tool-definitions";

export const metadata: Metadata = {
  title: "YT Crew – 100% Free YouTube Tools for Creators",
  description:
    "YT Crew brings free tools for YouTube creators in one place — from keyword research to thumbnail downloads. Simple, fast, and free to use.",
  openGraph: {
    title: "YT Crew – 100% Free YouTube Tools for Creators",
    description:
      "YT Crew brings free tools for YouTube creators in one place — from keyword research to thumbnail downloads. Simple, fast, and free to use.",
    type: "website",
  },
};

// Revalidate page cache periodically
export const revalidate = 60;

// Fallback category mapping for static rendering / database fallback
const FALLBACK_CATEGORIES: CategoryItem[] = [
  { id: "video-tools", slug: "video-tools", name: "Video Tools" },
  { id: "channel-tools", slug: "channel-tools", name: "Channel Tools" },
  { id: "seo-tools", slug: "seo-tools", name: "SEO Tools" },
  { id: "generator-tools", slug: "generator-tools", name: "Generator Tools" },
  { id: "comment-tools", slug: "comment-tools", name: "Comment Tools" },
  { id: "calculators", slug: "calculators", name: "Calculators" },
];

const FALLBACK_TOOL_CATEGORIES: Record<string, { slug: string; name: string }> = {
  "youtube-video-frame-by-frame": { slug: "video-tools", name: "Video Tools" },
  "youtube-chapters": { slug: "video-tools", name: "Video Tools" },
  "youtube-embed-code-generator": { slug: "video-tools", name: "Video Tools" },
  "youtube-thumbnail-resizer": { slug: "video-tools", name: "Video Tools" },
  "youtube-thumbnail-downloader": { slug: "video-tools", name: "Video Tools" },
  "youtube-qr-code": { slug: "video-tools", name: "Video Tools" },

  "youtube-name-generator": { slug: "channel-tools", name: "Channel Tools" },
  "youtube-subscribe-link-generator": { slug: "channel-tools", name: "Channel Tools" },
  "youtube-banner-resizer": { slug: "channel-tools", name: "Channel Tools" },

  "tag-extractor": { slug: "seo-tools", name: "SEO Tools" },
  "hashtag-generator": { slug: "seo-tools", name: "SEO Tools" },
  "youtube-category-checker": { slug: "seo-tools", name: "SEO Tools" },
  "youtube-backlink-generator": { slug: "seo-tools", name: "SEO Tools" },
  "youtube-rss-feed": { slug: "seo-tools", name: "SEO Tools" },

  "youtube-timestamp-link-generator": { slug: "generator-tools", name: "Generator Tools" },
  "youtube-font-generator": { slug: "generator-tools", name: "Generator Tools" },

  "fake-youtube-comment-generator": { slug: "comment-tools", name: "Comment Tools" },
  "random-youtube-comment-picker": { slug: "comment-tools", name: "Comment Tools" },
  "youtube-comment-finder": { slug: "comment-tools", name: "Comment Tools" },

  "youtube-watch-time-calculator": { slug: "calculators", name: "Calculators" },
  "youtube-playlist-length-calculator": { slug: "calculators", name: "Calculators" },
};

/**
 * Server-side helper to fetch active tools and categories from Supabase with fallback.
 */
async function getHomepageData(): Promise<{ tools: ToolItem[]; categories: CategoryItem[] }> {
  let tools: ToolItem[] = [];
  let categories: CategoryItem[] = [];

  try {
    const supabase = createPublicClient();
    if (supabase) {
      // 1. Fetch categories from Supabase
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug, description")
        .order("name", { ascending: true });

      if (!catError && catData && catData.length > 0) {
        categories = catData.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
        }));
      }

      // 2. Fetch active tools from Supabase with joined categories
      const { data: toolsData, error: toolsError } = await supabase
        .from("tools")
        .select("id, slug, title, short_description, icon, type, status, category_id, categories(id, name, slug)")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (!toolsError && toolsData && toolsData.length > 0) {
        tools = toolsData.map((t) => {
          const categoryObj = Array.isArray(t.categories)
            ? t.categories[0]
            : t.categories;

          const matchedCat = categories.find((c) => c.id === t.category_id);

          return {
            id: t.id,
            slug: t.slug,
            title: t.title,
            short_description: t.short_description,
            icon: t.icon,
            type: t.type || "logic",
            category_id: t.category_id,
            category_slug: categoryObj?.slug || matchedCat?.slug || null,
            category_name: categoryObj?.name || matchedCat?.name || null,
          };
        });
      }
    }
  } catch (err) {
    console.warn("[Homepage] Failed to fetch data from Supabase, using local fallback.", err);
  }

  // Fallback to static toolDefinitions if database is empty or offline
  if (tools.length === 0) {
    tools = Object.values(toolDefinitions)
      .filter((t) => t.status === "active")
      .map((t) => {
        const catInfo = FALLBACK_TOOL_CATEGORIES[t.slug] || {
          slug: t.category,
          name: t.category,
        };

        return {
          slug: t.slug,
          title: t.title,
          short_description: t.description,
          type: t.type || "logic",
          category_slug: catInfo.slug,
          category_name: catInfo.name,
        };
      });
  }

  // Fallback categories if database has no categories
  if (categories.length === 0) {
    categories = FALLBACK_CATEGORIES;
  }

  return { tools, categories };
}

export default async function Home() {
  const { tools, categories } = await getHomepageData();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            </div>
          }
        >
          <HomepageHeroAndGrid tools={tools} categories={categories} />
        </Suspense>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
