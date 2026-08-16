import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Wrench,
  BookOpen,
  FolderTree,
  Megaphone,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Plus,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Overview | YT Crew Admin",
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Fetch live counts from database
  const [
    { count: totalToolsCount },
    { count: activeToolsCount },
    { count: blogPostsCount },
    { count: publishedPostsCount },
    { count: categoriesCount },
    { count: activeAdsCount },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("ad_slots").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const toolsTotal = totalToolsCount ?? 0;
  const toolsActive = activeToolsCount ?? 0;
  const postsTotal = blogPostsCount ?? 0;
  const postsPublished = publishedPostsCount ?? 0;
  const catsTotal = categoriesCount ?? 0;
  const adsActive = activeAdsCount ?? 0;

  const statCards = [
    {
      title: "Creator Tools",
      count: toolsTotal,
      subtext: `${toolsActive} Active & Public`,
      href: "/admin/tools",
      icon: Wrench,
      accentBorder: "from-indigo-500 via-indigo-600 to-cyan-500",
      iconBg: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
      glowBg: "from-indigo-500/10 to-transparent",
      badgeText: "Tools Library",
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    },
    {
      title: "Blog Articles",
      count: postsTotal,
      subtext: `${postsPublished} Published live`,
      href: "/admin/blog",
      icon: BookOpen,
      accentBorder: "from-rose-500 via-pink-600 to-purple-500",
      iconBg: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
      glowBg: "from-rose-500/10 to-transparent",
      badgeText: "Guides & SEO",
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    },
    {
      title: "Tool Categories",
      count: catsTotal,
      subtext: "Organized taxonomy",
      href: "/admin/categories",
      icon: FolderTree,
      accentBorder: "from-emerald-500 via-teal-600 to-cyan-500",
      iconBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      glowBg: "from-emerald-500/10 to-transparent",
      badgeText: "Taxonomy",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      title: "Monetization Slots",
      count: adsActive,
      subtext: "Active Ad/Sponsor units",
      href: "/admin/ads",
      icon: DollarSign,
      accentBorder: "from-amber-500 via-orange-600 to-emerald-500",
      iconBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      glowBg: "from-amber-500/10 to-transparent",
      badgeText: "Revenue Units",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
  ];

  const quickActions = [
    {
      title: "Write Blog Post",
      desc: "Draft a new YouTube tutorial or guide",
      href: "/admin/blog/new",
      icon: Plus,
      color: "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white",
    },
    {
      title: "Manage Tools Catalog",
      desc: "Toggle statuses and edit SEO descriptions",
      href: "/admin/tools",
      icon: Wrench,
      color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500 hover:text-white",
    },
    {
      title: "Announcement Banner",
      desc: "Broadcast sitewide alerts & updates",
      href: "/admin/announcement",
      icon: Megaphone,
      color: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-white",
    },
    {
      title: "Ads & Sponsorships",
      desc: "Configure AdSense and direct sponsor slots",
      href: "/admin/ads",
      icon: DollarSign,
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#2b2b3d] bg-gradient-to-br from-[#161626] via-[#12121c] to-[#0e0e15] p-6 sm:p-8 shadow-2xl">
        {/* Background glow flares */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-48 w-48 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Admin Control Center</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Live</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back to <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">YT Crew</span> Console
            </h1>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Monitor creator tool metrics, publish blog tutorials, organize categories, and configure advertising slots from one centralized interface.
            </p>
          </div>

          {/* System Health Badge */}
          <div className="flex items-center gap-3 bg-[#1c1c2b]/90 border border-[#2e2e42] p-4 rounded-2xl shrink-0 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  System Health
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-xs text-[#94a3b8]">RLS & DB Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top High-Impact Stat Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span>Platform Metrics</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <Link
                key={index}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-[#252538] bg-[#141420] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#3d3d5c] hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between"
              >
                {/* Top border colored accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentBorder}`} />

                {/* Subtle top corner gradient glow */}
                <div className={`absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${card.glowBg} blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />

                <div>
                  <div className="flex items-center justify-between pb-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${card.badgeColor}`}>
                      {card.badgeText}
                    </span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${card.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-3xl font-extrabold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                      {card.count}
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mt-0.5">
                      {card.title}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#222234] flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">{card.subtext}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Quick Admin Actions</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;

            return (
              <Link
                key={index}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-[#222234] bg-[#12121d] p-4 sm:p-5 transition-all duration-200 hover:bg-[#181827] hover:border-[#34344d] hover:shadow-lg hover:shadow-black/30"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                      <span>{action.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {action.desc}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
