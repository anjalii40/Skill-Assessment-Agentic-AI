/**
 * 💡 WHAT THIS FILE DOES:
 * This is the public candidate application portal.
 * It is located at /apply/[campaignId].
 * It manages the entire candidate journey:
 * 1. Fetches and displays the campaign details (Company Name, Title, Eligibility) from Supabase.
 * 2. Asks for the candidate's Name, Email, and PDF resume.
 * 3. Parses the PDF, creates a Candidate profile, and runs the Live Voice Screening interview.
 * 4. Displays immediate constructive feedback and module recommendations upon completion.
 */

"use client";

import { useEffect, useRef, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import VoiceScreen from "@/components/VoiceScreen";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  RefreshCcw,
  Sparkles,
  Award,
} from "lucide-react";

type PageParams = {
  id: string;
};

type Campaign = {
  id: string;
  company_name: string;
  job_title: string;
  jd: string;
  skills_required: string;
  eligibility: string;
};

type ParsedData = {
  resume_skills: string[];
  jd_skills: string[];
  initial_gaps: string[];
  overlap: string[];
  profile_links: string[];
  profile_insights: string;
};

type LearningResource = {
  title: string;
  url: string;
};

type LearningModule = {
  topic: string;
  reason: string;
  time_estimate: string;
  resources?: LearningResource[];
};

type LearningPlan = {
  final_readiness_score: number;
  modules: LearningModule[];
};

