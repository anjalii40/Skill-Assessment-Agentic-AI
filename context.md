/**
 * 💡 WHAT THIS FILE DOES:
 * This document provides the Business Context and Product vision for the AI Skill Assessor.
 * It explains *why* this product exists, the problems it solves for recruiters and hiring managers,
 * the user journey, and future roadmap directions.
 */

# Business & Product Context: AI Skill Assessor

This document provides the high-level product vision, market problem, user persona journeys, and future planning.

---

## 1. The Core Problem

Standard hiring screenings suffer from two major flaws:
1. **Keyword Stuffing**: Candidates add lists of buzzwords to their resumes to pass automated screening systems (ATS), even if they have never used them.
2. **Generic Multiple Choice Screens**: Traditional screening assessments (like LeetCode or generic quizzes) often test trivia or puzzles, rather than situational, project-level problem solving.

**The Solution**: The AI Skill Assessor targets the *overlap* between a candidate's resume claims and the job description, asking highly custom, situational developer questions, and evaluating the depth of their real-world experience.

---

## 2. Target User Personas & Journeys

### 👥 The Technical Recruiter
* **Goal**: Quickly separate qualified candidates from candidates who stuffed keywords.
* **Journey**:
  1. Login with a simple OTP email validation.
  2. Upload a candidate's resume and paste the job description.
  3. Review the extracted overlap skills.
  4. Hand the keyboard/link to the candidate to take the short 3-question screen.
  5. Review the final dashboard, noting readiness indicators (e.g. "Strong shortlist") and checking if any answers triggered the integrity/bluffing alerts.

### 👥 The Candidate
* **Goal**: Demonstrate their skills fairly using a practical, situational format rather than answering multiple-choice trivia questions.
* **Journey**:
  1. Receives questions specific to the overlapping skills.
  2. Submits concise, engineering-focused explanations.
  3. Receives immediate feedback and a personalized upskilling/learning roadmap.

---

## 3. Product Roadmap

1. **Staged Database Integration**: Add persistent PostgreSQL storage to save completed assessments.
2. **Candidate Share Links**: Generate single-use invitation tokens so candidates can complete screens remotely.
3. **Advanced Voice Screener**: Add real-time text-to-speech and voice recording to assess verbal communication skills.
