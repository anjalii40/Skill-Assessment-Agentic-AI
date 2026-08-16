/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint handles logging the user out. It tells the user's web browser to delete the
 * "session_token" cookie. Once deleted, the user is no longer recognized as logged in and will
 * be redirected back to the Login page.
 */

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Successfully logged out.",
  });

  // Clear the session_token cookie by setting its expiration to the past
  response.cookies.set("session_token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
