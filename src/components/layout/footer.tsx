import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { NewsletterForm } from "./newsletter-form";

interface FooterProps {
  categories?: Array<{
    id?: string;
    name: string;
    slug: string;
  }>;
}

export function Footer(_props: FooterProps = {}) {
  return (
    <>
      {/* Footer Ad Slot Placement (Cleanly positioned ABOVE footer) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-8">
        <AdSlot slotName="footer" />
      </div>

      <footer className="w-full border-t border-border/60 bg-card/40">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-7xl">
          {/* 4-Column Layout: 4 cols desktop, 2 cols tablet, 1 col mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* ========================================================================= */}
            {/* COLUMN 1: Brand, Tagline & Social Links                                   */}
            {/* ========================================================================= */}
            <div className="space-y-3.5">
              <Link href="/" className="flex items-center gap-2.5 group inline-flex">
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

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Free tools for YouTube creators, all in one place.
              </p>

              {/* Social Icons Row */}
              <div className="flex items-center gap-2 pt-1">
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-secondary/50 border border-border/60 text-muted-foreground hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-secondary/50 border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord Community"
                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-secondary/50 border border-border/60 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* COLUMN 2: Company                                                         */}
            {/* ========================================================================= */}
            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase mb-3.5">
                Company
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/policy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            {/* ========================================================================= */}
            {/* COLUMN 3: Resources                                                       */}
            {/* ========================================================================= */}
            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase mb-3.5">
                Resources
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/youtube-automation-tools"
                    className="hover:text-foreground transition-colors"
                  >
                    YouTube Automation Tools
                  </Link>
                </li>
                <li>
                  <Link href="/disclosure" className="hover:text-foreground transition-colors">
                    Affiliate Disclosure
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>

            {/* ========================================================================= */}
            {/* COLUMN 4: Newsletter Signup ("Emails Collect")                           */}
            {/* ========================================================================= */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">
                Stay Updated
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get notified about new tools and creator tips.
              </p>

              <NewsletterForm />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM BAR: Centered Copyright Text                                       */}
          {/* ========================================================================= */}
          <div className="mt-12 pt-8 border-t border-border/60 text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 YT Crew - All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
