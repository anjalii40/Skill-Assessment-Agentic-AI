/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint retrieves all candidates and their assessment results.
 * It features a Dev Fallback: if Supabase is not configured, it dynamically joins
 * and returns mock candidate records from active memory lists.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoryCandidates } from "../../apply/route";
import { memoryAssessments } from "../../apply/assessment/route";

const isPlaceholderDb = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId query parameter is required" }, { status: 400 });
    }

    if (isPlaceholderDb) {
      // In-Memory Dev Mode Fallback (Dynamic Mock JOIN)
      const filteredCandidates = memoryCandidates
        .filter((c) => c.campaign_id === campaignId)
        .map((c) => {
          const assessment = memoryAssessments.find((a) => a.candidate_id === c.id);
          return {
            ...c,
            assessments: assessment
              ? {
                  scores: assessment.scores,
                  bluffs: assessment.bluffs,
                  readiness_score: assessment.readiness_score,
                  feedback: assessment.feedback,
                  created_at: assessment.created_at,
                }
              : null,
          };
        });
      return NextResponse.json({ success: true, candidates: filteredCandidates });
    }

    // Query candidates and join their assessments
    const { data: candidates, error } = await db
      .from("candidates")
      .select(`
        *,
        assessments (
          scores,
          bluffs,
          readiness_score,
          feedback,
          created_at
        )
      `)
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, candidates });
  } catch (error: any) {
    console.error("API Fetch Campaign Candidates Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch candidate results" }, { status: 500 });
  }
}
