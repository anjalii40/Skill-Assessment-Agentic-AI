import { NextResponse } from 'next/server';
import { aiClient, SMART_MODEL } from '@/backend/ai';
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
    const { question, user_answer, expected_key_concepts } = body;

    if (!question || !user_answer || !expected_key_concepts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const completion = await aiClient.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: "system", content: Prompts.EVALUATOR },
        {
          role: "user",
          content: `Question: ${question}\nUser Answer: ${user_answer}\nExpected Concepts: ${expected_key_concepts.join(", ")}`
        }
      ],
      response_format: Schemas.EvaluatorSchema,
      max_tokens: 1000
    });

    const result = safeParseJson(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("API Evaluate Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
