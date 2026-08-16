/**
 * 💡 WHAT THIS FILE DOES:
 * This API endpoint receives the candidate's resume file (PDF) and the target job description.
 * It parses the PDF directly in-memory using the lightweight JavaScript 'pdf-parse' library,
 * extracting the raw text instantly with zero local Python dependencies.
 * It then calls the AI model (via OpenRouter) to evaluate overlapping skills, gaps,
 * extract profile links (LeetCode, GitHub, etc.), and generate developer insights.
 */

import { NextResponse } from "next/server";
import { aiClient, FAST_MODEL } from "@/lib/ai";
import { Prompts, Schemas } from "@/lib/prompts";
import { safeParseJson } from "@/lib/utils";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jd = formData.get("jd") as string | null;

    if (!file || !jd) {
      return NextResponse.json({ error: "Missing file or JD" }, { status: 400 });
    }

    // Read the file buffer directly in memory
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Dynamically import pdf-parse to read the text content
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    
    const resumeText = pdfData.text;

    // Call the AI model to perform the skill overlap, link extraction, and insights analysis
    const completion = await aiClient.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: "system", content: Prompts.EXTRACTOR },
        { role: "user", content: `Resume Text:\n${resumeText}\n\nJD Text:\n${jd}` },
      ],
      response_format: Schemas.ExtractorSchema,
      max_tokens: 2000,
    });

    const result = safeParseJson(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("API Parse Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
