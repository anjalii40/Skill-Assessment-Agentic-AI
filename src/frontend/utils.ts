/**
 * 💡 WHAT THIS FILE DOES:
 * This is a helper utility file. It contains styling shortcuts that merge Tailwind CSS classes
 * together cleanly, preventing styling conflicts in our interface.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses JSON strings returned by LLMs, clearing markdown wrappers
 * and repairing common formatting issues (such as raw unescaped newlines).
 */
export function safeParseJson<T = any>(str: string): T {
  let cleaned = str.trim();
  
  // Remove markdown block backticks (e.g. ```json ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
  }
  
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    // Attempt to repair raw newlines or control chars inside string fields
    try {
      const repaired = cleaned.replace(/[\n\r]/g, (match) => {
        if (match === "\n") return "\\n";
        if (match === "\r") return "\\r";
        return match;
      });
      return JSON.parse(repaired) as T;
    } catch (repairedError) {
      console.error("JSON parsing failed. Raw string:", str);
      throw error;
    }
  }
}

