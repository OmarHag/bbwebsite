import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resume = formData.get("resume") as File | null;

    if (!resume) {
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const base64DataURI = `data:${resume.type};base64,${buffer.toString("base64")}`;

    const response = await groq.chat.completions.create({
      // Use the standard text model that often has vision capabilities enabled, or the latest vision model name
      model: "openai/gpt-oss-20b", 
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this resume. Return clean plain text only.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64DataURI,
              },
            },
          ],
        },
      ],
    });

    const extracted = response.choices[0]?.message?.content?.trim() || "";

    if (!extracted) {
        return NextResponse.json(
            { error: "Groq API returned empty text." },
            { status: 500 }
        );
    }

    return NextResponse.json({
      ok: true,
      text: extracted,
    });

  } catch (err) {
    console.error("Resume API Error:", err);
    if (err instanceof Error && 'status' in err) {
         return NextResponse.json(
            { error: `Groq Request failed: ${err.message}` },
            { status: err.status as number }
         );
    }
    return NextResponse.json(
      { error: "Failed to process resume." },
      { status: 500 }
    );
  }
}