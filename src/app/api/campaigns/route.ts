/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint manages job campaigns.
 * It features a Dev Fallback: if Supabase credentials are not configured,
 * it automatically saves and lists campaigns in-memory. This allows local testing
 * out-of-the-box without needing any database configuration.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// In-memory fallback database for local-only testing
export let memoryCampaigns: any[] = [];

const isPlaceholderDb = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, jobTitle, jd, skillsRequired, eligibility, recruiterEmail } = body;

    if (!companyName || !jobTitle || !jd || !skillsRequired || !eligibility || !recruiterEmail) {
      return NextResponse.json({ error: "Missing required campaign fields" }, { status: 400 });
    }

    if (isPlaceholderDb) {
      // In-Memory Dev Mode Fallback
      const mockCampaign = {
        id: `mock-campaign-${Date.now()}`,
        company_name: companyName,
        job_title: jobTitle,
        jd: jd,
        skills_required: skillsRequired,
        eligibility: eligibility,
        recruiter_email: recruiterEmail,
        created_at: new Date().toISOString(),
      };
      memoryCampaigns.push(mockCampaign);
      console.log("ℹ️ Campaign saved in-memory (Dev Mode Fallback):", mockCampaign);
      return NextResponse.json({ success: true, campaign: mockCampaign });
    }

    // Insert the new job campaign into Supabase 'campaigns' table
    const { data, error } = await db
      .from("campaigns")
      .insert([
        {
          company_name: companyName,
          job_title: jobTitle,
          jd: jd,
          skills_required: skillsRequired,
          eligibility: eligibility,
          recruiter_email: recruiterEmail,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, campaign: data });
  } catch (error: any) {
    console.error("API Campaign Create Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (id) {
      if (isPlaceholderDb) {
        const campaign = memoryCampaigns.find((c) => c.id === id);
        if (!campaign) {
          return NextResponse.json({ error: "Campaign not found in memory" }, { status: 404 });
        }
        return NextResponse.json({ success: true, campaign });
      }

      // Fetch a single campaign by ID
      const { data: campaign, error: campaignError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError) {
        throw new Error(campaignError.message);
      }

      return NextResponse.json({ success: true, campaign });
    }

    if (!email) {
      return NextResponse.json({ error: "Email or Campaign ID query param is required" }, { status: 400 });
    }

    if (isPlaceholderDb) {
      // Return filtered memory campaigns
      const filtered = memoryCampaigns.filter((c) => c.recruiter_email === email);
      return NextResponse.json({ success: true, campaigns: filtered });
    }

    // Fetch all campaigns created by this recruiter
    const { data: campaigns, error: campaignError } = await db
      .from("campaigns")
      .select("*")
      .eq("recruiter_email", email)
      .order("created_at", { ascending: false });

    if (campaignError) {
      throw new Error(campaignError.message);
    }

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("API Campaign Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}
