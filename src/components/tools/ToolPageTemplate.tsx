import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SocialShare } from "@/components/blog/social-share";
import { ToolHeader } from "./tool-header";
import { ToolHowTo } from "./tool-how-to";
import { ToolFAQ } from "./tool-faq";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToolFAQItem, ToolHowToStep } from "@/types";
import { AdSlot } from "@/components/ads/ad-slot";

export interface RelatedToolItem {
  slug: string;
  name: string;
  shortDescription: string;
}

export interface ToolPageTemplateProps {
  title: string;
  description: string;
  category?: string;
  slug?: string;
  howToSteps?: ToolHowToStep[];
  aboutContent?: React.ReactNode;
  faqs?: ToolFAQItem[];
  relatedTools?: RelatedToolItem[];
  children: React.ReactNode;
}

/**
 * Reusable Tool Page Template matching the structure defined in CLAUDE.md:
 * - SEO: Invisible BreadcrumbList JSON-LD schema (Home > Tools > Tool Name)
 * - Visual: Tool Header (H1 + short desc) → Tool Interface (slot) → Social Share → Trust Bar
 *   → How to Use (numbered steps) → About This Tool (SEO content) → FAQ (with FAQ schema) → Related Tools
 */
export function ToolPageTemplate({
  title,
  description,
  category: _category,
  slug,
  howToSteps = [],
  aboutContent,
  faqs = [],
  relatedTools = [],
  children,
}: ToolPageTemplateProps) {
  // Retained in props for filtering, metadata, and internal categorization
  void _category;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytcrew.com";
  const toolUrl = slug ? `${siteUrl}/${slug}` : `${siteUrl}`;

  // BreadcrumbList JSON-LD Schema (Kept for search engine hierarchy, visual UI hidden per spec)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": toolUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 1. SEO Breadcrumb Schema in head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        {/* 2. Tool Header (H1 + short description, category badge removed from UI) */}
        <ToolHeader
          title={title}
          description={description}
        />

        {/* 3. Tool Interface (Interactive input/output area above the fold) */}
        <div className="my-6">{children}</div>

        {/* In-Tool Result Ad Slot Placement */}
        <AdSlot slotName="in_tool_result" />

        {/* Social Share Section */}
        <div className="my-6 py-4 px-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Found this useful? Share it:
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Help other creators discover this free tool
            </p>
          </div>
          <SocialShare
            url={toolUrl}
            title={`${title} - Free YouTube Tool`}
            orientation="horizontal"
            className="flex-wrap justify-center"
          />
        </div>

        {/* Trust Bar */}
        <div className="my-8 py-3.5 px-6 rounded-xl border border-border/60 bg-card/40 flex flex-wrap items-center justify-around gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>100% Free & No Sign-up Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Instant Client-Side Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Optimized for YouTube Creators</span>
          </div>
        </div>

        {/* 4. How to Use (Numbered steps) */}
        {howToSteps.length > 0 && (
          <ToolHowTo steps={howToSteps} toolName={title} />
        )}

        {/* 5. About This Tool (SEO Copy) */}
        {aboutContent && (
          <section className="my-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                About {title}
              </h2>
            </div>
            <div className="max-w-3xl mx-auto text-muted-foreground leading-relaxed space-y-4 text-sm sm:text-base">
              {aboutContent}
            </div>
          </section>
        )}

        {/* 6. FAQ (with FAQ JSON-LD Schema) */}
        {faqs.length > 0 && (
          <ToolFAQ faqs={faqs} toolName={title} />
        )}

        {/* 7. Related Tools (Links updated to root /[slug] format) */}
        {relatedTools.length > 0 && (
          <section className="my-12 border-t border-border/40 pt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Related YouTube Creator Tools
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                More free tools to help you produce and optimize YouTube content
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedTools.map((rel) => (
                <Link key={rel.slug} href={`/${rel.slug}`}>
                  <Card className="h-full hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group shadow-sm">
                    <CardHeader className="p-5">
                      <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {rel.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {rel.shortDescription}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ToolPageTemplate;
