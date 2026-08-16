import type { Metadata } from "next";
import { AdminLayoutWrapper } from "@/components/layout/admin-layout-wrapper";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export const metadata: Metadata = {
  title: {
    template: "%s | YT Crew Admin",
    default: "Overview | YT Crew Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
