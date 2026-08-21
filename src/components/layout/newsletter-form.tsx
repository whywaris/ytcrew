"use client";

import * as React from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues?.[0]?.message ||
        validation.error.message ||
        "Please enter a valid email.";
      setErrorMessage(errorMsg);
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: validation.data }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="font-medium">Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setErrorMessage(null);
          }}
          disabled={status === "loading"}
          placeholder="Enter your email"
          aria-label="Email address"
          required
          className="w-full px-3.5 py-2 text-xs rounded-xl bg-secondary/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </button>
      </div>

      {status === "error" && errorMessage && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}
