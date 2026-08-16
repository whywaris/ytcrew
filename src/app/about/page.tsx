import type { Metadata } from "next";
import Link from "next/link";
import {
  Wrench,
  Sparkles,
  Zap,
  ShieldCheck,
  Heart,
  ArrowRight,
  TrendingUp,
  Sliders,
  Layers,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "About Us | YT Crew",
  description:
    "Learn about YT Crew — our mission to provide 86+ completely free YouTube tools and guides to help creators save time, rank higher, and grow their channels without expensive software.",
};

const STATS = [
  {
    label: "Free Creator Tools",
    value: "86+",
    description: "Generators, resizers, audits & calculators",
    icon: Wrench,
    color: "from-indigo-500 to-violet-600",
  },
  {
    label: "Zero Signups Needed",
    value: "100%",
    description: "Instant access with no account barriers",
    icon: Zap,
    color: "from-rose-500 to-amber-600",
  },
  {
    label: "Always Free to Use",
    value: "$0",
    description: "No paywalls or hidden trial subscriptions",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
  },
  {
    label: "Privacy First",
    value: "Safe",
    description: "No data harvesting or credential storage",
    icon: ShieldCheck,
    color: "from-sky-500 to-indigo-600",
  },
];

const CATEGORIES = [
  {
    title: "SEO & Ranking Tools",
    description:
      "Tag generators, keyword research aids, title score optimizers, and description formatters built to maximize YouTube search reach and algorithmic discovery.",
    icon: TrendingUp,
  },
  {
    title: "AI-Powered Assistants",
    description:
      "Smart title ideation, video hook generators, chapter timestamp makers, and thumbnail concept generators designed to eliminate creator block.",
    icon: Sparkles,
  },
  {
    title: "Generators & Formatting",
    description:
      "Timestamp link creators, subscribe link generators, markdown convertors, and social media text formatters that save hours of tedious manual prep.",
    icon: Sliders,
  },
  {
    title: "Channel Growth & Calculators",
    description:
      "AdSense revenue estimators, engagement rate calculators, video length analyzers, and channel audit helpers to inform your content strategy.",
    icon: Layers,
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Heart className="h-3.5 w-3.5 fill-primary" />
              <span>Built for YouTube Creators</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Empowering creators with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500">
                free, modern tools
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              YT Crew is an open directory of 86+ high-utility web tools, generators, and growth guides crafted to help you produce faster, rank higher, and build a lasting audience on YouTube.
            </p>
          </div>

          {/* Highlight Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* The Mission Section */}
          <div className="rounded-3xl bg-card border border-border/80 p-8 sm:p-10 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Why We Built YT Crew
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <p>
                  Starting and growing a YouTube channel is one of the most rewarding creative pursuits, but it also comes with countless repetitive tasks: formatting timestamp links, calculating aspect ratios, researching keyword tags, and optimizing metadata for search visibility.
                </p>
                <p>
                  Too many existing creator platforms lock simple, daily utilities behind expensive recurring subscriptions. We believe every creator—whether publishing their first video or managing a channel with millions of subscribers—deserves access to top-tier tools without financial barriers.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  YT Crew was built by a small team of creators, software engineers, and digital video enthusiasts who wanted a single, lightning-fast workspace for all YouTube utilities.
                </p>
                <p>
                  Our philosophy is simple: <strong>fast, zero-friction, and privacy-respecting</strong>. No accounts to create, no software to download, and no paywalls. Just open your browser, get what you need done in seconds, and get back to making great videos.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer / Category Highlights */}
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                What You&apos;ll Find on YT Crew
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Everything you need across every stage of the video production workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-border transition-all flex items-start gap-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-foreground">
                        {cat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call To Action Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-background border border-primary/30 p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-3 max-w-xl mx-auto relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Ready to supercharge your YouTube channel?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore our complete suite of 86+ free utilities or read our in-depth creator tutorials and algorithm guides.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
              <Link href="/tools">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-indigo-500/25">
                  <Wrench className="h-4 w-4" />
                  <span>Explore All Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Read Creator Blog</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
