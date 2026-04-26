import OpenAI from "openai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const apiKey = geminiApiKey ?? openAiApiKey;

const isGemini = Boolean(geminiApiKey);
const baseURL =
  process.env.GEMINI_BASE_URL ??
  process.env.OPENAI_BASE_URL ??
  (isGemini ? "https://generativelanguage.googleapis.com/v1beta/openai/" : undefined);

export const aiClient = new OpenAI({
  apiKey,
  baseURL,
});

export const AI_PROVIDER = baseURL?.includes("generativelanguage.googleapis.com")
  ? "gemini"
  : "openai";

export const FAST_MODEL =
  process.env.GEMINI_FAST_MODEL ??
  process.env.AI_FAST_MODEL ??
  (AI_PROVIDER === "gemini" ? "gemini-3-flash-preview" : "gpt-4o-mini");

export const SMART_MODEL =
  process.env.GEMINI_SMART_MODEL ??
  process.env.AI_SMART_MODEL ??
  (AI_PROVIDER === "gemini" ? "gemini-3-flash-preview" : "gpt-4o");
