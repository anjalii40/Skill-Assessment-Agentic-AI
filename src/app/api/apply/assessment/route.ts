/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint saves candidate scores.
 * It features a Dev Fallback: if Supabase is not configured, it registers
 * assessments in-memory.
 */

import { NextResponse } from "next/server";
import { db } from "@/backend/db";

// In-memory fallback database for local-only testing
export let memoryAssessments: any[] = [];

const isPlaceholderDb = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, scores, bluffs, readinessScore, feedback } = body;

    if (!candidateId || !scores || !bluffs || readinessScore === undefined || !feedback) {
      return NextResponse.json({ error: "Missing required assessment results" }, { status: 400 });
    }

    if (isPlaceholderDb) {
      // In-Memory Dev Mode Fallback
      const mockAssessment = {
        id: `mock-assessment-${Date.now()}`,
        candidate_id: candidateId,
        scores: JSON.stringify(scores),
        bluffs: JSON.stringify(bluffs),
        readiness_score: readinessScore,
        feedback: JSON.stringify(feedback),
        created_at: new Date().toISOString(),
      };
      
      memoryAssessments = memoryAssessments.filter((a) => a.candidate_id !== candidateId);
      memoryAssessments.push(mockAssessment);
      console.log("ℹ️ Assessment saved in-memory (Dev Mode Fallback):", mockAssessment);
      return NextResponse.json({ success: true, assessment: mockAssessment });
    }

    // Insert or update final candidate assessment scores in Supabase
    const { data, error } = await db
      .from("assessments")
      .upsert({
        candidate_id: candidateId,
        scores: JSON.stringify(scores),
        bluffs: JSON.stringify(bluffs),
        readiness_score: readinessScore,
        feedback: JSON.stringify(feedback),
      }, { onConflict: "candidate_id" })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, assessment: data });
  } catch (error: any) {
    console.error("API Save Assessment Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save assessment results" }, { status: 500 });
  }
}
