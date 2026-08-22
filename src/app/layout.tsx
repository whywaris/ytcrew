import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { AhrefsAnalytics } from "@/components/analytics/ahrefs-analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "sans-serif",
  ],
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  preload: false,
});

export const metadata: Metadata = {
  title: "YT Crew – 100% Free YouTube Tools for Creators",
  description:
    "YT Crew brings free tools for YouTube creators in one place — from keyword research to thumbnail downloads. Simple, fast, and free to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AnnouncementBar />
          {children}
          <GoogleAnalytics />
          <AhrefsAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

