import type { Metadata } from "next";
import { Mail, MessageSquare, Clock, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have questions, tool requests, or feedback? Get in touch with the YT Crew team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Page Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Contact the YT Crew Team
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Have a question, feedback, bug report, or a new tool idea you&apos;d love to see built? Send us a message below.
            </p>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Form (2 spans) */}
            <div className="lg:col-span-2 space-y-4">
              <ContactForm />
            </div>

            {/* Right Column: Direct Info & FAQ Cards (1 span) */}
            <div className="space-y-6">
              {/* Direct Support Email Card */}
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Direct Support</h3>
                    <p className="text-xs text-muted-foreground">General inquiries</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Prefer email? Reach us directly at:
                </p>
                <div className="p-3 rounded-xl bg-background border border-border text-center font-mono text-xs font-semibold text-primary select-all">
                  support@ytcrew.com
                </div>
              </div>

              {/* Response Time Card */}
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Response Time</h3>
                    <p className="text-xs text-muted-foreground">We value your time</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We review every submission carefully and typically respond within <strong>24–48 business hours</strong>.
                </p>
              </div>

              {/* Feature Suggestions Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Feature Requests</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Most tools on YT Crew are built directly from creator feedback! If there&apos;s a specific YouTube utility you need, tell us in detail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
