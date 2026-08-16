import { NextResponse } from 'next/server';
import { aiClient, SMART_MODEL } from '@/lib/ai';
import { Prompts, Schemas } from '@/lib/prompts';
import { safeParseJson } from '@/lib/utils';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target_skill, resume_context } = body;

    if (!target_skill) {
      return NextResponse.json({ error: 'Missing target skill' }, { status: 400 });
    }

    const completion = await aiClient.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: "system", content: Prompts.INTERVIEWER },
        { role: "user", content: `Target Skill: ${target_skill}\nContext: ${resume_context || 'None'}` }
      ],
      response_format: Schemas.InterviewerSchema,
      max_tokens: 1000
    });

    const result = safeParseJson(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("API Interview Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
