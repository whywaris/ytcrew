"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "./admin-shell";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Ensure dark class is active on html root when in admin
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  // Do not wrap login page with admin shell
  if (pathname === "/admin/login") {
    return (
      <div className="dark min-h-screen bg-[#0a0a0f] text-[#f5f5f7]" style={{ colorScheme: "dark" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0c0c10] text-[#f5f5f7]" style={{ colorScheme: "dark" }}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
