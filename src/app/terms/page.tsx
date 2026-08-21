import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Clock, AlertTriangle, ExternalLink, Mail, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the YT Crew Terms of Service regarding acceptable use, intellectual property, service disclaimers, and user obligations when using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Hero */}
          <div className="border-b border-border pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <FileText className="h-3.5 w-3.5" />
              <span>Terms & Conditions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Terms of Service
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Last Updated: August 15, 2026</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/90 text-sm sm:text-base leading-relaxed">
            {/* Quick Notice */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Welcome to YT Crew</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed m-0">
                Please read these Terms of Service carefully before accessing or using our free tools and website. By using any part of YT Crew, you agree to be bound by these terms.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, or utilizing any website, application, or utility hosted under the YT Crew domain (the &ldquo;Service&rdquo;), you agree to comply with and be bound by these Terms of Service (&ldquo;Terms&rdquo;) as well as our{" "}
                <Link href="/policy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
                . If you do not agree to all terms and conditions, you must discontinue use of the Service immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                2. Description of Service
              </h2>
              <p>
                YT Crew provides an online directory of 86+ free browser-based creator tools, generators, calculators, analytics viewers, and educational blog guides designed to support digital video content creators. The Service is provided free of charge for personal and commercial channel optimization.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to add, modify, pause, or discontinue any tool or feature at any time without prior notice.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                3. Acceptable Use Policy
              </h2>
              <p>When using our Service, you agree that you will not:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Use automated scripts, bots, crawlers, or high-volume scrapers to overload our servers or extract tool code.</li>
                <li>Attempt to reverse-engineer, decompile, copy, or redistribute the underlying algorithms or software powering YT Crew tools.</li>
                <li>Resell, white-label, or package access to YT Crew tools as a paid commercial service without explicit written permission.</li>
                <li>Interfere with or disrupt the integrity, security, or performance of the Service.</li>
                <li>Use our tools to generate defamatory, obscene, illegal, or abusive content in violation of applicable laws.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                4. Intellectual Property
              </h2>
              <p>
                All content, visual interfaces, graphics, design, compilation, information, data, computer code, and software on YT Crew are the property of YT Crew or its licensors and are protected by international intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You retain all ownership rights and intellectual property in the original video files, graphics, and channel assets you submit or format through our tools.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                5. Third-Party Services & Links
              </h2>
              <p>
                Our Service may integrate with or link to third-party websites or services, including the YouTube Data API, Google services, or sponsor resources. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party services.
              </p>
              <p className="text-muted-foreground">
                By using tools that interact with YouTube, you also agree to comply with the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  YouTube Terms of Service <ExternalLink className="h-3 w-3" />
                </a>
                .
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                6. Disclaimer of Warranties
              </h2>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>&ldquo;AS IS&rdquo; &amp; &ldquo;AS AVAILABLE&rdquo; Provision</span>
                </div>
                <p className="m-0 leading-relaxed">
                  The Service and all tools are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, uptime, accuracy, or non-infringement.
                </p>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                We make no warranty that our tools will meet your specific requirements, that results generated will be error-free, or that defects will be corrected immediately.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                7. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall YT Crew, its operators, affiliates, agents, directors, employees, or licensors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, data, or other intangible losses, resulting from your use of or inability to use the Service.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                8. Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless YT Crew and its operators from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your violation of these Terms or your misuse of the tools.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                9. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                10. Changes to Terms
              </h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Material updates will be indicated with an updated revision date at the top of this page. Your continued use of the Service after any revisions constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                11. Contact Information
              </h2>
              <p>
                If you have any questions regarding these Terms of Service, please contact us:
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
