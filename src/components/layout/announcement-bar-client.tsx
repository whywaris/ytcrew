"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnnouncementBarConfig } from "@/types";
import { Sparkles, ArrowRight } from "lucide-react";

interface AnnouncementBarClientProps {
  config: AnnouncementBarConfig | null;
}

export function AnnouncementBarClient({ config }: AnnouncementBarClientProps) {
  const pathname = usePathname();

  // 1. Exclude all /admin and /admin/* routes
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");

  // 2. Exclude specifically on individual blog post pages (/blog/[slug])
  const isSingleBlogPost =
    pathname?.startsWith("/blog/") &&
    pathname !== "/blog" &&
    pathname !== "/blog/";

  if (isAdminRoute || isSingleBlogPost || !config || !config.is_active || !config.text) {
    return null;
  }

  const content = (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition-colors hover:brightness-105">
      <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-90 animate-pulse" />
      <span className="truncate">{config.text}</span>
      {config.link_url && (
        <span className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 ml-1 text-white/90 shrink-0">
          <span>Learn More</span>
          <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </div>
  );

  if (config.link_url) {
    const isExternal = config.link_url.startsWith("http");
    return (
      <aside aria-label="Announcement">
        {isExternal ? (
          <a
            href={config.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {content}
          </a>
        ) : (
          <Link href={config.link_url} className="block">
            {content}
          </Link>
        )}
      </aside>
    );
  }

  return <aside aria-label="Announcement">{content}</aside>;
}
