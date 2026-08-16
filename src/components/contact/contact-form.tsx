"use client";

import * as React from "react";
import { Send, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission / log payload to console as requested
    console.log("[Contact Form Submission]", {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    });

    // Simulate brief network latency for natural UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-card border border-emerald-500/30 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Message Sent Successfully!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for reaching out, <strong className="text-foreground">{name || "Creator"}</strong>. We have received your message and will review it promptly.
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Send Another Message</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            Your Name *
          </label>
          <Input
            id="contact-name"
            type="text"
            required
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            Email Address *
          </label>
          <Input
            id="contact-email"
            type="email"
            required
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact-subject"
          className="text-xs font-semibold text-foreground uppercase tracking-wider"
        >
          Subject *
        </label>
        <Input
          id="contact-subject"
          type="text"
          required
          placeholder="Tool suggestion, feedback, partnership inquiry..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="text-xs font-semibold text-foreground uppercase tracking-wider"
        >
          Your Message *
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          placeholder="Tell us what's on your mind or describe the tool feature you'd love to see on YT Crew..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 leading-relaxed"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Send Message</span>
          </>
        )}
      </Button>
    </form>
  );
}
