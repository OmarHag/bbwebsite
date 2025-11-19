import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  const form = await req.formData();
  const audioBlob = form.get("audio") as File;

  if (!audioBlob) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  const wrappedFile = new File([audioBlob], "audio.webm", {
    type: "audio/webm",
  });

  // Whisper transcription
  const transcription = await groq.audio.transcriptions.create({
    file: wrappedFile,
    model: "whisper-large-v3",
  });

  const text = transcription.text;

  // AI follow-up
  const chat = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are an AI interviewer. Ask natural follow-up questions.",
      },
      { role: "user", content: text },
    ],
  });

  const reply = chat.choices[0]?.message?.content ?? "I couldn't understand.";

  return NextResponse.json({ transcript: text, reply });
}
