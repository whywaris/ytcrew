"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    initialError === "unauthorized" ? "You do not have admin access." : null
  );

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData.user) {
        setErrorMessage(authError?.message || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      // 2. Check if user id exists in admin_profiles table
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !adminProfile) {
        // User authenticated but not authorized as admin
        await supabase.auth.signOut();
        setErrorMessage("You do not have admin access.");
        setLoading(false);
        return;
      }

      // 3. User is verified admin -> redirect to /admin
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Admin Login] Unexpected error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#252538] bg-[#12121c]/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden relative">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

      <CardHeader className="pb-4 pt-6">
        <CardTitle className="text-xl font-bold text-white">Admin Sign In</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Enter your authorized administrator credentials below
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="text-xs font-semibold text-slate-200 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4 text-indigo-400" />
              </div>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@ytcrew.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold text-slate-200 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4 text-violet-400" />
              </div>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#0e0e16] border-[#2b2b3d] text-white placeholder:text-[#64748b] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full gap-2 mt-2 bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold shadow-xl shadow-indigo-500/25 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminLoginView() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background subtle glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-1 border border-indigo-400/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>YT Crew</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Admin
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to access the creator management console
          </p>
        </div>

        {/* Suspense boundary for useSearchParams */}
        <React.Suspense
          fallback={
            <Card className="border-[#252538] bg-[#12121c] p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </Card>
          }
        >
          <LoginForm />
        </React.Suspense>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to YT Crew Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
