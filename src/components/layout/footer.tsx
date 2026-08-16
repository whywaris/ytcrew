import Link from "next/link";
import { Heart } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";

export function Footer() {
  return (
    <>
      {/* Footer Ad Slot Placement (Cleanly positioned ABOVE footer) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-8">
        <AdSlot slotName="footer" />
      </div>

      <footer className="w-full border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand & Description */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span className="font-bold text-base tracking-tight">YT Crew</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                86+ free utilities and AI-powered tools built specifically to help YouTube creators grow, optimize, and scale.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">
                Popular Tools
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/banner-resizer" className="hover:text-foreground transition-colors">
                    Banner Resizer
                  </Link>
                </li>
                <li>
                  <Link href="/thumbnail-resizer" className="hover:text-foreground transition-colors">
                    Thumbnail Resizer
                  </Link>
                </li>
                <li>
                  <Link href="/title-generator" className="hover:text-foreground transition-colors">
                    AI Title Generator
                  </Link>
                </li>
                <li>
                  <Link href="/channel-audit" className="hover:text-foreground transition-colors">
                    Channel Audit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">
                Categories
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/tools?category=generators" className="hover:text-foreground transition-colors">
                    Generators & Formatting
                  </Link>
                </li>
                <li>
                  <Link href="/tools?category=ai-tools" className="hover:text-foreground transition-colors">
                    AI Creator Tools
                  </Link>
                </li>
                <li>
                  <Link href="/tools?category=analytics" className="hover:text-foreground transition-colors">
                    Analytics & Audits
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Creator Guides & Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal / Info */}
            <div>
              <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">
                Legal & Support
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/policy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} YT Crew. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built for creators with <Heart className="h-3.5 w-3.5 text-accent fill-accent" />
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
