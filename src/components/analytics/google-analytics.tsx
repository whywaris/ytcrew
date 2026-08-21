"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Google Analytics 4 (GA4) Tracker Component
 *
 * Implements non-blocking, asynchronous telemetry using Next.js `next/script`
 * with `afterInteractive` loading strategy.
 *
 * Excludes internal admin routes (/admin) to avoid skewing creator analytics.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();

  // If no GA measurement ID is configured, do not render scripts
  if (!measurementId) {
    return null;
  }

  // Exclude internal admin dashboard from analytics tracking
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
