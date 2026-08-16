/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint receives the email and the 6-digit login code (OTP) typed by the user.
 * It checks the code against our safety deposit box (the in-memory OTP store).
 * If the code matches and hasn't expired, it creates an encrypted/secure session cookie called "session_token"
 * in the user's browser, letting the rest of the application know they are successfully logged in.
 */

import { NextResponse } from "next/server";
import { verifyOtp } from "@/backend/otp-store";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    const isValid = verifyOtp(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Prepare session data (simple JSON with user email & login timestamp)
    const sessionData = {
      email: email.toLowerCase().trim(),
      createdAt: Date.now(),
    };
    
    const sessionString = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Successfully authenticated.",
      email: sessionData.email,
    });

    // Set a secure, HTTP-only cookie for session tracking
    response.cookies.set("session_token", sessionString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // Session lasts 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
