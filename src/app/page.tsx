// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0F1F] text-white px-6 py-20">

      <div className="max-w-5xl mx-auto text-center">

        {/* TAGLINE */}
        <div className="mb-4 inline-block rounded-full bg-blue-900/40 text-blue-300 px-4 py-1 text-sm">
          🎤 AI Voice-Powered Interview Practice
        </div>

        {/* MAIN HEADER */}
        <h1 className="text-5xl font-bold leading-tight">
          Practice Real Interviews <br />
          <span className="text-blue-400">With a Voice AI Interviewer</span>
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
          Talk naturally with an AI hiring manager that listens, responds,
          and challenges you — just like a real interview. Improve your
          communication, confidence, and clarity using realistic back-and-forth
          voice conversations.
        </p>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/voice"
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
          >
            Try Voice Interview →
          </Link>

          <Link
            href="/practice"
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold"
          >
            Text Practice
          </Link>
        </div>

        {/* DEMO VISUAL */}
        <div className="mt-14">
          <div className="w-full max-w-4xl mx-auto px-4 rounded-2xl bg-[#0D1224] shadow-lg border border-white/5 flex items-center justify-center">

            {/* FAKE WAVEFORM PREVIEW */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-10 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-6 bg-blue-300 rounded-full animate-pulse"></div>

              <span className="ml-4 text-gray-300 font-medium">
                Voice AI Demo
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
