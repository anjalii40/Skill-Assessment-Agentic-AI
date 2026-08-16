/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint safely supplies the client application with the Gemini API key.
 * This is necessary so the candidate's browser can establish a direct WebSocket connection
 * to Gemini's Multimodal Live voice servers for real-time speech interaction.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey });
}
