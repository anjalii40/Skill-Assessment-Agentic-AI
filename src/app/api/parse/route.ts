import { NextResponse } from 'next/server';
import { aiClient, FAST_MODEL } from '@/lib/ai';
import { Prompts, Schemas } from '@/lib/prompts';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jd = formData.get('jd') as string | null;

    if (!file || !jd) {
      return NextResponse.json({ error: 'Missing file or JD' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const resumeText = pdfData.text;

    const completion = await aiClient.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: "system", content: Prompts.EXTRACTOR },
        { role: "user", content: `Resume Text:\n${resumeText}\n\nJD Text:\n${jd}` }
      ],
      response_format: Schemas.ExtractorSchema
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("API Parse Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
