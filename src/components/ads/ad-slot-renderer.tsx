"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface AdSlotRendererProps {
  slotName: string;
  adCode: string | null;
  isActive: boolean;
}

export function AdSlotRenderer({ slotName, adCode, isActive }: AdSlotRendererProps) {
  const pathname = usePathname();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Exclude rendering on any /admin and /admin/* routes, and exclude homepage ("/")
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");
  const isHomepage = pathname === "/";

  React.useEffect(() => {
    if (!isActive || !adCode || isAdminRoute || isHomepage || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = adCode;

    // Standard innerHTML does NOT execute script tags.
    // Find all script tags, clone them into genuine executable DOM script elements, and replace them.
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [adCode, isActive, isAdminRoute, isHomepage]);

  if (isAdminRoute || isHomepage || !isActive || !adCode || !adCode.trim()) {
    return null;
  }

  return (
    <div
      data-ad-slot={slotName}
      className="ad-slot-container w-full flex justify-center my-4 overflow-hidden"
    >
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}
