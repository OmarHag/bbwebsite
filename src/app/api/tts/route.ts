import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // default voice

    if (!ELEVENLABS_API_KEY) {
      return new NextResponse("Missing ELEVENLABS_API_KEY", { status: 500 });
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!response.ok) {
      return new NextResponse("TTS API Error", { status: 500 });
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Server Error", { status: 500 });
  }
}
