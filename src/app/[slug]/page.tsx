import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { ToolPageTemplate } from "@/components/tools/ToolPageTemplate";
import dynamic from "next/dynamic";
import { toolDefinitions, ToolDefinitionItem } from "@/lib/tool-definitions";
import { ToolFAQItem, ToolHowToStep } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ToolSkeleton = () => (
  <div className="p-8 rounded-2xl bg-card border border-border/60 animate-pulse flex items-center justify-center min-h-[280px]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
  </div>
);

/**
 * Registry of interactive client components mapped to tool slugs.
 * Code-split via next/dynamic to ensure pages only download JS for their active tool.
 */
const toolComponentRegistry: Record<string, React.ComponentType> = {
  "youtube-timestamp-link-generator": dynamic(
    () => import("@/components/tools/youtube-timestamp-generator").then((m) => m.YouTubeTimestampGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-video-frame-by-frame": dynamic(
    () => import("@/components/tools/youtube-video-frame-by-frame").then((m) => m.YouTubeVideoFrameByFrame),
    { loading: ToolSkeleton }
  ),
  "youtube-name-generator": dynamic(
    () => import("@/components/tools/youtube-username-generator").then((m) => m.YouTubeUsernameGenerator),
    { loading: ToolSkeleton }
  ),
  "fake-youtube-comment-generator": dynamic(
    () => import("@/components/tools/fake-youtube-comment-generator").then((m) => m.FakeYouTubeCommentGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-banner-resizer": dynamic(
    () => import("@/components/tools/youtube-banner-resizer").then((m) => m.YouTubeBannerResizer),
    { loading: ToolSkeleton }
  ),
  "youtube-subscribe-link-generator": dynamic(
    () => import("@/components/tools/youtube-subscribe-link-generator").then((m) => m.YouTubeSubscribeLinkGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-thumbnail-resizer": dynamic(
    () => import("@/components/tools/youtube-thumbnail-resizer").then((m) => m.YouTubeThumbnailResizer),
    { loading: ToolSkeleton }
  ),
  "youtube-backlink-generator": dynamic(
    () => import("@/components/tools/youtube-video-backlink-generator").then((m) => m.YouTubeVideoBacklinkGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-watch-time-calculator": dynamic(
    () => import("@/components/tools/youtube-watch-time-calculator").then((m) => m.YouTubeWatchTimeCalculator),
    { loading: ToolSkeleton }
  ),
  "youtube-thumbnail-downloader": dynamic(
    () => import("@/components/tools/youtube-thumbnail-downloader").then((m) => m.YouTubeThumbnailDownloader),
    { loading: ToolSkeleton }
  ),
  "youtube-font-generator": dynamic(
    () => import("@/components/tools/youtube-font-generator").then((m) => m.YouTubeFontGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-category-checker": dynamic(
    () => import("@/components/tools/youtube-category-checker").then((m) => m.YouTubeCategoryChecker),
    { loading: ToolSkeleton }
  ),
  "tag-extractor": dynamic(
    () => import("@/components/tools/youtube-tag-extractor").then((m) => m.YouTubeTagExtractor),
    { loading: ToolSkeleton }
  ),
  "youtube-comment-finder": dynamic(
    () => import("@/components/tools/youtube-comment-finder").then((m) => m.YouTubeCommentFinder),
    { loading: ToolSkeleton }
  ),
  "random-youtube-comment-picker": dynamic(
    () => import("@/components/tools/random-youtube-comment-picker").then((m) => m.RandomYouTubeCommentPicker),
    { loading: ToolSkeleton }
  ),
  "hashtag-generator": dynamic(
    () => import("@/components/tools/hashtag-generator").then((m) => m.YouTubeHashtagGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-rss-feed": dynamic(
    () => import("@/components/tools/youtube-rss-feed-generator").then((m) => m.YouTubeRssFeedGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-chapters": dynamic(
    () => import("@/components/tools/youtube-video-chapters").then((m) => m.YouTubeVideoChapters),
    { loading: ToolSkeleton }
  ),
  "youtube-embed-code-generator": dynamic(
    () => import("@/components/tools/youtube-video-embed-code-generator").then((m) => m.YouTubeVideoEmbedCodeGenerator),
    { loading: ToolSkeleton }
  ),
  "youtube-qr-code": dynamic(
    () => import("@/components/tools/youtube-video-qr-code").then((m) => m.YouTubeVideoQrCode),
    { loading: ToolSkeleton }
  ),
  "youtube-playlist-length-calculator": dynamic(
    () => import("@/components/tools/youtube-playlist-length-calculator").then((m) => m.YouTubePlaylistLengthCalculator),
    { loading: ToolSkeleton }
  ),
};

/**
 * Unified helper to fetch tool data from Supabase, with fallback to local toolDefinitions.
 */
async function getToolBySlug(slug: string): Promise<ToolDefinitionItem | null> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data: dbTool, error } = await supabase
        .from("tools")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error && dbTool) {
        if (dbTool.status !== "active") {
          return null;
        }

        const fallback = toolDefinitions[slug];

        return {
          slug: dbTool.slug,
          title: dbTool.title,
          description: dbTool.short_description || dbTool.description || "",
          seoTitle: dbTool.seo_title || dbTool.title,
          seoDescription: dbTool.seo_description || dbTool.short_description || "",
          category: dbTool.category || fallback?.category || "utilities",
          type: dbTool.type || "logic",
          status: dbTool.status,
          howToSteps: (dbTool.how_to_steps as ToolHowToStep[]) || fallback?.howToSteps || [],
          faqs: (dbTool.faqs as ToolFAQItem[]) || fallback?.faqs || [],
          relatedTools: fallback?.relatedTools || [],
          aboutContent: dbTool.about_content || fallback?.aboutContent || "",
        };
      }
    }
  } catch (err) {
    // If Supabase credentials are not populated or query fails, fall back to local definition
    console.warn(`[Supabase] Tool fetch failed for "${slug}", using fallback registry.`, err);
  }

  // Backup / Reference fallback
  const localTool = toolDefinitions[slug];
  if (localTool && localTool.status === "active") {
    return localTool;
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found - YT Crew",
    };
  }

  const title = tool.seoTitle || tool.title;
  const description = tool.seoDescription || tool.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return Object.keys(toolDefinitions).map((slug) => ({
    slug,
  }));
}

export default async function ToolDynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const ToolComponent = toolComponentRegistry[slug];

  // Convert aboutContent paragraphs to JSX if it's a string with newlines
  const formattedAboutContent = typeof tool.aboutContent === "string" ? (
    <div className="space-y-4">
      {tool.aboutContent.split("\n\n").map((paragraph, idx) => (
        <p key={idx}>{paragraph}</p>
      ))}
    </div>
  ) : (
    tool.aboutContent
  );

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      category={tool.category}
      slug={slug}
      howToSteps={tool.howToSteps}
      faqs={tool.faqs}
      relatedTools={tool.relatedTools}
      aboutContent={formattedAboutContent}
    >
      {ToolComponent ? (
        <ToolComponent />
      ) : (
        <div className="p-8 text-center border border-border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Tool interface coming soon.</p>
        </div>
      )}
    </ToolPageTemplate>
  );
}
