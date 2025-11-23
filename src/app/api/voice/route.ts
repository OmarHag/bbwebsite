import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get("audio") as File | null;
    const company = (formData.get("company") as string) || "General company";
    const role =
      (formData.get("role") as string) || "Software Engineering Intern";

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio uploaded" },
        { status: 400 }
      );
    }

    // Wrap Blob into a proper File for Groq Whisper
    const wrapped = new File([audioFile], "audio.webm", {
      type: "audio/webm",
    });

    // Transcribe user speech
    const transcription = await groq.audio.transcriptions.create({
      file: wrapped,
      model: "whisper-large-v3",
    });

    const transcriptText = (transcription.text || "").trim();

    // -------- SYSTEM PROMPT: STRICT INTERVIEW MODE --------
    const systemPrompt = `
You are an AI mock interviewer for "${company}", interviewing the user for the role of "${role}".

Your rules:
- You are ALWAYS in INTERVIEW MODE.
- NEVER ask: "What do you want to talk about?" or any open-ended small-talk.
- Assume the user is here ONLY to practice an interview.
- Start the interview immediately with an interview-style question.
- Every reply MUST:
  1) Optionally give *short* feedback on the last answer (2–3 sentences max), and
  2) Ask EXACTLY ONE clear interview question.
- Use realistic behavioral and/or role-specific questions for ${role} at ${company}.
- Stay on topic: their experience, skills, projects, resume, behavioral questions, technical questions.
- Do NOT ramble. Keep responses concise, like a real human interviewer.
- Do NOT become a general chatbot. No life advice, no random topics, no jokes unless directly relevant.
`;

    // -------- USER CONTENT: INCLUDE COMPANY + ROLE CONTEXT --------
    const userContent =
      transcriptText.length > 0
        ? `Company: ${company}
Role: ${role}
Candidate just said: "${transcriptText}".

Continue the interview. Stay in interview mode.`
        : `Start a mock interview for ${role} at ${company}. Ask the first question now.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const reply =
      chatResponse.choices[0]?.message?.content?.trim() ||
      "Great, let's begin. Why are you interested in this role at " + company + "?";

    return NextResponse.json({
      transcript: transcriptText,
      reply,
    });
  } catch (err) {
    console.error("Voice API error:", err);
    return NextResponse.json(
      { error: "Voice interview processing failed" },
      { status: 500 }
    );
  }
}
