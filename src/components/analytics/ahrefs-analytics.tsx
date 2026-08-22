"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Ahrefs Web Analytics Tracker Component
 *
 * Implements non-blocking, asynchronous telemetry using Next.js `next/script`
 * with `afterInteractive` loading strategy.
 *
 * Excludes internal admin routes (/admin) to avoid skewing creator analytics.
 */
export function AhrefsAnalytics() {
  const analyticsKey = process.env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY;
  const pathname = usePathname();

  // If no Ahrefs analytics key is configured, do not render script
  if (!analyticsKey) {
    return null;
  }

  // Exclude internal admin dashboard from analytics tracking
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Script
      strategy="afterInteractive"
      src="https://analytics.ahrefs.com/analytics.js"
      data-key={analyticsKey}
      async
    />
  );
}
