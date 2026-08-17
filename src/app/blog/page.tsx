import type { Metadata } from "next";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DbBlogPost } from "@/types";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "YouTube Creator Blog & Growth Guides | YT Crew",
  description:
    "Free guides, tutorials, and growth strategies for YouTube creators. Learn how to grow your channel, optimize video SEO, and boost retention.",
  openGraph: {
    title: "YouTube Creator Blog & Growth Guides | YT Crew",
    description:
      "Free guides, tutorials, and growth strategies for YouTube creators. Learn how to grow your channel, optimize video SEO, and boost retention.",
    type: "website",
  },
};

export default async function BlogListingPage() {
  let posts: DbBlogPost[] = [];

  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data) {
        posts = data as DbBlogPost[];
      }
    }
  } catch (err) {
    console.warn("[Blog Listing] Failed to load published posts from Supabase:", err);
  }

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Blog Header */}
        <section className="border-b border-border/40 bg-card/30 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Creator Knowledge Base</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              YouTube Guides & Tutorials
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Actionable guides, growth tactics, and SEO strategies built to help YouTube creators scale their channels.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 space-y-12">
          {posts.length > 0 ? (
            <>
              {/* 1. Featured Article (Most Recent Published Post) */}
              {featuredPost && (
                <article className="group relative rounded-3xl border border-border bg-card overflow-hidden shadow-lg transition-all hover:border-primary/50 hover:shadow-primary/5">
                  <Link href={`/blog/${featuredPost.slug}`} className="block">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      {/* Featured Image */}
                      <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-secondary/50">
                        {featuredPost.featured_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={featuredPost.featured_image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-background flex items-center justify-center p-8">
                            <BookOpen className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                      </div>

                      {/* Featured Body */}
                      <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>

                        {featuredPost.excerpt && (
                          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3">
                            {featuredPost.excerpt}
                          </p>
                        )}

                        <div className="pt-2 flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                          <span>Read Complete Guide</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {/* 2. Grid of Remaining Posts */}
              {remainingPosts.length > 0 && (
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {remainingPosts.map((post) => (
                      <article
                        key={post.id}
                        className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                      >
                        <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                          {/* Card Image */}
                          <div className="aspect-[16/9] w-full overflow-hidden bg-secondary/50 relative">
                            {post.featured_image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-900/30 to-background flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-2">
                              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {post.title}
                              </h3>
                              {post.excerpt && (
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                              <span>Read Guide</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mx-auto text-muted-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Articles Coming Soon
              </h2>
              <p className="text-sm text-muted-foreground">
                We are currently crafting in-depth YouTube creator guides, algorithm breakdowns, and growth playbooks. Check back soon!
              </p>
              <div className="pt-2">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <span>Explore Free Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
