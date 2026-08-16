/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint manages candidate submissions.
 * It features a Dev Fallback: if Supabase is not configured, it registers
 * applicants in-memory for zero-config local testing.
 */

import { NextResponse } from "next/server";
import { db } from "@/backend/db";

// In-memory fallback database for local-only testing
export let memoryCandidates: any[] = [];

const isPlaceholderDb = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, name, email, resumeText, profileLinks, profileInsights } = body;

    if (!campaignId || !name || !email || !resumeText || !profileLinks || !profileInsights) {
      return NextResponse.json({ error: "Missing required candidate details" }, { status: 400 });
    }

    if (isPlaceholderDb) {
      // In-Memory Dev Mode Fallback
      const mockCandidate = {
        id: `mock-candidate-${Date.now()}`,
        campaign_id: campaignId,
        name,
        email,
        resume_text: resumeText,
        profile_links: JSON.stringify(profileLinks),
        profile_insights: profileInsights,
        created_at: new Date().toISOString(),
      };
      memoryCandidates.push(mockCandidate);
      console.log("ℹ️ Candidate saved in-memory (Dev Mode Fallback):", mockCandidate);
      return NextResponse.json({ success: true, candidateId: mockCandidate.id });
    }

    // Insert candidate information into Supabase 'candidates' table
    const { data, error } = await db
      .from("candidates")
      .insert([
        {
          campaign_id: campaignId,
          name,
          email,
          resume_text: resumeText,
          profile_links: JSON.stringify(profileLinks),
          profile_insights: profileInsights,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, candidateId: data.id });
  } catch (error: any) {
    console.error("API Apply Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit candidate application" }, { status: 500 });
  }
}
