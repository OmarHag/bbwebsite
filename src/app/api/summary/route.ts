// src/app/api/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { marked } from "marked";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const { messages, company, role, resumeText, endInterview } = await req.json();

    const chatHistory = (messages || [])
      .map((m: { from: string; text: string }) => `[${m.from}]: ${m.text}`)
      .join("\n");

    const systemPrompt = `
You are a strict FAANG-level interviewer AND interview coach.
You operate in two modes depending on "endInterview".

==================================================
### MODE 1 — INTERVIEW MODE (endInterview = false)
==================================================
- Warm, human, conversational.
- Ask ONE question at a time.
- Tailor tone to company.
- Do NOT evaluate.
- Do NOT score.
- Do NOT mention mock interviews.

==================================================
### MODE 2 — FINAL REVIEW (endInterview = true)
==================================================
STOP interviewing immediately.
Produce **only** the final review.

==================================================
### LENGTH-BASED STRICTNESS
==================================================
Count transcript words.

If <120 words OR fewer than 3 answers:
- Final Score MUST be 1–3/10
- All category scores MUST be 1–4
- Summary MUST include:
  "The interview was extremely short, which severely impacted your evaluation."

If 120–300 words:
- Max final score = 6/10

If >300 words:
- Score normally but still strict.

==================================================
### SCORING SCALE (STRICT)
==================================================
1–3 = terrible  
4–5 = weak  
6 = borderline  
7 = decent  
8–9 = strong  
10 = extremely rare  

==================================================
### OUTPUT FORMAT (STRICT MARKDOWN)
==================================================

## Final Score: X/10

### Overall Analysis
(paragraph)

### Strengths
- bullet
- bullet

### Areas for Improvement
- bullet
- bullet

### How to Improve for ${company}
- bullet
- bullet

### CONTEXT
Role: ${role}
Company: ${company}
Resume (first 500 chars): ${resumeText?.substring(0, 500) || "N/A"}

DO NOT break format.
DO NOT be nice.
Be strict and realistic.
END.
`;

    const userPrompt = endInterview
      ? `FINAL REVIEW MODE. END INTERVIEW. Transcript:\n${chatHistory}`
      : `INTERVIEW MODE. Continue naturally. Transcript:\n${chatHistory}`;

    const llmResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const markdown = llmResponse.choices[0].message.content?.trim() || "";
    const html = marked.parse(markdown);

    return NextResponse.json(
      { html, markdown, ended: !!endInterview },
      { status: 200 }
    );
  } catch (err) {
    console.error("Summary API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error generating summary." },
      { status: 500 }
    );
  }
}
