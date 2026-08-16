/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint receives the user's email address and creates a random 6-digit login code (OTP).
 * If a Resend API key is configured in the environment settings, it sends the login code to their email.
 * If no Resend API key is found, it prints the code directly in the server terminal so developers can
 * test the app without setting up email keys first.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { saveOtp } from "@/lib/otp-store";

// Instantiate the Resend client using our environment variable
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Generate a secure 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the OTP to our temporary in-memory store
    saveOtp(email, otp);

    if (resend) {
      // Send code via Resend API
      await resend.emails.send({
        from: "AI Skill Assessor <onboarding@resend.dev>",
        to: email.trim(),
        subject: "Your Skill Assessor Login Code",
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #ffffff; border-radius: 8px;">
            <h2 style="color: #58a6ff; margin-bottom: 16px;">AI Skill Assessor Login</h2>
            <p style="font-size: 16px; color: #c9d1d9;">Use the verification code below to sign in. This code is active for 5 minutes.</p>
            <div style="margin: 24px 0; padding: 16px; background-color: #161b22; border-radius: 6px; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #58a6ff;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #8b949e;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      return NextResponse.json({ success: true, message: "Verification code sent to your email." });
    } else {
      // Development mode fallback: Print the code to the terminal
      console.log(`\n🔑 [DEVELOPMENT MODE] OTP code for ${email}: ${otp}\n`);
      return NextResponse.json({
        success: true,
        devMode: true,
        otp, // In dev mode, return the OTP so the frontend can display it as a tip
        message: "Development Mode: Code generated and logged to the server terminal.",
      });
    }
  } catch (error: any) {
    console.error("Error in send-otp API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send verification code." },
      { status: 500 }
    );
  }
}
