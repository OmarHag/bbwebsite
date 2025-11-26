import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get("audio") as File | null;
    const company = (formData.get("company") as string) || "General company";
    const role = (formData.get("role") as string) || "Software Engineering Intern";
    const resumeText = (formData.get("resumeText") as string) || "";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio uploaded" }, { status: 400 });
    }

    // Wrap into proper file for Whisper
    const wrapped = new File([audioFile], "audio.webm", {
      type: "audio/webm",
    });

    // ----------------------------
    // 1) TRANSCRIBE AUDIO
    // ----------------------------
    const transcription = await groq.audio.transcriptions.create({
      file: wrapped,
      model: "whisper-large-v3",
    });

    const transcriptText = (transcription.text || "").trim();

    // ----------------------------
    // 2) EXTRACT PROJECTS FROM RESUME
    // (simple regex-based detection)
    // ----------------------------
    function extractProjects(text: string): string[] {
      if (!text) return [];
      const lines = text.split("\n");
      return lines
        .filter((l) => l.toLowerCase().includes("project"))
        .slice(0, 5); // limit to 5 to keep prompt small
    }

    const detectedProjects = extractProjects(resumeText);
    const projectList =
      detectedProjects.length > 0
        ? detectedProjects.join("\n- ")
        : "[No clear projects detected]";

    // ----------------------------
    // 3) SYSTEM PROMPT
    // ----------------------------
    const systemPrompt = `
You are a strict AI mock interviewer for the company "${company}", for the role "${role}".

The candidate uploaded this resume text:
${resumeText || "[No resume provided]"}

These are project lines detected in their resume:
- ${projectList}

INTERVIEW RULES:
- ALWAYS remain in interview mode.
- If the user asks:
  "Do you see my resume?"
  "Mention a project from my resume"
  "Talk about my resume"
  → You MUST reference one of the detected projects above.
- If resume is empty, say: 
  "I received your resume but the project section was unclear."
- Every reply MUST:
  1. Give short feedback (2 sentences max)
  2. Ask EXACTLY ONE interview question
- Prefer questions related to:
  • Their resume  
  • Their projects  
  • The chosen company (${company})  
  • The chosen role (${role})
- DO NOT hallucinate fake projects. Use only detected ones above.
- Keep your tone human, concise, and realistic.
`;

    // ----------------------------
    // 4) USER PROMPT
    // ----------------------------
    const userPrompt = transcriptText
      ? `User said: "${transcriptText}". Continue interview.`
      : `Start interview for ${role} at ${company}.`;

    // ----------------------------
    // 5) GET AI RESPONSE
    // ----------------------------
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const reply =
      chatResponse.choices[0]?.message?.content?.trim() ||
      `Let's begin. Why are you interested in this role at ${company}?`;

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
