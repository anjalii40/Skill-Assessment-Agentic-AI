/**
 * 💡 WHAT THIS FILE DOES:
 * This file initializes our connection to the Supabase client.
 * It reads the Supabase Project URL and Service Role Key from environment variables.
 * During static site generation (next build), if variables are not yet present,
 * it falls back to a valid format URL to ensure the build compiles successfully.
 */

import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Guarantee a valid HTTP/HTTPS URL structure to prevent Next.js compilation errors
if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  supabaseUrl = "https://placeholder-project.supabase.co";
}

if (!supabaseKey) {
  supabaseKey = "placeholder-service-role-key";
}

// Create and export the Supabase Client
export const db = createClient(supabaseUrl, supabaseKey);
