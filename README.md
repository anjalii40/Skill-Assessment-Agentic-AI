# AI Skill Assessor

A modern full-stack Next.js app that turns resume claims into a structured technical screening flow.

Upload a resume, paste a job description, extract skill overlap with Gemini, run a focused interview, score answers, and generate a targeted learning plan from the results.

## Highlights

- Resume upload and PDF text extraction
- Job description skill extraction and gap analysis
- AI-generated interview questions based on overlapping skills
- Answer evaluation with bluff detection
- Readiness scoring with a visual results dashboard
- Personalized learning plan generation
- Modern UI built with Tailwind CSS and shadcn/ui

## Demo Flow

1. Upload a candidate resume as PDF
2. Paste the target job description
3. Extract resume skills, JD skills, gaps, and overlap
4. Interview the candidate on up to 3 overlapping skills
5. Evaluate each answer for depth and credibility
6. Generate a final readiness score and learning path

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Gemini API via Google AI Studio
- OpenAI-compatible SDK client
- `pdf-parse` for PDF extraction
- Recharts for result visualization

## Product Screens

- Upload screen for resume + JD intake
- Live interview screen with progress tracking
- Results screen with radar chart, readiness score, and learning modules

## Project Structure

```text
src/
  app/
    api/
      parse/       # resume parsing + skill extraction
      interview/   # question generation
      evaluate/    # answer scoring
      result/      # readiness + learning plan
    page.tsx       # main UI flow
    globals.css    # visual system
  components/
    ui/            # shadcn/ui primitives
  lib/
    ai.ts          # Gemini/OpenAI-compatible client config
    prompts.ts     # prompts + JSON schemas
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local`:

```bash
GEMINI_API_KEY=your_google_ai_studio_key
```

Optional overrides:

```bash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_FAST_MODEL=gemini-3-flash-preview
GEMINI_SMART_MODEL=gemini-3-flash-preview
```

## Run Locally

```bash
npm run dev
```

App URL:

```bash
http://localhost:8000
```

## Validation

```bash
npm run lint
npx next build --webpack
```

## API Endpoints

- `POST /api/parse`
  Accepts `FormData` with resume PDF and job description, extracts text from the PDF, and returns skill overlap/gaps.

- `POST /api/interview`
  Generates a targeted technical question for a selected skill.

- `POST /api/evaluate`
  Scores the candidate answer and flags likely bluffing.

- `POST /api/result`
  Produces a final readiness score and a tailored learning plan.

## Why This Project

Most screening flows reward keyword stuffing. This project is built to validate practical skill depth instead of just matching buzzwords on a resume.

## Notes

- The app is currently configured for Gemini-first usage.
- The AI client supports an OpenAI-compatible interface, but Gemini is the default provider in this repo.
- The dev server runs on port `8000`.
