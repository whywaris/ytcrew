import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Clock, Lock, ExternalLink, Mail } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the YT Crew Privacy Policy to understand how we collect, process, and protect your information when using our free YouTube creator tools.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Hero */}
          <div className="border-b border-border pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Privacy Policy
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Last Updated: August 15, 2026</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/90 text-sm sm:text-base leading-relaxed">
            {/* Overview Callout */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span>Summary of Core Privacy Principles</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed m-0">
                YT Crew provides free web utilities for creators. <strong>We do not require user accounts or logins</strong> to use our core tools. We do not sell your personal data, and we do not store YouTube video assets or personal credentials submitted through our tools beyond the active browser session.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                1. Information We Collect
              </h2>
              <p>
                When you visit or interact with YT Crew (accessible via{" "}
                <Link href="/" className="text-primary hover:underline font-medium">
                  ytcrew.com
                </Link>
                ), we may collect the following types of information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Voluntary Input Data:</strong> Information you enter into our tools, such as public YouTube video URLs, video timestamps, channel titles, or search keywords. This data is processed in real time to generate your requested output and is not permanently tied to your identity.
                </li>
                <li>
                  <strong className="text-foreground">Log & Device Data:</strong> Standard server logs, including your browser type, device operating system, language preferences, referring URLs, access timestamps, and anonymized IP addresses for security and performance monitoring.
                </li>
                <li>
                  <strong className="text-foreground">Analytics Metrics:</strong> Aggregated, non-personally identifiable usage statistics (e.g., page views, popular tools, time spent) to help us improve website functionality.
                </li>
                <li>
                  <strong className="text-foreground">Communications:</strong> Any message, feedback, or support inquiry you send to us via our contact form or support email.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                2. How We Use Your Information
              </h2>
              <p>We use the data collected strictly for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>To provide, operate, maintain, and optimize our 86+ free online tools.</li>
                <li>To respond to user inquiries, bug reports, and customer support requests.</li>
                <li>To detect, prevent, and address technical faults, security vulnerabilities, or abusive automated scraping.</li>
                <li>To understand overall usage trends to prioritize future tool development.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                3. YouTube API Services & Third-Party Data
              </h2>
              <p>
                Certain YT Crew tools connect to YouTube API Services to fetch public channel and video metadata. By using these tools, you agree to be bound by the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  YouTube Terms of Service <ExternalLink className="h-3 w-3" />
                </a>{" "}
                and the{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  Google Privacy Policy <ExternalLink className="h-3 w-3" />
                </a>
                .
              </p>
              <p className="text-muted-foreground">
                YT Crew does not access, collect, or store private YouTube account data, private video drafts, or login credentials. All YouTube data fetched is publicly available and processed client-side or ephemerally server-side to fulfill your specific tool query.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                4. Cookies and Web Technologies
              </h2>
              <p>
                YT Crew uses cookies and local browser storage to provide core user preferences (such as light/dark mode settings) and to ensure smooth performance.
              </p>
              <p className="text-muted-foreground">
                We may also partner with third-party advertising networks (such as Google AdSense) that use cookies, web beacons, or tracking technologies to serve relevant advertisements based on your visits to this and other websites. You may choose to disable cookies through your individual browser options.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                5. Third-Party Services
              </h2>
              <p>
                We may employ third-party service providers to facilitate our website, such as cloud hosting providers (e.g., Supabase, Vercel), analytics partners, and advertising networks. These third parties have access to minimal data solely to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                6. Data Retention & Security
              </h2>
              <p>
                We retain personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. We employ industry-standard administrative, technical, and physical safeguards—including SSL/TLS encryption—to protect your information against unauthorized access, alteration, or destruction.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                7. Your Rights & Choices (GDPR / CCPA)
              </h2>
              <p>
                Depending on your location, you may have statutory rights regarding your personal information, including the right to request access to, correction of, or deletion of any personal data we hold about you. Because most tools do not require accounts or store personal identities, we do not maintain profiles linked to individual users.
              </p>
              <p className="text-muted-foreground">
                To exercise any applicable data privacy rights or ask questions, please reach out via our contact channels below.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time to reflect modifications in our tools, technology, or legal requirements. We encourage you to review this page periodically for any changes. Any updates become effective immediately upon posting to this page.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                9. Contact Information
              </h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card p-4 rounded-xl border border-border w-fit">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email: support@ytcrew.com</span>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
