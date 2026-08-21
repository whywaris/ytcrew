"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wrench,
  Bot,
  BookOpen,
  FolderTree,
  Megaphone,
  DollarSign,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  activeBg: string;
  activeBorder: string;
  activeGlow: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    accentColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25 group-hover:text-indigo-300",
    activeBg: "bg-gradient-to-r from-indigo-600/90 via-indigo-600 to-violet-600 text-white font-semibold",
    activeBorder: "border-indigo-400/40",
    activeGlow: "shadow-lg shadow-indigo-500/25",
  },
  {
    name: "Manage Tools",
    href: "/admin/tools",
    icon: Wrench,
    accentColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 group-hover:text-cyan-300",
    activeBg: "bg-gradient-to-r from-cyan-600/90 via-blue-600 to-indigo-600 text-white font-semibold",
    activeBorder: "border-cyan-400/40",
    activeGlow: "shadow-lg shadow-cyan-500/25",
  },
  {
    name: "Automation Tools",
    href: "/admin/automation-tools",
    icon: Bot,
    accentColor: "text-purple-400",
    badgeBg: "bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 group-hover:text-purple-300",
    activeBg: "bg-gradient-to-r from-purple-600/90 via-violet-600 to-indigo-600 text-white font-semibold",
    activeBorder: "border-purple-400/40",
    activeGlow: "shadow-lg shadow-purple-500/25",
  },
  {
    name: "Manage Blog",
    href: "/admin/blog",
    icon: BookOpen,
    accentColor: "text-rose-400",
    badgeBg: "bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25 group-hover:text-rose-300",
    activeBg: "bg-gradient-to-r from-rose-600/90 via-pink-600 to-purple-600 text-white font-semibold",
    activeBorder: "border-rose-400/40",
    activeGlow: "shadow-lg shadow-rose-500/25",
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    accentColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:text-emerald-300",
    activeBg: "bg-gradient-to-r from-emerald-600/90 via-teal-600 to-cyan-600 text-white font-semibold",
    activeBorder: "border-emerald-400/40",
    activeGlow: "shadow-lg shadow-emerald-500/25",
  },
  {
    name: "Announcement Bar",
    href: "/admin/announcement",
    icon: Megaphone,
    accentColor: "text-amber-400",
    badgeBg: "bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 group-hover:text-amber-300",
    activeBg: "bg-gradient-to-r from-amber-600/90 via-orange-600 to-rose-600 text-white font-semibold",
    activeBorder: "border-amber-400/40",
    activeGlow: "shadow-lg shadow-amber-500/25",
  },
  {
    name: "Ads Manager",
    href: "/admin/ads",
    icon: DollarSign,
    accentColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:text-emerald-300",
    activeBg: "bg-gradient-to-r from-emerald-600/90 via-green-600 to-teal-600 text-white font-semibold",
    activeBorder: "border-emerald-400/40",
    activeGlow: "shadow-lg shadow-emerald-500/25",
  },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const supabase = createClient();

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  };

  const currentNav = adminNavItems.find(
    (item) =>
      item.href === pathname ||
      (item.href !== "/admin" && pathname?.startsWith(item.href))
  );

  return (
    <div className="min-h-screen flex bg-[#0c0c10] text-[#f5f5f7]">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop sticky + Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-[#222232] bg-[#111119]/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          mobileMenuOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    YT Crew
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  Creator Console
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-muted-foreground hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? cn(item.activeBg, item.activeGlow, "border", item.activeBorder)
                      : "text-slate-400 hover:bg-[#1c1c28] hover:text-white"
                  )}
                >
                  {/* Colored Icon Badge */}
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-all shrink-0",
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeBg
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="truncate">{item.name}</span>

                  {isActive && (
                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#222232] space-y-2 bg-[#0e0e16]/60">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-[#1a1a26] border border-transparent hover:border-[#2b2b3d] transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>View Public Site</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-[#222232] bg-[#111119]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Current Section Badge */}
            {currentNav && (
              <div className="hidden sm:flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs",
                    currentNav.badgeBg
                  )}
                >
                  <currentNav.icon className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <span>{currentNav.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Actions: Super Admin Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161624] text-xs border border-[#262638] shadow-xs">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shadow-indigo-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-white tracking-wide">
                Super Admin
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-1.5 text-xs text-slate-300 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 border-[#2b2b3d] bg-[#1a1a26] transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{loggingOut ? "Signing out..." : "Logout"}</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
