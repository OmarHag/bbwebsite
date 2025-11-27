// src/app/api/voice/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

type CoachReview = {
  score: number;
  categories: { label: string; value: number }[];
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get("audio") as File | null;
    const company = (formData.get("company") as string) || "General Company";
    const role = (formData.get("role") as string) || "Software Engineer";
    const resumeText = (formData.get("resumeText") as string) || "";
    const endInterview = formData.get("endInterview") === "true";

    // Cooldown to prevent Groq 429 rate limit
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isEmptyAudio = !audioFile || audioFile.size === 0;
    let transcriptText = "";

    // ---- Whisper Transcript ----
    if (!isEmptyAudio) {
      const wrapped = new File([audioFile], "audio.webm", { type: "audio/webm" });

      const transcription = await groq.audio.transcriptions.create({
        file: wrapped,
        model: "whisper-large-v3",
      });

      transcriptText = (transcription.text || "").trim();
    } else {
      transcriptText = endInterview
        ? "[User ended the interview and requested feedback.]"
        : "";
    }

    // ---- Extract project lines ----
    function extractProjects(text: string): string[] {
      if (!text) return [];
      return text
        .split("\n")
        .filter(
          (line) =>
            line.toLowerCase().includes("project") ||
            line.toLowerCase().includes("built") ||
            line.toLowerCase().includes("developed")
        )
        .slice(0, 8);
    }

    const detectedProjects = extractProjects(resumeText);
    const projectList =
      detectedProjects.length > 0
        ? detectedProjects.map((p) => `- ${p}`).join("\n")
        : "- [No clear projects detected from resume text]";

    // =====================================
    // MODE 1 — INTERVIEWER (NOT ENDING)
    // =====================================

    if (!endInterview) {
      const systemPromptInterview = `
You are a realistic human interviewer.
Warm, conversational, human — NOT robotic.

INTERVIEW RULES:
- Respond naturally to what the candidate said.
- Give 1–2 sentences of reaction.
- Ask EXACTLY ONE follow-up question.
- DO NOT provide feedback.
- DO NOT score.
- DO NOT break character.

RESUME:
${resumeText || "[None]"}

PROJECT HINTS:
${projectList}
`;

      const userPrompt = transcriptText
        ? `Candidate said: "${transcriptText}" — respond in INTERVIEW MODE.`
        : `Start the interview for ${role} at ${company}. Greet them naturally and begin.`;

      const chatResponse = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPromptInterview },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const reply =
        chatResponse.choices[0]?.message?.content?.trim() ||
        "Let's get started — walk me through your background.";

      return NextResponse.json({
        transcript: transcriptText,
        reply,
        ended: false,
      });
    }

    // ======================================================
    // MODE 2 — STRICT COACH MODE (JSON ONLY)
    // ======================================================

    const systemPromptCoach = `
You are a FAANG-level senior interviewer giving HARSH, STRICT review.

You MUST penalize short interviews heavily.

==================================================
WORD-COUNT STRICTNESS RULES
==================================================
Let WORD_COUNT be the transcript length.

If WORD_COUNT < 120 OR fewer than 3 total answers:
- Final score MUST be 1–3/10
- Category scores MUST be 1–4/10
- Summary MUST include:
  "The interview was extremely short, which severely impacted your evaluation."

If WORD_COUNT 120–300:
- Final score MAX = 6/10

If WORD_COUNT > 300:
- Score normally (still strict).

==================================================
SCORING RULES
==================================================
1–3 → Very poor  
4–5 → Weak  
6 → Barely OK  
7 → Decent  
8–9 → Strong  
10 → Extremely rare  

Cutting the interview short = automatic deduction.

==================================================
OUTPUT FORMAT — JSON ONLY
==================================================
{
  "score": number,
  "categories": [
    { "label": "Communication Clarity", "value": number },
    { "label": "Confidence & Delivery", "value": number },
    { "label": "Technical Strength", "value": number },
    { "label": "Project & Resume Depth", "value": number },
    { "label": "Problem Solving & Thinking", "value": number },
    { "label": "Role Fit for ${role}", "value": number }
  ],
  "summary": "strict paragraph",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "nextSteps": ["...", "..."]
}

No markdown. No backticks.
Be harsh, realistic, and direct.
`;

    const userPromptCoach = `
TRANSCRIPT:
${transcriptText}

RESUME:
${resumeText}

PROJECTS:
${projectList}

Generate STRICT JSON ONLY.
`;

    const coachResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPromptCoach },
        { role: "user", content: userPromptCoach },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const raw = coachResponse.choices[0]?.message?.content?.trim() || "";

    let review: CoachReview;

    try {
      review = JSON.parse(raw) as CoachReview;
    } catch (err) {
      console.error("JSON parse error:", raw);

      review = {
        score: 2,
        categories: [
          { label: "Communication Clarity", value: 2 },
          { label: "Confidence & Delivery", value: 2 },
          { label: "Technical Strength", value: 2 },
          { label: "Project & Resume Depth", value: 2 },
          { label: "Problem Solving & Thinking", value: 2 },
          { label: `Role Fit for ${role}`, value: 2 },
        ],
        summary:
          "The interview response was too short or malformed for proper evaluation.",
        strengths: [],
        improvements: ["Provide real answers next time."],
        nextSteps: ["Complete at least 3–5 questions before ending."],
      };
    }

    return NextResponse.json({
      transcript: transcriptText,
      review,
      ended: true,
    });
  } catch (err) {
    console.error("Voice API error:", err);
    return NextResponse.json(
      { error: "Voice interview processing failed" },
      { status: 500 }
    );
  }
}
