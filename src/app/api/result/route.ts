import { NextResponse } from 'next/server';
import { aiClient, FAST_MODEL } from '@/backend/ai';
import { Prompts, Schemas } from '@/backend/prompts';
import { safeParseJson } from '@/frontend/utils';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { final_skill_scores, jd_skills } = body;

    if (!final_skill_scores || !jd_skills) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const completion = await aiClient.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: "system", content: Prompts.PLAN_GENERATOR },
        {
          role: "user",
          content: `Final Skill Scores:\n${JSON.stringify(final_skill_scores, null, 2)}\n\nOriginal JD Skills:\n${jd_skills.join(", ")}`
        }
      ],
      response_format: Schemas.PlanGeneratorSchema,
      max_tokens: 2500
    });

    const result = safeParseJson(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("API Result Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
