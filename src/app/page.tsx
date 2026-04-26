"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  FileUp,
  Gauge,
  Loader2,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type AppPhase = "UPLOAD" | "CHAT" | "RESULT";

type ParsedData = {
  resume_skills: string[];
  jd_skills: string[];
  initial_gaps: string[];
  overlap: string[];
};

type QuestionContext = {
  skill: string;
  question: string;
  expected_concepts: string[];
};

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type Bluff = {
  skill: string;
  reasoning: string;
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

const ASSESSMENT_LIMIT = 3;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getReadinessLabel(score: number) {
  if (score >= 85) {
    return "Deployment ready";
  }

  if (score >= 70) {
    return "Strong shortlist";
  }

  if (score >= 50) {
    return "Needs targeted upskilling";
  }

  return "Foundational work required";
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("UPLOAD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [skillScores, setSkillScores] = useState<Record<string, number>>({});
  const [bluffs, setBluffs] = useState<Bluff[]>([]);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionContext, setCurrentQuestionContext] = useState<QuestionContext | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatScrollRef.current) {
      return;
    }

    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, isProcessing]);

  const resetAssessment = () => {
    setPhase("UPLOAD");
    setIsProcessing(false);
    setError(null);
    setChatMessages([]);
    setCurrentInput("");
    setFile(null);
    setJd("");
    setParsedData(null);
    setSkillScores({});
    setBluffs([]);
    setCurrentSkillIndex(0);
    setCurrentQuestionContext(null);
    setLearningPlan(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startInterview = async (skill: string) => {
    setError(null);
    setChatMessages((previous) => [
      ...previous,
      { role: "assistant", content: `Generating a live validation prompt for ${skill}...` },
    ]);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_skill: skill, resume_context: "" }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as {
        question_text: string;
        expected_key_concepts: string[];
      };

      setCurrentQuestionContext({
        skill,
        question: data.question_text,
        expected_concepts: data.expected_key_concepts,
      });

      setChatMessages((previous) => [
        ...previous.slice(0, -1),
        { role: "assistant", content: data.question_text },
      ]);
    } catch (error) {
      setChatMessages((previous) => previous.slice(0, -1));
      setError(`Question generation failed: ${getErrorMessage(error)}`);
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file || !jd.trim()) {
      setError("Upload a resume and paste the target job description to begin.");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jd", jd);

      const response = await fetch("/api/parse", { method: "POST", body: formData });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as ParsedData;
      setParsedData(data);

      if (data.overlap.length === 0) {
        setError("No overlapping skills were detected between the resume and the role brief.");
        return;
      }

      await startInterview(data.overlap[0]);
      setPhase("CHAT");
    } catch (error) {
      setError(`Analysis failed: ${getErrorMessage(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeResults = async (finalScores: Record<string, number>) => {
    setChatMessages((previous) => [
      ...previous,
      { role: "assistant", content: "Building the final readiness report and learning track..." },
    ]);

    try {
      const response = await fetch("/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          final_skill_scores: finalScores,
          jd_skills: parsedData?.jd_skills,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as LearningPlan;
      setLearningPlan(data);
      setPhase("RESULT");
    } catch (error) {
      setError(`Result generation failed: ${getErrorMessage(error)}`);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentInput.trim() || !currentQuestionContext) {
      return;
    }

    setError(null);
    const answer = currentInput.trim();

    setChatMessages((previous) => [...previous, { role: "user", content: answer }]);
    setCurrentInput("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestionContext.question,
          user_answer: answer,
          expected_key_concepts: currentQuestionContext.expected_concepts,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as {
        score: number;
        bluff_detected: boolean;
        reasoning: string;
      };

      const updatedScores = { ...skillScores, [currentQuestionContext.skill]: data.score };
      setSkillScores(updatedScores);

      if (data.bluff_detected) {
        setBluffs((previous) => [
          ...previous,
          { skill: currentQuestionContext.skill, reasoning: data.reasoning },
        ]);
      }

      const nextIndex = currentSkillIndex + 1;
      if (
        parsedData &&
        nextIndex < parsedData.overlap.length &&
        nextIndex < ASSESSMENT_LIMIT
      ) {
        setCurrentSkillIndex(nextIndex);
        await startInterview(parsedData.overlap[nextIndex]);
      } else {
        await finalizeResults(updatedScores);
      }
    } catch (error) {
      setError(`Evaluation failed: ${getErrorMessage(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const overlapSkills = parsedData?.overlap.slice(0, ASSESSMENT_LIMIT) ?? [];
  const skillGapCount = parsedData?.initial_gaps.length ?? 0;
  const questionNumber = Math.min(currentSkillIndex + 1, ASSESSMENT_LIMIT);
  const progressValue =
    phase === "RESULT"
      ? 100
      : phase === "CHAT"
        ? (questionNumber / ASSESSMENT_LIMIT) * 100
        : 0;
  const radarData = Object.entries(skillScores).map(([skill, score]) => ({
    subject: skill,
    score: (score / 5) * 100,
    fullMark: 100,
  }));
  const readinessScore = learningPlan?.final_readiness_score ?? 0;
  const readinessLabel = getReadinessLabel(readinessScore);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8 bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col items-center justify-center text-center py-10">
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
            AI Skill Assessor
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            A cleaner screening flow for testing claimed skills, surfacing confidence,
            and turning results into a focused learning path.
          </p>
        </header>

        {error ? (
          <div className="rounded-[1.6rem] border border-rose-200/80 bg-rose-50/90 px-5 py-4 text-sm text-rose-700 shadow-[0_12px_24px_rgba(244,63,94,0.08)] backdrop-blur">
            {error}
          </div>
        ) : null}

        {phase === "UPLOAD" ? (
          <section className="mx-auto w-full max-w-4xl">
            <Card className="border-white/70 bg-white/82 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <CardHeader className="px-6 pt-6 md:px-7">
                <CardTitle className="font-heading text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  Launch an assessment
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  Start with the candidate&apos;s PDF resume and the target job description.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-6 md:px-7 md:pb-7">
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(event) => {
                    setError(null);
                    if (event.target.files?.[0]) {
                      setFile(event.target.files[0]);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group w-full rounded-[1.8rem] border border-dashed border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,0.88),rgba(255,255,255,0.95))] p-6 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-cyan-300"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
                      {file ? <FileText className="h-7 w-7" /> : <FileUp className="h-7 w-7" />}
                    </div>

                    <div className="flex-1">
                      <p className="text-lg font-semibold text-slate-950">
                        {file ? file.name : "Upload candidate resume"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {file
                          ? `${formatFileSize(file.size)} uploaded. Click to swap the file.`
                          : "PDF format only. We will parse the strongest claimed skills automatically."}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      {file ? "Replace file" : "Choose PDF"}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="jd" className="text-sm font-semibold text-slate-800">
                      Target role brief
                    </Label>
                    <Textarea
                      id="jd"
                      value={jd}
                      onChange={(event) => {
                        setError(null);
                        setJd(event.target.value);
                      }}
                      placeholder="Paste the job description, role expectations, and must-have technical skills..."
                      className="min-h-[240px] rounded-[1.5rem] border-white bg-slate-950/[0.03] px-4 py-4 text-sm leading-6 shadow-inner shadow-slate-950/5 placeholder:text-slate-400 focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0f172a)] text-white shadow-[0_18px_36px_rgba(15,118,110,0.25)] hover:opacity-95"
                    disabled={isProcessing || !file || !jd.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing candidate fit...
                      </>
                    ) : (
                      <>
                        Start assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {phase === "CHAT" ? (
          <section className="space-y-6">
            <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,118,110,0.92))] text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <CardContent className="flex flex-col gap-6 p-6 md:p-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <Badge className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100 hover:bg-white/10">
                    Interview in progress
                  </Badge>
                  <div>
                    <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em]">
                      Validate the strongest overlap with higher-signal prompts.
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                      We&apos;re testing whether the candidate can explain how the claimed skill is
                      used in practice, not just name the technology.
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-md rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-white/90">
                      Question {questionNumber} of {ASSESSMENT_LIMIT}
                    </span>
                    <span className="text-cyan-100">{Math.round(progressValue)}%</span>
                  </div>
                  <Progress value={progressValue} />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {overlapSkills.map((skill, index) => (
                      <div
                        key={skill}
                        className={`rounded-2xl border px-3 py-3 text-sm ${
                          currentQuestionContext?.skill === skill
                            ? "border-cyan-300 bg-cyan-300/15 text-white"
                            : index < currentSkillIndex
                              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                              : "border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-6">
                <Card className="border-white/70 bg-white/78 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                  <CardHeader className="px-5 pt-5">
                    <CardTitle className="font-heading text-xl font-semibold tracking-[-0.04em] text-slate-950">
                      Assessment map
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                      Shared skill territory detected across resume and role brief.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 px-5 pb-5">
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Claimed overlap
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {overlapSkills.map((skill) => (
                          <Badge
                            key={skill}
                            className={
                              currentQuestionContext?.skill === skill
                                ? "rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950"
                                : "rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 hover:bg-cyan-50"
                            }
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Target gaps
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {parsedData?.initial_gaps.length ? (
                          parsedData.initial_gaps.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="rounded-full border-slate-200 bg-white/80 px-3 py-1 text-slate-600"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No immediate gaps detected.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>


              </div>

              <Card className="flex h-fit flex-col border-white/70 bg-white/82 shadow-[0_28px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <CardHeader className="border-b border-slate-200/70 px-6 py-5">
                  <CardTitle className="flex items-center gap-3 font-heading text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Live technical interview
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-slate-600">
                    Keep the answer concrete. Mention architecture choices, implementation steps, and tradeoffs.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 bg-[linear-gradient(180deg,rgba(248,250,252,0.6),rgba(255,255,255,0.9))] px-6 py-6">
                  <div ref={chatScrollRef} className="max-h-[420px] space-y-4 overflow-y-auto">
                    {chatMessages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-[1.6rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                            message.role === "user"
                              ? "rounded-br-md bg-[linear-gradient(135deg,#0f766e,#155e75)] text-white shadow-[0_16px_36px_rgba(15,118,110,0.22)]"
                              : "rounded-bl-md border border-white/90 bg-white/95 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {isProcessing ? (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 rounded-[1.4rem] rounded-bl-md border border-white/90 bg-white/95 px-4 py-3 text-sm text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluating response...
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>

                <div className="border-t border-slate-200/70 bg-white/90 p-5">
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <Textarea
                      value={currentInput}
                      onChange={(event) => setCurrentInput(event.target.value)}
                      placeholder="Explain your approach with enough detail to show how you would actually implement it..."
                      className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-slate-950/[0.03] px-4 py-4 text-sm leading-6 shadow-inner shadow-slate-950/5 placeholder:text-slate-400 focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
                      disabled={isProcessing}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        Tip: strong answers usually include a real example, a tradeoff, and an edge case.
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        className="h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                        disabled={isProcessing || !currentInput.trim()}
                      >
                        Submit answer
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </section>
        ) : null}

        {phase === "RESULT" && learningPlan ? (
          <section className="space-y-6">
            <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.97),rgba(12,74,110,0.94),rgba(8,145,178,0.82))] text-white shadow-[0_32px_90px_rgba(15,23,42,0.18)]">
              <CardContent className="flex flex-col gap-8 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <Badge className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100 hover:bg-white/10">
                    Final readiness report
                  </Badge>
                  <div>
                    <h2 className="font-heading text-4xl font-semibold tracking-[-0.06em] md:text-5xl">
                      {readinessScore}% readiness
                    </h2>
                    <p className="mt-3 text-base leading-7 text-slate-200">
                      {readinessLabel}. The app has combined observed interview performance,
                      claimed overlap, and skill gap analysis into a streamlined decision view.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Validated skills", value: Object.keys(skillScores).length.toString() },
                      { label: "Potential bluffs", value: bluffs.length.toString() },
                      { label: "Learning modules", value: learningPlan.modules.length.toString() },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div
                    className="flex h-48 w-48 items-center justify-center rounded-full border border-white/15"
                    style={{
                      background: `conic-gradient(#67e8f9 ${readinessScore * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
                    }}
                  >
                    <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-slate-950/80 shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
                      <span className="text-4xl font-semibold text-white">{readinessScore}</span>
                      <span className="mt-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                        score
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-6">
                <Card className="border-white/70 bg-white/82 shadow-[0_28px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                  <CardHeader className="px-6 pt-6">
                    <CardTitle className="font-heading text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      Skill confidence map
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                      Assessed performance across the skills that were validated live.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[360px] px-4 pb-6 md:px-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(148,163,184,0.28)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#475569", fontSize: 12 }}
                        />
                        <PolarRadiusAxis angle={25} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          dataKey="score"
                          stroke="#0f766e"
                          fill="#14b8a6"
                          fillOpacity={0.35}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-1">
                  <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(236,253,245,0.88),rgba(255,255,255,0.96))] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                    <CardHeader className="px-5 pt-5">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl font-semibold tracking-[-0.03em] text-slate-950">
                        {bluffs.length ? (
                          <XCircle className="h-5 w-5 text-rose-600" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        )}
                        Profile integrity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      {bluffs.length ? (
                        <p className="text-sm leading-6 text-slate-700">
                          <span className="font-semibold text-slate-950">{bluffs[0].skill}</span>:{" "}
                          {bluffs[0].reasoning}
                        </p>
                      ) : (
                        <p className="text-sm leading-6 text-slate-700">
                          No major embellishment signal was detected during the live validation flow.
                        </p>
                      )}
                    </CardContent>
                  </Card>


                </div>
              </div>

              <Card className="border-white/70 bg-white/82 shadow-[0_28px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <CardHeader className="px-6 pt-6">
                  <CardTitle className="font-heading text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    Targeted learning plan
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-slate-600">
                    A sharper follow-up path based on the specific gaps this assessment exposed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6">
                  {learningPlan.modules.map((module, index) => (
                    <div
                      key={`${module.topic}-${index}`}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-3 inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                            Module 0{index + 1}
                          </div>
                          <h3 className="font-heading text-xl font-semibold tracking-[-0.03em] text-slate-950">
                            {module.topic}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600"
                        >
                          {module.time_estimate}
                        </Badge>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">{module.reason}</p>

                      {module.resources?.length ? (
                        <div className="mt-5 space-y-3">
                          {module.resources.map((resource, resourceIndex) => (
                            <a
                              key={`${resource.title}-${resourceIndex}`}
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:border-cyan-300 hover:text-slate-950"
                            >
                              <span className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-cyan-700" />
                                {resource.title}
                              </span>
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-2xl border-slate-200 bg-white/85 text-slate-900 hover:bg-slate-50"
                    onClick={resetAssessment}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Start a new assessment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
