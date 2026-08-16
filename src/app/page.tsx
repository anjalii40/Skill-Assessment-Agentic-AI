/**
 * 💡 WHAT THIS FILE DOES:
 * This is the public landing page (localhost:3000/).
 * It is designed for non-technical users and explains:
 * 1. What the platform is (AI Skill Assessor).
 * 2. Key Features (In-memory parsing, Gemini Live WebSockets, Bluff detection, personalized roadmaps).
 * 3. Step-by-Step Instructions on how to use it for both Recruiters and Candidates.
 * 4. Dual Call-to-Actions (CTAs) directing users to the Recruiter Portal or Candidate Portal.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import {
  Sparkles,
  Users,
  Briefcase,
  Mic,
  ArrowRight,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  LineChart,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [jobCode, setJobCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleJoinCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanedCode = jobCode.trim();
    
    if (!cleanedCode) {
      setError("Please enter a valid Job Code.");
      return;
    }
    
    // If they pasted a full URL, extract the final UUID path segment
    if (cleanedCode.includes("/apply/")) {
      const parts = cleanedCode.split("/apply/");
      cleanedCode = parts[parts.length - 1];
    }
    
    // Clean up any trailing slashes or query parameters
    cleanedCode = cleanedCode.split("?")[0].replace(/\/$/, "");
    
    router.push(`/apply/${cleanedCode}`);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#EDEDED] flex flex-col antialiased font-sans">
      
      {/* 1. Header Navigation */}
      <header className="border-b border-white/10 bg-[#121212]/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-green-950/60 border border-green-800/40 rounded-xl">
            <Sparkles className="h-5 w-5 text-green-400" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-white">AI Skill Assessor</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">Features</a>
          <a href="#how-to-use" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">How to Use</a>
          <Button
            onClick={() => router.push("/recruiter")}
            variant="outline"
            className="border-white/10 bg-[#1A1A1A] hover:bg-[#242424] text-xs text-white rounded-xl px-4 h-9"
          >
            Recruiter Sign In
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col gap-16">
        
        <section className="text-center space-y-4">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.1]">
            Screen candidates on <em className="font-serif italic text-green-400 font-normal">actual skills</em>, not resume buzzwords.
          </h2>
          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
            Move past the bullet points. Talk through system designs, trade-offs, and practical challenges in a natural conversation that reveals how you actually think and build.
          </p>
        </section>

        {/* 3. Navigation Portals / Call to Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recruiter Card */}
          <Card className="border-white/10 bg-[#1A1A1A] rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-white/20 transition-colors shadow-xl">
            <div className="space-y-2">
              <div className="p-3 bg-green-950/40 border border-green-800/40 rounded-xl w-fit">
                <Briefcase className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Recruiter Portal</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Log in to set up hiring campaigns, specify skill requirements, paste job descriptions, and view candidates' detailed readiness scores and insights.
              </p>
            </div>
            <Button
              onClick={() => router.push("/recruiter")}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_12px_24px_rgba(46,125,50,0.12)]"
            >
              Access Recruiter Dashboard
              <ArrowRight className="h-4 w-4 text-white" />
            </Button>
          </Card>

          {/* Candidate Card */}
          <Card className="border-white/10 bg-[#1A1A1A] rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-white/20 transition-colors shadow-xl">
            <div className="space-y-2">
              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl w-fit">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Candidate Portal</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Received a Job Code? Enter it below to upload your resume, connect your microphone, and start your 10-minute live voice technical screen.
              </p>
            </div>
            
            <form onSubmit={handleJoinCampaign} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste Job Code (Campaign ID)..."
                  value={jobCode}
                  onChange={(e) => {
                    setError(null);
                    setJobCode(e.target.value);
                  }}
                  className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-amber-500 focus:ring-amber-500/20 text-xs h-11"
                />
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl px-4 h-11 transition-all"
                >
                  Start
                </Button>
              </div>
              {error && <span className="text-[10px] text-rose-400 block">{error}</span>}
            </form>
          </Card>
        </section>

        {/* 4. Core Features Section */}
        <section id="features" className="space-y-8 pt-8 border-t border-white/10">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400">Features</h3>
            <h4 className="font-heading text-2xl font-bold text-white">Powerful AI Tech Screening Capabilities</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="p-5 border border-white/5 bg-[#121212] rounded-2xl flex gap-4">
              <div className="p-2.5 bg-green-950/40 border border-green-800/40 rounded-xl h-fit">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-semibold text-white block">Lightweight JS PDF Parser</strong>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Uploads are parsed instantly in-memory, extracting skills and links without relying on heavy external python dependencies.
                </p>
              </div>
            </div>

            <div className="p-5 border border-white/5 bg-[#121212] rounded-2xl flex gap-4">
              <div className="p-2.5 bg-green-950/40 border border-green-800/40 rounded-xl h-fit">
                <Mic className="h-5 w-5 text-green-400" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-semibold text-white block">Gemini Live Voice (WebSockets)</strong>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Real-time conversational voice interview using raw PCM 16kHz/24kHz streaming with user interruption support.
                </p>
              </div>
            </div>

            <div className="p-5 border border-white/5 bg-[#121212] rounded-2xl flex gap-4">
              <div className="p-2.5 bg-green-950/40 border border-green-800/40 rounded-xl h-fit">
                <ShieldCheck className="h-5 w-5 text-green-400" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-semibold text-white block">Anti-Cheat Bluff Detection</strong>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Automatically flags candidates who give evasive, definition-heavy responses but fail to hit core expected concepts.
                </p>
              </div>
            </div>

            <div className="p-5 border border-white/5 bg-[#121212] rounded-2xl flex gap-4">
              <div className="p-2.5 bg-green-950/40 border border-green-800/40 rounded-xl h-fit">
                <BookOpen className="h-5 w-5 text-green-400" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-semibold text-white block">Personalized Upskilling Roadmap</strong>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Candidates instantly receive structured modules, target goals, and recommended learning resources on completion.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 5. How To Use Segment */}
        <section id="how-to-use" className="space-y-8 pt-8 border-t border-white/10">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400">Guide</h3>
            <h4 className="font-heading text-2xl font-bold text-white">How to Use the Platform</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recruiters Flow */}
            <div className="p-6 border border-white/5 bg-[#1A1A1A]/40 rounded-2xl space-y-4">
              <h5 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-400" />
                For Recruiters
              </h5>
              <ol className="space-y-3 text-xs text-[#9CA3AF] list-decimal pl-4">
                <li>
                  Click <strong className="text-[#EDEDED]">Recruiter Sign In</strong> to log in securely using your email address and an OTP passwordless code.
                </li>
                <li>
                  Click <strong className="text-[#EDEDED]">New</strong> to set up a Campaign. Enter the company details, job description, required skills, and eligibility.
                </li>
                <li>
                  Copy the generated <strong className="text-[#EDEDED]">Share Link</strong> and send it to your prospective candidates.
                </li>
                <li>
                  Monitor the dashboard to review candidate readiness scores, view extracted profile links (LeetCode, GitHub), and inspect AI insights.
                </li>
              </ol>
            </div>

            {/* Candidates Flow */}
            <div className="p-6 border border-white/5 bg-[#1A1A1A]/40 rounded-2xl space-y-4">
              <h5 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                For Candidates
              </h5>
              <ol className="space-y-3 text-xs text-[#9CA3AF] list-decimal pl-4">
                <li>
                  Enter the unique <strong className="text-[#EDEDED]">Job Code</strong> supplied by your recruiter, or open the share link they provided.
                </li>
                <li>
                  Provide your Name, Email, and upload your resume as a <strong className="text-[#EDEDED]">PDF</strong>.
                </li>
                <li>
                  Click <strong className="text-[#EDEDED]">Connect Microphone</strong> and speak directly to the AI interviewer to answer the technical questions.
                </li>
                <li>
                  Review your readiness score and personalized upskilling learning roadmaps immediately after you finish.
                </li>
              </ol>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#121212]/50 px-6 py-6 text-center text-[10px] text-[#9CA3AF] font-mono">
        © 2026 AI Skill Assessor. Designed with Linear Dark aesthetics.
      </footer>

    </div>
  );
}
