/**
 * 💡 WHAT THIS FILE DOES:
 * This is our application's "security checkpoint" (Next.js Proxy).
 * Before loading any page or running any actions, Next.js runs this file.
 * It checks if the visitor has a valid "session_token" cookie. If they don't,
 * it intercepts the request and redirects them to the `/login` screen.
 * It is configured to ignore the login page itself, the login/OTP API routes,
 * and static assets (like images or styles) so they can load freely.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = 
    pathname.startsWith("/apply") ||
    pathname.startsWith("/api/apply") ||
    pathname === "/api/parse" ||
    pathname === "/api/interview" ||
    pathname === "/api/evaluate" ||
    pathname === "/api/result" ||
    pathname === "/api/campaigns";

  // If the user has no session cookie and is attempting to access a protected route, redirect to login
  if (!sessionToken) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    // Remember the original page they tried to visit so we can redirect them back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is logged in and trying to go to login, send them to the main page
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for:
   * 1. /api/auth/* (OTP send/verify endpoints)
   * 2. /login (the login screen)
   * 3. _next/static (static files)
   * 4. _next/image (image optimization files)
   * 5. favicon.ico, images, or assets inside the public folder
   */
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
