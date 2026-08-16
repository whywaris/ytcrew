import Link from "next/link";
import { Search, Wrench } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ads/ad-slot";

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <svg
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
                YT <span className="text-primary">Crew</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                Creator Toolkit
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/tools"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Wrench className="h-4 w-4" />
              All Tools
            </Link>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/tools" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                <span>Search Tools...</span>
                <kbd className="pointer-events-none hidden lg:inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Header Banner Ad Slot (Cleanly separated below header bar) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <AdSlot slotName="header_banner" />
      </div>
    </>
  );
}
