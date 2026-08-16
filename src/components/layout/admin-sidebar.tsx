"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavItems } from "./admin-shell";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#222232] bg-[#111119]/95 backdrop-blur-xl min-h-screen p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Admin Brand */}
        <div className="px-2 py-1.5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                YT Crew <span className="text-indigo-400">Admin</span>
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                Creator Console
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
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
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-all shrink-0",
                    isActive ? "bg-white/20 text-white" : item.badgeBg
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

      {/* Back to Public Site */}
      <div className="pt-4 border-t border-[#222232]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-[#1a1a26] border border-transparent hover:border-[#2b2b3d] transition-all group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Main Site</span>
        </Link>
      </div>
    </aside>
  );
}
