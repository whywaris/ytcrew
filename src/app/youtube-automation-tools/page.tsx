import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createPublicClient } from "@/lib/supabase/server";
import { DbAutomationTool } from "@/types";
import { AutomationToolsDirectory } from "@/components/tools/automation-tools-directory";
import {
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best YouTube Automation Tools | YT Crew",
  description:
    "Explore the best YouTube automation tools like scriptwriting, voiceovers, editing, and thumbnails to scale your channel with ease.",
  openGraph: {
    title: "Best YouTube Automation Tools | YT Crew",
    description:
      "Explore the best YouTube automation tools like scriptwriting, voiceovers, editing, and thumbnails to scale your channel with ease.",
    type: "website",
  },
};

export const revalidate = 60;

async function getAutomationTools(): Promise<DbAutomationTool[]> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("automation_tools")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data as DbAutomationTool[];
      }
    }
  } catch (err) {
    console.warn("[Automation Tools] Failed to fetch from Supabase:", err);
  }

  return [];
}

export default async function YoutubeAutomationToolsPage() {
  const tools = await getAutomationTools();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden py-14 sm:py-20 border-b border-border/40 bg-gradient-to-b from-background via-card/25 to-background">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full"
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10 space-y-5">
            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                YouTube{" "}
                <span className="text-indigo-600 dark:text-indigo-400 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
                  Automation Tools
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover the best AI software, script generators, voiceover platforms, video editors, and thumbnail tools creators use to scale their channel workflows.
              </p>
            </div>

            {/* Affiliate Disclosure Notice */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/60 border border-border/60 text-xs text-muted-foreground shadow-xs">
                <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>
                  This page may contain affiliate links — see our{" "}
                  <Link
                    href="/disclosure"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                  >
                    Disclosure Policy
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. DIRECTORY TOOLS SECTIONS                                               */}
        {/* ========================================================================= */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {tools.length === 0 ? (
              /* Empty State when no tools published yet */
              <div className="py-16 px-6 text-center border border-dashed border-border/80 rounded-3xl bg-card/40 max-w-md mx-auto space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground">Tools Coming Soon</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We are currently curating and verifying top-tier YouTube automation tools for this directory. Check back soon or explore our free native tools on the homepage!
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span>Explore Native Creator Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <AutomationToolsDirectory tools={tools} />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