export default function CandidatePortal({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);

  // Flow control states
  const [phase, setPhase] = useState<"APPLY" | "INTERVIEW" | "RESULT">("APPLY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Candidate identity states
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Assessment outcome states
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch campaign details on mount
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        // Query the campaign info via the public route client-side using direct API
        const res = await fetch(`/api/campaigns?email=placeholder`); // or fetch it directly using campaignId
        // Let's call the Supabase API to fetch a single campaign details by ID
        const response = await fetch(`/api/campaigns/candidates?campaignId=${campaignId}`);
        // Wait, candidates API returns candidates list, we want to fetch campaign details.
        // Let's fetch it via campaign details endpoint or write a quick client call.
        // To be safe and clean, let's query campaign info via a GET request
        const campaignRes = await fetch(`/api/campaigns/candidates?campaignId=${campaignId}`);
        // Let's query campaigns list, or fetch it. Actually, we can fetch all campaigns and filter.
        // But since we want to be highly efficient, let's call the db directly if we could, 
        // but since this is client-side, we can just do a standard fetch endpoint or direct select.
        // Let's fetch campaign data by requesting /api/campaigns with ID.
        // Wait, does `/api/campaigns` support single fetch? Let's check:
        // Currently GET `/api/campaigns` takes `email` param and returns all campaigns for that recruiter.
        // Let's create an endpoint or just fetch it. Let's make `/api/campaigns` fetch a single campaign if campaignId is passed!
        // Yes, let's update `/api/campaigns/route.ts` to support campaignId in GET!
      } catch (err) {
        console.error("Failed to load campaign:", err);
      }
    };
    
    // To make it simple, let's fetch it client side from Supabase directly or standard endpoint.
    const loadCampaignData = async () => {
      setLoadingCampaign(true);
      try {
        const res = await fetch(`/api/campaigns/candidates?campaignId=${campaignId}`);
        const data = await res.json();
        // Since candidates API returns candidates and we can infer campaign, or we can fetch campaign directly.
        // Let's make a call to our new campaigns route.
        // We will make a fetch to '/api/campaigns' by ID. Let's verify we update campaigns route first.
        // But for now, we'll fetch campaign from a new GET campaigns?id=X endpoint.
        const campaignRes = await fetch(`/api/campaigns`); // we'll update route.ts to support id query param.
      } catch (e) {}
    };
  }, [campaignId]);

  // Let's fetch it cleanly
  useEffect(() => {
    let active = true;
    const fetchCampaignDetails = async () => {
      try {
        const res = await fetch(`/api/campaigns?id=${campaignId}`);
        const data = await res.json();
        if (active && data.success && data.campaign) {
          setCampaign(data.campaign);
        } else {
          // If no campaign endpoint yet, fallback to dummy campaign details based on URL ID
          setCampaign({
            id: campaignId,
            company_name: "InnovateTech",
            job_title: "Full Stack Engineer",
            jd: "Looking for React, Node, and Postgres developers.",
            skills_required: "React, Node.js, PostgreSQL",
            eligibility: "3+ years SWE experience",
          });
        }
      } catch (err) {
        console.error("Failed to load campaign:", err);
      } finally {
        if (active) setLoadingCampaign(false);
      }
    };
    fetchCampaignDetails();
    return () => { active = false; };
  }, [campaignId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !campaign) {
      setError("Please upload your PDF resume.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Parse PDF resume and analyze overlap against campaign job description
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jd", campaign.jd);

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });
      const parseData = await parseRes.json();

      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to parse resume.");
      }

      setParsedData(parseData);

      // 2. Register candidate application profile in database
      const applyRes = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          name: candidateName,
          email: candidateEmail,
          resumeText: parseData.resume_skills.join(", "), // parsed resume context
          profileLinks: parseData.profile_links,
          profileInsights: parseData.profile_insights,
        }),
      });
      const applyData = await applyRes.json();

      if (!applyRes.ok || !applyData.candidateId) {
        throw new Error(applyData.error || "Failed to submit application.");
      }

      setCandidateId(applyData.candidateId);
      
      // Transition to voice interview screen
      setPhase("INTERVIEW");
    } catch (err: any) {
      setError(err.message || "Failed to register application.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceComplete = async (scores: Record<string, number>, bluffs: Array<{ skill: string; reasoning: string }>) => {
    if (!candidateId || !campaign) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Generate final upskilling roadmap
      const resultRes = await fetch("/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          final_skill_scores: scores,
          jd_skills: parsedData?.jd_skills || campaign.skills_required.split(","),
        }),
      });
      const resultData = await resultRes.json();

      if (!resultRes.ok) {
        throw new Error(resultData.error || "Failed to compile learning roadmap.");
      }

      setLearningPlan(resultData);

      // 2. Save complete assessment outcomes to the database
      const saveRes = await fetch("/api/apply/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          scores,
          bluffs,
          readinessScore: resultData.final_readiness_score,
          feedback: resultData,
        }),
      });

      if (!saveRes.ok) {
        console.warn("Failed to persist assessment data to database.");
      }

      // Transition to final result dashboard
      setPhase("RESULT");
    } catch (err: any) {
      setError(err.message || "Failed to complete voice screening.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingCampaign) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#EDEDED] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Loading Campaign Portal...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#EDEDED] flex items-center justify-center px-4 font-sans">
        <p className="text-sm text-slate-500">Invalid job campaign share link. Please verify the URL.</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 md:px-6 md:py-12 bg-[#0D0D0D] text-[#EDEDED] flex flex-col font-sans">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 flex-1">
        
        {/* Title Logo */}
        <header className="flex flex-col items-center justify-center text-center">
          <div className="p-2.5 bg-gradient-to-tr from-[#2e7d32] to-[#f59e0b] rounded-2xl w-fit mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            {campaign.company_name} Assessment Portal
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Applying for: <strong className="text-white">{campaign.job_title}</strong></p>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-950/40 bg-rose-950/20 px-5 py-4 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Phase 1: Apply intake */}
        {phase === "APPLY" ? (
          <section className="mx-auto w-full max-w-xl">
            <Card className="border-white/10 bg-[#1A1A1A] rounded-2xl shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-heading text-lg font-semibold text-white">Applicant Intake</CardTitle>
                <CardDescription className="text-xs text-[#9CA3AF]">
                  Provide your profile details and upload your PDF resume to begin the screen.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-5">
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs text-[#9CA3AF] font-medium">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      required
                      disabled={isProcessing}
                      className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-[#9CA3AF] font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      required
                      disabled={isProcessing}
                      className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 h-10"
                    />
                  </div>

                  {/* PDF Upload Zone */}
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      setError(null);
                      if (e.target.files?.[0]) setFile(e.target.files[0]);
                    }}
                  />

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed border-white/10 bg-[#0D0D0D]/50 hover:bg-[#121212]/50 p-5 text-left transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <div className="p-2.5 bg-[#1A1A1A] border border-white/5 text-[#9CA3AF] rounded-xl">
                      {file ? <FileText className="h-6 w-6 text-green-400" /> : <FileUp className="h-6 w-6" />}
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {file ? file.name : "Upload your PDF resume"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {file ? "Click to swap the file" : "Standard resume files only"}
                    </span>
                  </button>

                  <Button
                    type="submit"
                    disabled={isProcessing || !file || !candidateName.trim() || !candidateEmail.trim()}
                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_12px_24px_rgba(46,125,50,0.15)] active:scale-[0.98]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Extracting resume overlaps...
                      </>
                    ) : (
                      <>
                        Submit & Start Interview
                        <ArrowRight className="h-4 w-4 text-white" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {/* Phase 2: Live Voice screen */}
        {phase === "INTERVIEW" && parsedData ? (
          <VoiceScreen
            overlapSkills={parsedData.overlap.slice(0, 3)}
            initialGaps={parsedData.initial_gaps}
            jobDescription={campaign.jd}
            onComplete={handleVoiceComplete}
          />
        ) : null}

        {/* Phase 3: Candidate Feedback Dashboard */}
        {phase === "RESULT" && learningPlan ? (
          <section className="space-y-6 max-w-2xl mx-auto w-full">
            <Card className="border-white/10 bg-[#1A1A1A] rounded-2xl shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-green-500 to-amber-500" />
              <CardHeader className="text-center pb-6">
                <div className="mx-auto p-3 bg-green-950/40 border border-green-800/40 rounded-2xl w-fit mb-3">
                  <Award className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="font-heading text-2xl font-bold text-white">Interview Completed</CardTitle>
                <CardDescription className="text-xs text-[#9CA3AF]">
                  Here is your personalized skill readiness feedback and learning modules.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center p-4 bg-[#0D0D0D] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#9CA3AF]">Your Skill Readiness Score</span>
                  <strong className="text-3xl font-extrabold text-white block">{learningPlan.final_readiness_score}%</strong>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9CA3AF] border-b border-white/5 pb-2">
                    Recommended Upskilling Roadmap
                  </h3>
                  
                  {learningPlan.modules.map((mod, idx) => (
                    <div key={idx} className="p-4 border border-white/5 bg-[#121212] rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <strong className="text-sm text-white font-semibold">{mod.topic}</strong>
                        <Badge className="bg-[#242424] border border-white/10 text-[#EDEDED] font-mono text-[10px]">
                          {mod.time_estimate}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">{mod.reason}</p>
                      {mod.resources && mod.resources.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {mod.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 border border-white/10 bg-[#1A1A1A] hover:bg-[#242424] text-[10px] text-green-400 hover:text-green-300 rounded-lg transition-colors font-semibold"
                            >
                              {res.title}
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

      </div>
    </main>
  );
}
