import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { SocialShare } from "@/components/blog/social-share";
import { BackToTop } from "@/components/ui/back-to-top";
import { AdSlot } from "@/components/ads/ad-slot";
import { processBlogContent, splitContentForAd } from "@/lib/blog-utils";
import { DbBlogPost } from "@/types";
import { BookOpen, Calendar, User } from "lucide-react";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate SEO metadata for single blog posts
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();

  if (!supabase) {
    return { title: "Blog - YT Crew" };
  }

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  const post = data as DbBlogPost | null;

  if (!post) {
    return {
      title: "Post Not Found - YT Crew",
    };
  }

  const title = post.seo_title || `${post.title} | YT Crew Blog`;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      images: post.featured_image
        ? [
            {
              url: post.featured_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
  };
}

export default async function SingleBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createPublicClient();

  if (!supabase) {
    notFound();
  }

  // 1. Fetch current post
  const { data: postData, error: postError } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (postError || !postData) {
    notFound();
  }

  const post = postData as DbBlogPost;

  // 2. Fetch related published posts (most recent other articles)
  const { data: relatedData } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image")
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const relatedPosts = (relatedData as DbBlogPost[]) || [];

  // 3. Process HTML content and extract Table of Contents (with HTML entity decoding)
  const { toc, processedHtml } = processBlogContent(post.content || "");
  const { beforeAd, afterAd } = splitContentForAd(processedHtml);

  // 4. Format display date
  const displayDate = post.updated_at || post.published_at;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  // 5. Article JSON-LD Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image ? [post.featured_image] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      "@type": "Organization",
      name: "YT Crew Team",
    },
    publisher: {
      "@type": "Organization",
      name: "YT Crew",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ytcrew.com/blog/${post.slug}`,
    },
  };

  const articleUrl = `https://ytcrew.com/blog/${post.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground scroll-smooth">
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Header />

      <main className="flex-1 pb-20">
        {/* 1. HERO SECTION: Solid, Shorter Indigo Band */}
        <section className="relative bg-indigo-600 dark:bg-indigo-700/90 text-white pt-10 pb-20 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10 space-y-6 text-center">
            {/* Post Title (Large, Bold, Forced White Text, Centered) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] sm:leading-[1.15]">
              {post.title}
            </h1>

            {/* Author Info (Directly on Hero Band, No Card/Box Container) */}
            <div className="flex justify-center pt-1">
              <div className="inline-flex items-center gap-3 text-left">
                {/* 1. Circular Avatar on Left */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white border border-white/30 shadow-xs">
                  <User className="h-5 w-5" />
                </div>

                {/* 2. Two Stacked Lines Next to Avatar */}
                <div className="flex flex-col justify-center space-y-0.5 min-w-0">
                  <div className="text-xs sm:text-sm font-normal text-white">
                    Written by <strong className="font-semibold text-white">YT Crew Team</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/80">
                    <Calendar className="h-3.5 w-3.5 text-white/70 shrink-0" />
                    <span>Last updated on {formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Social Share Bar */}
            <div className="flex justify-center pt-2 lg:hidden">
              <SocialShare
                url={articleUrl}
                title={post.title}
                orientation="horizontal"
              />
            </div>
          </div>
        </section>

        {/* 2. OVERLAPPING FLOATING FEATURED IMAGE (Card Effect) */}
        {post.featured_image && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl -mt-14 sm:-mt-20 lg:-mt-24 relative z-20">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/20 dark:shadow-black/60 border-4 border-background bg-card aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 3. LAYOUT BELOW HERO (Left TOC Sidebar + Main Content + Right Sticky Share Stack) */}
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl ${post.featured_image ? "pt-8 sm:pt-12" : "pt-10 sm:pt-14"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Sidebar (3 Cols on Desktop): Sticky "On this page" TOC + Related Guides */}
            <aside className="order-2 lg:order-1 lg:col-span-3 space-y-6 lg:sticky lg:top-24">
              {/* 1. On this page (Table of Contents) */}
              {toc.length > 0 && <TableOfContents items={toc} />}

              {/* Sidebar Ad Placement */}
              <AdSlot slotName="sidebar" />

              {/* 2. Related Posts Card */}
              {relatedPosts.length > 0 && (
                <div className="p-5 rounded-2xl border border-border bg-card/80 backdrop-blur-md space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground pb-2 border-b border-border/60">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Related Guides</span>
                  </div>

                  <div className="space-y-3">
                    {relatedPosts.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/blog/${rel.slug}`}
                        className="group flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors"
                      >
                        {rel.featured_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={rel.featured_image}
                            alt={rel.title}
                            className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border">
                            <BookOpen className="h-5 w-5 text-primary/50" />
                          </div>
                        )}

                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {rel.title}
                          </h4>
                          {rel.excerpt && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {rel.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Center Column (8 Cols on Desktop): Article Body */}
            <article className="order-1 lg:order-2 lg:col-span-8 space-y-8 min-w-0">
              {/* Article Section 1 (First Half) */}
              <div
                className="blog-content-body prose prose-invert max-w-none text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: beforeAd }}
              />

              {/* In-Article / Blog Content Ad Placement (Middle of Article) */}
              <AdSlot slotName="blog_content" />

              {/* Article Section 2 (Second Half) */}
              {afterAd && (
                <div
                  className="blog-content-body prose prose-invert max-w-none text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: afterAd }}
                />
              )}

            </article>

            {/* Right Column (1 Col on Desktop): Floating Sticky Social Share Stack */}
            <aside className="hidden lg:flex lg:order-3 lg:col-span-1 justify-center lg:sticky lg:top-28">
              <SocialShare
                url={articleUrl}
                title={post.title}
                orientation="vertical"
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
}
