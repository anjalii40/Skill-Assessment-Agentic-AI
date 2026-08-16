# AI Skill Assessor

A modern, highly scalable full-stack Next.js app designed to turn resume claims into an automated, conversational technical screening platform using a "Linear-style" Dark Minimalist SaaS theme.

It parses candidate resumes (via lightweight `pdf-parse` JS), extracts professional profile links (LeetCode, GitHub, LinkedIn), conducts **10-minute live voice interviews** (via Gemini Multimodal Live API over WebSockets), flags empty buzzword claims (Bluff Detection), and outputs actionable upskilling modules.

---

## 🎨 Unified "Linear-Style" Dark Theme
- **Background**: Deep black canvas (`#0D0D0D` / `#121212`)
- **Surfaces & Cards**: Elevated charcoal panels (`#1A1A1A` / `#242424`) with thin low-opacity `1px` borders (`rgba(255, 255, 255, 0.08)`)
- **Accents**: Light, aesthetic pastel shades of **Mint/Sage Green** for primary actions and **Soft Orange/Peach** for tags and alerts.

---

## 🚀 Key Highlights & Features
1. **Multi-Role Shared Link Recruitment**:
   - **Recruiters** log in via OTP code, define campaign briefs (Company Name, Job Title, JD, Skills, Eligibility), and generate secure shareable candidate links (`/apply/[campaignId]`).
   - **Candidates** use the links to submit their details, upload their resume, take the voice screen, and view constructive feedback.
2. **Lightweight In-Memory PDF Parsing**:
   - Parses PDF resumes instantly using the lightweight, pure-JavaScript `pdf-parse` library in memory (eliminating heavy Python models and subprocesses).
3. **Conversational Gemini Live WebSockets**:
   - Establishes a stateful client-to-server connection to Gemini Live (`v1beta`) using raw 16kHz PCM mic input and 24kHz PCM speaker output.
   - Supports user barge-in (interruption) and silence suppression to save bandwidth and prevent latency lag.
4. **Professional Profile Link & AI Insights Extraction**:
   - Automatically extracts LeetCode, CodeChef, GitHub, LinkedIn, and personal portfolio links from resumes.
   - Generates an AI-driven candidate strengths summary block.
5. **Anti-Cheat Bluff Detection**:
   - Flags candidates who write verbose, definitions-only answers but miss the core expected technical concepts.

---

## 🛠️ Tech Stack
- **Next.js 16 (App Router)** & **React 19**
- **Supabase** (Client SDK database connection)
- **Tailwind CSS v4** & **shadcn/ui**
- **Gemini Multimodal Live API** (BidiGenerateContent over WebSockets)
- **OpenRouter** (For serverless REST completions)

---

## 📁 Project Structure
```text
src/
  app/
    api/
      apply/       # candidate registration & assessment submissions
      campaigns/   # campaign creation, retrieval, and candidates list
      parse/       # lightweight JS resume parsing
      interview/   # technical question generators
      evaluate/    # answer scoring & bluff checks
      result/      # final learning plan synthesis
    apply/[id]/    # public candidate shared landing page
    recruiter/     # protected recruiter campaign dashboard
    login/         # OTP login screen
    page.tsx       # SaaS root landing page
    globals.css    # Linear-style visual system
  components/
    VoiceScreen.tsx # WebSocket audio streaming controller
  lib/
    db.ts          # Supabase client helper
    ai.ts          # OpenRouter API client
    prompts.ts     # prompt guidelines & schemas
```

---

## ⚙️ Local Setup

### 1. Configure Environment
Create a `.env.local` file in your root folder:
```bash
# AI & Email Keys
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
RESEND_API_KEY=your_resend_api_key_or_blank_for_dev_mode

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-secret
```

### 2. Supabase Tables Setup
Execute the following SQL queries inside your Supabase project's **SQL Editor**:
```sql
-- Campaigns Table
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  job_title text not null,
  jd text not null,
  skills_required text not null,
  eligibility text not null,
  recruiter_email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Candidates Table
create table candidates (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  name text not null,
  email text not null,
  resume_text text not null,
  profile_links text not null,
  profile_insights text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assessments Table
create table assessments (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references candidates(id) on delete cascade unique not null,
  scores text not null,
  bluffs text not null,
  readiness_score integer not null,
  feedback text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 3. Run Locally
Install dependencies and start the development hot-reloading server:
```bash
npm install
npm run dev
```

The application will launch on **`http://localhost:3001`**.
- Go to `/recruiter` to set up campaigns and grab share links.
- Paste the Campaign UUID as the **Job Code** on the homepage to start an interview.
