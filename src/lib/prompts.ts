export const Prompts = {
  // Call 1: Extraction & Gap Analysis
  EXTRACTOR: `You are an expert technical recruiter and resume parser. 
Analyze the provided Resume Text and Job Description (JD) Text.
Normalize the skills (e.g., equate 'React.js' to 'React').
Extract the skills required by the JD.
Extract the skills claimed in the Resume.
Determine the initial gaps (skills in JD but not in Resume) and the overlap (skills in both). 
Output your analysis STRICTLY conforming to the provided JSON schema.`,

  // Call 2: Interview Question Generation
  INTERVIEWER: `You are an elite, no-nonsense Staff Engineer conducting a technical screen. 
Your goal is to bypass buzzwords and verify if the candidate actually possesses the 'target_skill' they claim to have.
Ask ONE situational, highly specific question targeting the skill. 
Do not be polite or chatty. Do not include greetings.
Output the question, AND a strict list of 2-5 expected key technical concepts or keywords they must mention to prove genuine knowledge.
Return ONLY JSON matching the schema.`,

  // Call 3: Answer Evaluation
  EVALUATOR: `You are a ruthlessly objective technical grading system. 
Compare the user's answer against the expected technical concepts.
Score the answer from 1 to 5:
1: Novice / Dropping buzzwords / Utterly incorrect
2: Beginner / Surface-level definition / Lacks practical application
3: Intermediate / Practical knowledge / Standard implementation
4: Advanced / Understands edge cases / Tradeoffs
5: Expert / System design level / Deep underlying mechanics

Bluff Detection Rule: If they fail to hit 20% of expected concepts AND write an evasive/long answer, set 'bluff_detected' to true, and cap their score at 2.
Return strictly JSON matching the schema.`,

  // Call 4: Learning Plan Generation
  PLAN_GENERATOR: `You are a personalized technical mentor agent.
You are given the user's final skill scores after a technical interview, and the original target skills from the Job Description.
Calculate a 'final_readiness_score' out of 100 based on standard weights.
Provide a 3-module learning plan. Each module must directly address a skill gap (score < 4, or an untested gap).
Keep it highly actionable with a realistic time estimate and a dummy link to a resource.
Return strictly JSON matching the schema.`
};

export const Schemas = {
  ExtractorSchema: {
    type: "json_schema" as const,
    json_schema: {
      name: "extractor_output",
      schema: {
        type: "object",
        properties: {
          resume_skills: { type: "array", items: { type: "string" } },
          jd_skills: { type: "array", items: { type: "string" } },
          initial_gaps: { type: "array", items: { type: "string" } },
          overlap: { type: "array", items: { type: "string" } },
        },
        required: ["resume_skills", "jd_skills", "initial_gaps", "overlap"],
        additionalProperties: false,
      },
      strict: true,
    },
  },

  InterviewerSchema: {
    type: "json_schema" as const,
    json_schema: {
      name: "interviewer_output",
      schema: {
        type: "object",
        properties: {
          question_text: { type: "string" },
          expected_key_concepts: { type: "array", items: { type: "string" } },
        },
        required: ["question_text", "expected_key_concepts"],
        additionalProperties: false,
      },
      strict: true,
    },
  },

  EvaluatorSchema: {
    type: "json_schema" as const,
    json_schema: {
      name: "evaluator_output",
      schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          bluff_detected: { type: "boolean" },
          reasoning: { type: "string" },
          confidence: { type: "number" },
        },
        required: ["score", "bluff_detected", "reasoning", "confidence"],
        additionalProperties: false,
      },
      strict: true,
    },
  },

  PlanGeneratorSchema: {
    type: "json_schema" as const,
    json_schema: {
      name: "learning_plan_output",
      schema: {
        type: "object",
        properties: {
          final_readiness_score: { type: "number" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                reason: { type: "string" },
                time_estimate: { type: "string" },
                resources: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" }
                    },
                    required: ["title", "url"],
                    additionalProperties: false
                  }
                }
              },
              required: ["topic", "reason", "time_estimate", "resources"],
              additionalProperties: false
            }
          }
        },
        required: ["final_readiness_score", "modules"],
        additionalProperties: false
      },
      strict: true
    }
  }
};
