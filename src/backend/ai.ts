/**
 * 💡 WHAT THIS FILE DOES:
 * This file sets up our connection to the Artificial Intelligence brains (Gemini or OpenAI).
 * It reads the secret keys (API Keys) from our configuration files and initializes the client
 * so that our application can request questions, analyze answers, and build custom learning plans.
 * If no key is set yet (like during building or local testing), it uses a placeholder to prevent errors.
 */

import OpenAI from "openai";

const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const apiKey = openrouterApiKey ?? geminiApiKey ?? openAiApiKey;

const isGemini = Boolean(geminiApiKey);
const baseURL =
  process.env.OPENROUTER_BASE_URL ??
  (openrouterApiKey ? "https://openrouter.ai/api/v1" : undefined) ??
  process.env.GEMINI_BASE_URL ??
  process.env.OPENAI_BASE_URL ??
  (isGemini ? "https://generativelanguage.googleapis.com/v1beta/openai/" : undefined);

export const aiClient = new OpenAI({
  apiKey: apiKey || "dummy-key-for-build-environment",
  baseURL,
  defaultHeaders: openrouterApiKey ? {
    "HTTP-Referer": "https://github.com/anjalii40/Skill-Assessment-Agentic-AI",
    "X-Title": "AI Skill Assessor",
  } : undefined,
});

export const AI_PROVIDER = baseURL?.includes("openrouter.ai")
  ? "openrouter"
  : baseURL?.includes("generativelanguage.googleapis.com")
  ? "gemini"
  : "openai";

export const FAST_MODEL =
  process.env.GEMINI_FAST_MODEL ??
  process.env.AI_FAST_MODEL ??
  (AI_PROVIDER === "openrouter"
    ? "google/gemini-2.5-flash"
    : AI_PROVIDER === "gemini"
      ? "gemini-3-flash-preview"
      : "gpt-4o-mini");

export const SMART_MODEL =
  process.env.GEMINI_SMART_MODEL ??
  process.env.AI_SMART_MODEL ??
  (AI_PROVIDER === "openrouter"
    ? "google/gemini-2.5-pro"
    : AI_PROVIDER === "gemini"
      ? "gemini-3-flash-preview"
      : "gpt-4o");

