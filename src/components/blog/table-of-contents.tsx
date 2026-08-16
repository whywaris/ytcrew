"use client";

import * as React from "react";
import { TocItem } from "@/lib/blog-utils";
import { List, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "0px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="p-5 rounded-2xl border border-border bg-card/80 backdrop-blur-md space-y-3"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground pb-2 border-b border-border/60">
        <List className="h-4 w-4 text-primary" />
        <span>On this page</span>
      </div>

      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={cn(
                "transition-colors",
                item.level === 3 ? "pl-3 text-[11px]" : "font-medium"
              )}
            >
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex items-start gap-1 py-1 hover:text-foreground transition-colors group",
                  isActive && "text-primary font-semibold"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 shrink-0 mt-0.5 transition-transform",
                    isActive
                      ? "text-primary translate-x-0.5"
                      : "text-muted-foreground/40 group-hover:text-muted-foreground"
                  )}
                />
                <span className="line-clamp-2">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
