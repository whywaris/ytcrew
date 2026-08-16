import type { Metadata } from "next";
import { AdminLoginView } from "@/components/admin/admin-login-view";

export const metadata: Metadata = {
  title: "Admin Login | YT Crew Admin",
};

export default function AdminLoginPage() {
  return <AdminLoginView />;
}
