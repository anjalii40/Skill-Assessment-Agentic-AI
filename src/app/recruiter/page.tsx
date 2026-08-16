/**
 * 💡 WHAT THIS FILE DOES:
 * This is the Recruiter Dashboard UI.
 * It follows the "Linear-style" Dark Minimalist SaaS design system.
 * It lets recruiters:
 * 1. View all created campaigns and copy their share links (/apply/[campaignId]).
 * 2. Create new campaigns (specifying Company, Title, JD, Skills, Eligibility).
 * 3. Inspect candidate submissions, view extracted links (LeetCode, GitHub),
 *    AI insights, and final readiness / bluff evaluations.
 */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Link2,
  Users,
  Briefcase,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

type Campaign = {
  id: string;
  company_name: string;
  job_title: string;
  jd: string;
  skills_required: string;
  eligibility: string;
  created_at: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  resume_text: string;
  profile_links: string; // JSON array
  profile_insights: string;
  created_at: string;
  assessments?: {
    scores: string; // JSON Map
    bluffs: string; // JSON array
    readiness_score: number;
    feedback: string; // JSON learning plan
  };
};

export default function RecruiterDashboard() {
  const [recruiterEmail, setRecruiterEmail] = useState("recruiter@company.com");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // Loading & State flags
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jd, setJd] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [eligibility, setEligibility] = useState("");

  // Retrieve recruiter session
  useEffect(() => {
    const parseSession = () => {
      const match = document.cookie.match(/(^|;)\s*session_token\s*=\s*([^;]+)/);
      if (match) {
        try {
          const decoded = JSON.parse(atob(decodeURIComponent(match[2])));
          if (decoded && decoded.email) {
            setRecruiterEmail(decoded.email);
          }
        } catch (e) {
          console.error("Failed to parse recruiter session:", e);
        }
      }
    };
    parseSession();
  }, []);

  // Fetch campaigns
  useEffect(() => {
    if (!recruiterEmail) return;
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const res = await fetch(`/api/campaigns?email=${encodeURIComponent(recruiterEmail)}`);
        const data = await res.json();
        if (res.ok && data.campaigns) {
          setCampaigns(data.campaigns);
          if (data.campaigns.length > 0 && !selectedCampaign) {
            setSelectedCampaign(data.campaigns[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, [recruiterEmail]);

  // Fetch candidates when campaign changes
  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      try {
        const res = await fetch(`/api/campaigns/candidates?campaignId=${selectedCampaign.id}`);
        const data = await res.json();
        if (res.ok && data.candidates) {
          setCandidates(data.candidates);
        }
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
      } finally {
        setLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, [selectedCampaign]);

  // Handle Campaign Submission
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCampaign(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          jobTitle,
          jd,
          skillsRequired,
          eligibility,
          recruiterEmail,
        }),
      });
      const data = await res.json();
      if (res.ok && data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
        setSelectedCampaign(data.campaign);
        setIsCreating(false);
        // Reset form
        setCompanyName("");
        setJobTitle("");
        setJd("");
        setSkillsRequired("");
        setEligibility("");
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
    } finally {
      setCreatingCampaign(false);
    }
  };

  const copyLink = (campaignId: string) => {
    const link = `${window.location.origin}/apply/${campaignId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(campaignId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#EDEDED] flex flex-col antialiased font-sans">
      
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#1A1A1A] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-green-950/60 border border-green-800/40 rounded-xl">
            <Sparkles className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <span className="font-heading text-lg font-semibold tracking-tight text-white">AI Skill Assessor</span>
            <span className="text-[10px] uppercase tracking-widest text-[#9CA3AF] ml-2 font-mono">Recruiter Portal</span>
          </div>
        </div>
        <div className="text-xs text-[#9CA3AF] flex items-center gap-2">
          <span>Logged in as: <strong className="text-[#EDEDED]">{recruiterEmail}</strong></span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden">
        
        {/* Sidebar - Campaigns list */}
        <aside className="border-r border-white/10 bg-[#121212] p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Campaigns</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="h-8 border-white/10 bg-[#1A1A1A] hover:bg-[#242424] text-xs text-white rounded-lg px-2.5"
            >
              <Plus className="h-4 w-4 mr-1 text-green-400" />
              New
            </Button>
          </div>

          {loadingCampaigns ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No campaigns yet. Create one to get started.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCampaign(c);
                    setIsCreating(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex flex-col gap-1.5 ${
                    selectedCampaign?.id === c.id
                      ? "border-green-800/60 bg-green-950/20 text-white"
                      : "border-white/5 bg-[#1A1A1A] text-slate-300 hover:border-white/10"
                  }`}
                >
                  <strong className="block text-sm text-[#EDEDED] truncate">{c.job_title}</strong>
                  <span className="text-[#9CA3AF] truncate">{c.company_name}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Content Panel */}
        <section className="p-6 overflow-y-auto bg-[#0D0D0D]">
          
          {/* Create Campaign View */}
          {isCreating ? (
            <Card className="border-white/10 bg-[#1A1A1A] rounded-2xl w-full max-w-2xl mx-auto shadow-2xl">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-semibold text-white">Create Job Campaign</CardTitle>
                <CardDescription className="text-xs text-[#9CA3AF]">
                  Set up your hiring brief. The system will parse candidate resumes against this configuration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-xs text-[#9CA3AF] font-medium">Company Name</Label>
                      <Input
                        id="company"
                        placeholder="Google"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-xs text-[#9CA3AF] font-medium">Job Title</Label>
                      <Input
                        id="title"
                        placeholder="Senior Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                        className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-xs text-[#9CA3AF] font-medium">Required Skills (Comma separated)</Label>
                    <Input
                      id="skills"
                      placeholder="React, TypeScript, Node.js, PostgreSQL"
                      value={skillsRequired}
                      onChange={(e) => setSkillsRequired(e.target.value)}
                      required
                      className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eligibility" className="text-xs text-[#9CA3AF] font-medium">Eligibility Criteria</Label>
                    <Input
                      id="eligibility"
                      placeholder="3+ years of commercial SWE experience"
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      required
                      className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jd" className="text-xs text-[#9CA3AF] font-medium">Job Description (Role Context)</Label>
                    <Textarea
                      id="jd"
                      placeholder="Outline the day-to-day responsibilities, stack descriptions, and technical expectations..."
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                      required
                      className="bg-[#0D0D0D] border-white/10 text-white rounded-xl focus:border-green-500 focus:ring-green-500/20 min-h-[160px]"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      className="border-white/10 bg-[#1A1A1A] hover:bg-[#242424] text-white rounded-xl h-10 px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creatingCampaign}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl h-10 px-5 transition-all shadow-[0_12px_24px_rgba(46,125,50,0.15)] flex items-center gap-1.5"
                    >
                      {creatingCampaign ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Saving...
                        </>
                      ) : (
                        "Create Campaign"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : selectedCampaign ? (
            /* Selected Campaign Dashboard */
            <div className="space-y-6">
              
              {/* Campaign Header Card */}
              <div className="p-5 border border-white/10 bg-[#1A1A1A] rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Badge className="bg-green-950/40 border border-green-800/40 text-green-400 rounded-full px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-wider mb-2">
                    Active Campaign
                  </Badge>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-white">{selectedCampaign.job_title}</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{selectedCampaign.company_name} • {selectedCampaign.eligibility}</p>
                </div>
                <Button
                  onClick={() => copyLink(selectedCampaign.id)}
                  className="bg-[#242424] hover:bg-[#2e2e2e] border border-white/10 text-white h-10 px-4 rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-center transition-colors"
                >
                  <Link2 className="h-4 w-4 text-[#9CA3AF]" />
                  {copiedId === selectedCampaign.id ? "Link Copied!" : "Copy Share Link"}
                </Button>
              </div>

              {/* Candidate Submissions Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#9CA3AF]" />
                  <h3 className="font-heading text-lg font-semibold text-white">Applications ({candidates.length})</h3>
                </div>
              </div>

              {/* Candidates List */}
              {loadingCandidates ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-green-400" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/5 bg-[#121212]/50 rounded-2xl">
                  <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No candidates have applied to this campaign yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Copy and share the apply link above with candidates.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((cand) => {
                    const profileLinks: string[] = JSON.parse(cand.profile_links || "[]");
                    const assessment = cand.assessments;
                    const scores: Record<string, number> = JSON.parse(assessment?.scores || "{}");
                    const bluffs: Array<{ skill: string; reasoning: string }> = JSON.parse(assessment?.bluffs || "[]");
                    
                    return (
                      <Card key={cand.id} className="border-white/5 bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-md">
                        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            {/* Candidate Info */}
                            <div>
                              <strong className="text-base text-white font-semibold">{cand.name}</strong>
                              <span className="text-xs text-[#9CA3AF] ml-2 font-mono">({cand.email})</span>
                            </div>

                            {/* Extracted Profile Links */}
                            {profileLinks.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {profileLinks.map((url) => {
                                  let label = "Profile";
                                  if (url.includes("leetcode")) label = "LeetCode";
                                  else if (url.includes("github")) label = "GitHub";
                                  else if (url.includes("linkedin")) label = "LinkedIn";
                                  else if (url.includes("codechef")) label = "CodeChef";
                                  
                                  return (
                                    <a
                                      key={url}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-white/10 bg-[#242424] hover:bg-[#2e2e2e] text-[10px] text-slate-200 hover:text-white rounded-full font-mono transition-colors"
                                    >
                                      {label}
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  );
                                })}
                              </div>
                            )}

                            {/* AI Insights summary */}
                            <div className="p-3 bg-[#121212] border border-white/5 rounded-xl text-xs text-[#9CA3AF] leading-relaxed">
                              <span className="font-semibold text-white block mb-0.5 flex items-center gap-1.5">
                                <ClipboardCheck className="h-3.5 w-3.5 text-green-400" />
                                Profile AI Insights:
                              </span>
                              {cand.profile_insights}
                            </div>
                          </div>

                          {/* Evaluation Status Card */}
                          <div className="w-full md:w-56 shrink-0 p-4 border border-white/5 bg-[#121212] rounded-xl flex flex-col justify-between gap-3 text-center md:text-left">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-mono tracking-wider text-[#9CA3AF]">
                                Screen Status
                              </span>
                              {assessment ? (
                                <div className="space-y-1">
                                  <strong className="text-xl font-bold text-white block">
                                    {assessment.readiness_score}% Readiness
                                  </strong>
                                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                                    {bluffs.length > 0 && (
                                      <Badge className="bg-amber-950/40 border border-amber-800/40 text-amber-400 text-[10px] font-mono px-1.5 py-0">
                                        <ShieldAlert className="h-3 w-3 mr-1" />
                                        Bluff Flagged
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 font-medium block">
                                  Pending Voice Interview
                                </span>
                              )}
                            </div>
                            
                            {assessment && Object.keys(scores).length > 0 && (
                              <div className="border-t border-white/5 pt-2">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-[#9CA3AF] block mb-1">
                                  Skill Scores
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                                  {Object.entries(scores).map(([s, score]) => (
                                    <div key={s} className="flex justify-between border-b border-white/5 pb-0.5">
                                      <span className="text-slate-400 truncate pr-1">{s}</span>
                                      <strong className="text-white shrink-0">{score}/5</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-semibold text-white">Welcome, Recruiter</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Create a new campaign or select an active campaign from the sidebar to review candidates.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
