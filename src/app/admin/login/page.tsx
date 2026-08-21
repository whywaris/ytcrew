import type { Metadata } from "next";
import { AdminLoginView } from "@/components/admin/admin-login-view";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return <AdminLoginView />;
}
