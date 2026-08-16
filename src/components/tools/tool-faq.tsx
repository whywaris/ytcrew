import { ToolFAQItem } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export interface ToolFAQProps {
  faqs: ToolFAQItem[];
  toolName: string;
}

export function ToolFAQ({ faqs, toolName }: ToolFAQProps) {
  if (!faqs || faqs.length === 0) return null;

  // JSON-LD structured data for Google FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="my-12">
      {/* Inject FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-1.5 text-primary text-sm font-medium mb-1">
          <HelpCircle className="h-4 w-4" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Questions About {toolName}
        </h2>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <Card key={index} className="bg-card/70 border-border">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-base font-medium text-foreground">
                {faq.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
