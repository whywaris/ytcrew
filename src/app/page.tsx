import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createPublicClient } from "@/lib/supabase/server";
import { toolDefinitions } from "@/lib/tool-definitions";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Video,
  UserCheck,
  MessageSquare,
  Image as ImageIcon,
  UserPlus,
  Crop,
  Link2,
  Calculator,
  Download,
  Type,
  CheckCircle2,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "YT Crew – 100% Free YouTube Tools for Creators",
  description:
    "YT Crew brings free tools for YouTube creators in one place — from timestamps to banner and thumbnail tools. Simple, fast, client-side, and 100% free to use.",
};

// Revalidate page cache periodically
export const revalidate = 60;

/**
 * Icon mapper for tool slugs
 */
function getToolIcon(slug: string, iconName?: string | null): React.ComponentType<{ className?: string }> {
  if (iconName) {
    // Custom icon string matching if stored in DB
    switch (iconName.toLowerCase()) {
      case "clock": return Clock;
      case "video": return Video;
      case "usercheck": return UserCheck;
      case "messagesquare": return MessageSquare;
      case "image": return ImageIcon;
      case "userplus": return UserPlus;
      case "crop": return Crop;
      case "link2": return Link2;
      case "calculator": return Calculator;
      case "download": return Download;
      case "type": return Type;
    }
  }

  // Slug-based icon mapping
  switch (slug) {
    case "youtube-timestamp-link-generator":
      return Clock;
    case "youtube-video-frame-by-frame":
      return Video;
    case "youtube-username-generator":
      return UserCheck;
    case "fake-youtube-comment-generator":
      return MessageSquare;
    case "youtube-banner-resizer":
      return ImageIcon;
    case "youtube-subscribe-link-generator":
      return UserPlus;
    case "youtube-thumbnail-resizer":
      return Crop;
    case "youtube-video-backlink-generator":
      return Link2;
    case "youtube-watch-time-calculator":
      return Calculator;
    case "youtube-thumbnail-downloader":
      return Download;
    case "youtube-font-generator":
      return Type;
    default:
      return Wrench;
  }
}

interface ActiveTool {
  id?: string;
  slug: string;
  title: string;
  short_description?: string | null;
  icon?: string | null;
}

/**
 * Server-side helper to fetch active tools from Supabase with fallback to toolDefinitions.
 */
async function getActiveTools(): Promise<ActiveTool[]> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("tools")
        .select("id, slug, title, short_description, icon, status")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          slug: t.slug,
          title: t.title,
          short_description: t.short_description,
          icon: t.icon,
        }));
      }
    }
  } catch (err) {
    console.warn("[Homepage] Failed to fetch tools from Supabase, using local fallback.", err);
  }

  // Fallback to static active tool definitions
  return Object.values(toolDefinitions)
    .filter((t) => t.status === "active")
    .map((t) => ({
      slug: t.slug,
      title: t.title,
      short_description: t.description,
    }));
}

export default async function Home() {
  const tools = await getActiveTools();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-background via-card/20 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-6">
            <div className="flex items-center justify-center">
              <Badge variant="accent" className="px-3.5 py-1 text-xs gap-1.5 inline-flex shadow-sm shadow-red-500/10">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100% Free YouTube Creator Tools</span>
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Grow Your YouTube Channel With{" "}
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-400">
                YT Crew
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fast, high-performance creator tools to generate timestamps, inspect frames, resize banners, create thumbnails, and accelerate your growth. 100% free with no sign-up.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/youtube-timestamp-link-generator">
                <Button size="lg" className="gap-2 shadow-lg shadow-indigo-500/25">
                  <Clock className="h-4 w-4" />
                  <span>Try Timestamp Generator</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" size="lg">
                  Why YT Crew?
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Tools Showcase */}
        <section className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Creator Toolkit</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Featured & Popular Tools
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Hand-crafted utilities designed to save hours of production and editing time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1.5 py-1 px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{tools.length} Tools Live Now</span>
                </Badge>
              </div>
            </div>

            {/* Tools Grid */}
            {tools.length === 0 ? (
              <div className="p-12 text-center border border-border rounded-xl bg-card">
                <p className="text-sm text-muted-foreground">No active tools available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const Icon = getToolIcon(tool.slug, tool.icon);

                  return (
                    <Link key={tool.slug} href={`/${tool.slug}`} className="block h-full group">
                      <Card className="h-full flex flex-col justify-between transition-all duration-200 border-border bg-card hover:border-primary hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer">
                        <CardHeader className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-primary/15 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Icon className="h-5 w-5" />
                            </div>
                            <Badge variant="success" className="text-[11px]">
                              Live Now
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed mt-2 text-muted-foreground line-clamp-3">
                            {tool.short_description || "High-performance creator tool for YouTube."}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 pt-0">
                          <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">
                              Client-Side Tool
                            </span>
                            <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Open Tool <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose YT Crew / USPs */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Why YouTube Creators Choose YT Crew
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Built from the ground up for speed, privacy, and frictionless workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/70 border-border">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle>Instant & Client-Side</CardTitle>
                  <CardDescription>
                    All formatting, timestamp links, and image resizing run client-side for zero latency and complete data privacy.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/70 border-border">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <CardTitle>100% Free Forever</CardTitle>
                  <CardDescription>
                    No paywalls, no forced logins, and no hidden subscriptions. Access every creator tool unconditionally.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/70 border-border">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5" />
                  </div>
                  <CardTitle>Dark-Mode First Design</CardTitle>
                  <CardDescription>
                    Sleek dark interface designed for video editors and creators working in low-light editing suites.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
