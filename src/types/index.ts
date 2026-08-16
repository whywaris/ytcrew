/**
 * Tool Phase and Category types based on CLAUDE.md architecture
 */
export type ToolPhase = "phase-a" | "phase-b" | "phase-c" | "phase-d";

export type ToolCategory =
  | "generators"
  | "resizers"
  | "ai-tools"
  | "analytics"
  | "seo-audit"
  | "utilities"
  | "downloaders";

export interface ToolFAQItem {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
  tools_count?: number;
}

export interface DbTool {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  how_to_steps: ToolHowToStep[];
  about_content: string;
  faqs: ToolFAQItem[];
  seo_title: string;
  seo_description: string;
  status: "active" | "inactive";
  type: "logic" | "youtube_api" | "open_api";
  category_id?: string | null;
  categories?: DbCategory | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  category?: string | null;
  author?: string | null;
  status: "draft" | "published";
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ToolDefinition {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: ToolCategory;
  phase: ToolPhase;
  iconName?: string;
  isFeatured?: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  howToSteps: ToolHowToStep[];
  faqs: ToolFAQItem[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
}

export type AdSlotType = "adsense" | "sponsor";

export interface DbAdSlot {
  id: string;
  slot_name: string;
  type: AdSlotType;
  ad_code: string | null;
  is_active: boolean;
  updated_at?: string;
}

export interface AnnouncementBarConfig {
  id?: string;
  text: string;
  link_url?: string | null;
  is_active: boolean;
  updated_at?: string;
}
