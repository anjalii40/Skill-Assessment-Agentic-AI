/**
 * 💡 WHAT THIS FILE DOES:
 * This document explains the AI Brain and Screen Logic (the Agent rules).
 * It details how we command Gemini/OpenAI, how the questions are customized dynamically,
 * and how the system evaluates candidates and flags buzzword-stuffing (Bluff Detection).
 */

# Agentic Evaluation & AI Logic: AI Skill Assessor

This document details the prompts, heuristics, and reasoning flows used by the AI engine to conduct structured technical interviews and rate developer readiness.

---

## 1. The Screen Flow Lifecycle

The assessment process moves through four distinct AI interactions, utilizing the instruction set defined in [prompts.ts](file:///Users/anjaliprajapati/Skill-Assessment-Agentic-AI/src/lib/prompts.ts):

```
[Resume + JD Upload] ➔ [1. Skill Matcher] ➔ [2. Question Generator] ➔ [3. Answer Evaluator] ➔ [4. Roadmap Planner]
```

---

## 2. Step-by-Step Agent Prompts

### Step 1: Skill Matching & Gap Analysis (`EXTRACTOR`)
- **Objective**: Identify matching skills between the candidate's resume and the job requirements, along with gaps.
- **Rules**: Normalizes titles (e.g. "ReactJS" and "React.js" are matched as "React") to ensure correct overlaps. Output must follow a strict JSON schema.

### Step 2: Dynamic Question Generation (`INTERVIEWER`)
- **Objective**: Ask one highly specific, situational question targeting a chosen skill.
- **Rules**: Staff Engineer persona. It explicitly lists 2–5 expected underlying concepts (not just keywords, but actual patterns/concepts) the candidate should mention to demonstrate practical experience.

### Step 3: Answer Scoring & Bluff Detection (`EVALUATOR`)
- **Objective**: Rate candidate answers on a scale from 1 (Novice) to 5 (Expert).
- **Bluff Detection Heuristic**: 
  - If a candidate writes a lengthy, generic response but fails to hit at least **20% of the expected concepts**, they are flagged for **Bluffing**.
  - A bluffing flag caps the candidate's score at **2** regardless of length, preventing candidates from gaming the screen by pasting long, unrelated textbook definitions.

### Step 4: Roadmap & Readiness Synthesizer (`Result API`)
- **Objective**: Generate a readiness rating (0-100%) and a personalized learning plan.
- **Rules**: Groups answers and scores, maps gaps to custom courses/modules, and presents a curated list of study resources.
