"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#0A0F1F] text-white px-6 py-20 flex justify-center">
      <div className="max-w-3xl text-center">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-4">
          Text Practice{" "}
          <span className="text-teal-400">(Coming Soon)</span>
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-300 text-lg leading-relaxed mb-10">
          This will be your text-based interview practice area.
          For now, try the Voice Interview mode to speak directly with the
          AI hiring manager in realistic back-and-forth conversations.
        </p>

        {/* CTA */}
        <Link
          href="/voice"
          className="inline-flex h-12 items-center rounded-full bg-teal-600 px-8 text-lg font-semibold text-white hover:bg-teal-700 transition"
        >
          Try Voice Interview
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </main>
  );
}
