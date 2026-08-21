import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { ToolPageTemplate } from "@/components/tools/ToolPageTemplate";
import { YouTubeTimestampGenerator } from "@/components/tools/youtube-timestamp-generator";
import { YouTubeVideoFrameByFrame } from "@/components/tools/youtube-video-frame-by-frame";
import { YouTubeUsernameGenerator } from "@/components/tools/youtube-username-generator";
import { FakeYouTubeCommentGenerator } from "@/components/tools/fake-youtube-comment-generator";
import { YouTubeBannerResizer } from "@/components/tools/youtube-banner-resizer";
import { YouTubeSubscribeLinkGenerator } from "@/components/tools/youtube-subscribe-link-generator";
import { YouTubeThumbnailResizer } from "@/components/tools/youtube-thumbnail-resizer";
import { YouTubeVideoBacklinkGenerator } from "@/components/tools/youtube-video-backlink-generator";
import { YouTubeWatchTimeCalculator } from "@/components/tools/youtube-watch-time-calculator";
import { YouTubeThumbnailDownloader } from "@/components/tools/youtube-thumbnail-downloader";
import { YouTubeFontGenerator } from "@/components/tools/youtube-font-generator";
import { YouTubeCategoryChecker } from "@/components/tools/youtube-category-checker";
import { YouTubeTagExtractor } from "@/components/tools/youtube-tag-extractor";
import { YouTubeCommentFinder } from "@/components/tools/youtube-comment-finder";
import { RandomYouTubeCommentPicker } from "@/components/tools/random-youtube-comment-picker";
import { YouTubeHashtagGenerator } from "@/components/tools/hashtag-generator";
import { YouTubeRssFeedGenerator } from "@/components/tools/youtube-rss-feed-generator";
import { YouTubeVideoChapters } from "@/components/tools/youtube-video-chapters";
import { YouTubeVideoEmbedCodeGenerator } from "@/components/tools/youtube-video-embed-code-generator";
import { YouTubeVideoQrCode } from "@/components/tools/youtube-video-qr-code";
import { YouTubePlaylistLengthCalculator } from "@/components/tools/youtube-playlist-length-calculator";
import { toolDefinitions, ToolDefinitionItem } from "@/lib/tool-definitions";
import { ToolFAQItem, ToolHowToStep } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Registry of interactive client components mapped to tool slugs.
 */
const toolComponentRegistry: Record<string, React.ComponentType> = {
  "youtube-timestamp-link-generator": YouTubeTimestampGenerator,
  "youtube-video-frame-by-frame": YouTubeVideoFrameByFrame,
  "youtube-name-generator": YouTubeUsernameGenerator,
  "fake-youtube-comment-generator": FakeYouTubeCommentGenerator,
  "youtube-banner-resizer": YouTubeBannerResizer,
  "youtube-subscribe-link-generator": YouTubeSubscribeLinkGenerator,
  "youtube-thumbnail-resizer": YouTubeThumbnailResizer,
  "youtube-backlink-generator": YouTubeVideoBacklinkGenerator,
  "youtube-watch-time-calculator": YouTubeWatchTimeCalculator,
  "youtube-thumbnail-downloader": YouTubeThumbnailDownloader,
  "youtube-font-generator": YouTubeFontGenerator,
  "youtube-category-checker": YouTubeCategoryChecker,
  "tag-extractor": YouTubeTagExtractor,
  "youtube-comment-finder": YouTubeCommentFinder,
  "random-youtube-comment-picker": RandomYouTubeCommentPicker,
  "hashtag-generator": YouTubeHashtagGenerator,
  "youtube-rss-feed": YouTubeRssFeedGenerator,
  "youtube-chapters": YouTubeVideoChapters,
  "youtube-embed-code-generator": YouTubeVideoEmbedCodeGenerator,
  "youtube-qr-code": YouTubeVideoQrCode,
  "youtube-playlist-length-calculator": YouTubePlaylistLengthCalculator,
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
