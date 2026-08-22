import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-2xl font-bold">
            404
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              The page or creator tool you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-accent transition-colors"
            >
              <Search className="w-4 h-4" />
              Browse Tools
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
