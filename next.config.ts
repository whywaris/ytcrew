import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@supabase/ssr",
    "@supabase/supabase-js",
    "tailwind-merge",
    "clsx",
  ],
};

export default nextConfig;
