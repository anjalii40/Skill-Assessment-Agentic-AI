/**
 * 💡 WHAT THIS FILE DOES:
 * This is the user interface (UI) for the Login and Signup screen.
 * It provides a beautiful, modern login card styled consistently with the application's
 * global light gold-cyan ambient design system. It handles two steps:
 * 1. Asking the user for their email address and requesting an OTP code.
 * 2. Asking the user to input the 6-digit OTP code sent to their email to complete their sign-in.
 * 
 * NOTE: The page is wrapped in a React <Suspense> boundary because it reads query parameters
 * (e.g. tracking where the user wanted to go before being redirected) using Next.js client-side hooks.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Loader2, Mail, ShieldAlert, KeyRound, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  
  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Development mode helper to auto-fill OTP for easy testing
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Clear errors when state changes
  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [step, email, otp]);

  // Request OTP from server
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send code.");
      }

      setMessage(data.message);
      
      // If we are in Dev Mode, we get the OTP back to make dev testing painless
      if (data.devMode && data.otp) {
        setDevOtp(data.otp);
      }

      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code.");
      }

      // Successful verification - redirect to app
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-24">
      {/* Background container inheriting the global body styles */}
      <div className="w-full max-w-[440px] z-10">
        
        {/* Title Logo */}
        <div className="flex flex-col items-center justify-center mb-8 animate-fade-in">
          <div className="p-3 bg-gradient-to-tr from-[#22d3ee] to-[#fbbf24] rounded-2xl shadow-md shadow-cyan-200 mb-3 hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            AI Skill Assessor
          </h1>
          <p className="text-sm text-slate-600 mt-1">Screen candidate depth, not buzzwords</p>
        </div>

        {/* Card Component matching home screen aesthetics */}
        <Card className="border-white/70 bg-white/82 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl rounded-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="font-heading text-xl font-semibold tracking-[-0.03em] text-slate-950 text-center">
              {step === "EMAIL" ? "Welcome back" : "Enter Verification Code"}
            </CardTitle>
            <CardDescription className="text-center text-slate-600 text-sm">
              {step === "EMAIL"
                ? "Enter your email address to receive a single-use login code."
                : `We sent a code to ${email}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-xl text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && !error && (
              <div className="mb-4 p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs animate-fade-in">
                {message}
              </div>
            )}

            {step === "EMAIL" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 border-slate-200/80 bg-white/50 text-slate-900 focus:border-cyan-400 focus:ring-cyan-400/30 rounded-xl placeholder-slate-400 transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-600 hover:to-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send Login Code
                      <ArrowRight className="h-4 w-4 text-white" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      className="pl-10 h-11 tracking-[0.3em] font-mono text-center text-lg border-slate-200/80 bg-white/50 text-slate-900 focus:border-cyan-400 focus:ring-cyan-400/30 rounded-xl placeholder-slate-400 transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                {devOtp && (
                  <div className="p-3.5 bg-cyan-50/80 border border-cyan-100 rounded-xl text-xs text-cyan-800 leading-relaxed animate-pulse">
                    <span className="font-semibold block mb-0.5">🛠️ Developer Quick-Pass:</span>
                    Since Resend API key is not set, use this code:{" "}
                    <code className="bg-white/80 px-1.5 py-0.5 rounded text-cyan-950 border border-cyan-200 font-mono font-bold tracking-widest">{devOtp}</code>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-600 hover:to-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight className="h-4 w-4 text-white" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  disabled={loading}
                  className="w-full text-center text-xs text-slate-500 hover:text-cyan-600 transition-colors pt-2 block"
                >
                  Change email address
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
