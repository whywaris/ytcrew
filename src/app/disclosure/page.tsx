import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Clock, Mail, Info } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "Learn about YT Crew's affiliate partnerships, monetization policies, and our commitment to transparency in compliance with FTC guidelines.",
};

export default function DisclosurePage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Hero */}
          <div className="border-b border-border pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Scale className="h-3.5 w-3.5" />
              <span>Transparency &amp; Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Affiliate &amp; Advertising Disclosure
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Last Updated: August 19, 2026</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/90 text-sm sm:text-base leading-relaxed">
            {/* Overview Callout Box */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Info className="h-4 w-4 text-primary" />
                <span>FTC Compliance Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed m-0">
                In compliance with the Federal Trade Commission (FTC) guidelines concerning the use of endorsements and testimonials in advertising, this disclosure details how YT Crew earns revenue through affiliate links, sponsored listings, and third-party partnerships.
              </p>
            </div>

            {/* Paragraph 1: Affiliate Links & Commissions */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                1. Affiliate Links &amp; Referral Commissions
              </h2>
              <p>
                Some of the links on YT Crew (including but not limited to our{" "}
                <Link
                  href="/youtube-automation-tools"
                  className="text-primary hover:underline font-medium"
                >
                  YouTube Automation Tools directory
                </Link>{" "}
                and educational blog guides) are affiliate links. This means that if you click on an affiliate link and make a purchase or subscribe to a paid service, YT Crew may earn a small referral commission at <strong>no additional cost to you</strong>. In many instances, our partnership links also provide exclusive discounts or extended free trials for our community.
              </p>
            </section>

            {/* Paragraph 2: Editorial Independence & Integrity */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                2. Editorial Independence &amp; Tool Curation
              </h2>
              <p>
                Our recommendations, tool listings, and software reviews are based strictly on practical value, performance, and utility for YouTube content creators. We test and evaluate tools independently, and commercial relationships never dictate whether a product is featured or positively reviewed. We only recommend third-party automation tools and platforms that we believe provide genuine value to digital video creators.
              </p>
            </section>

            {/* Paragraph 3: Free Native Utilities Commitment */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                3. Our Free Native Tools Commitment
              </h2>
              <p>
                All 86+ native creator tools built directly into YT Crew (such as our Timestamp Generator, Thumbnail Resizers, Video Frame Inspector, and Comment utilities) are <strong>100% free forever</strong> and do not require account registration or payment. Affiliate partnerships help support the ongoing hosting, development, and server maintenance required to keep these utilities free and fast for everyone.
              </p>
            </section>

            {/* Paragraph 4: Questions & Contact */}
            <section className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                4. Questions About Our Partnerships
              </h2>
              <p>
                If you have any questions or feedback regarding our affiliate partnerships, advertising policies, or how specific tools are selected, please feel free to contact us:
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card p-4 rounded-xl border border-border w-fit">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email: affiliates@ytcrew.com</span>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
