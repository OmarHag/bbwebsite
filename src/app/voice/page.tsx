// src/app/voice/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type FinalReview = {
  score: number;
  categories: { label: string; value: number }[];
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};

// Company options
const COMPANIES = [
  "Google", "Amazon", "Meta", "Apple", "Microsoft", "Netflix", "NVIDIA", "Tesla",
  "OpenAI", "Anthropic", "DeepMind",
  "HuggingFace", "Cohere", "Perplexity", "Scale AI", "Runway", "ElevenLabs", "Stability AI",
  "Cisco", "Palo Alto Networks", "CrowdStrike", "Zscaler", "Cloudflare", "Okta", "HashiCorp", "Datadog",
  "Stripe", "PayPal", "Square", "Robinhood", "Coinbase", "SoFi",
  "JPMorgan", "Goldman Sachs",
  "Atlassian", "Salesforce", "Zoom", "Slack", "Twilio", "Shopify", "LinkedIn",
  "Deloitte", "Accenture", "McKinsey", "EY", "PwC", "KPMG", "BCG",
  "Riot Games", "Blizzard", "Valve", "Nintendo", "EA", "Ubisoft",
  "Uber", "Lyft", "Airbnb", "DoorDash", "Spotify",
];

type ChatMessage = { from: string; text: string };

export default function VoiceInterviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recording, setRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeStatusMessage, setResumeStatusMessage] = useState("");

  const [finalReview, setFinalReview] = useState<FinalReview | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endInterviewNextRef = useRef(false);

  // Stop ElevenLabs audio
  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => stopVoice();
  }, []);

  // ElevenLabs TTS
  const speak = async (text: string) => {
    stopVoice();

    const res = await fetch("/api/tts", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("TTS API error");
      return;
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
  };

  // Upload Resume
  const uploadResume = async () => {
    if (!resumeFile) return;

    setUploadingResume(true);
    setResumeStatusMessage("");
    setResumeText("");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const res = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setResumeStatusMessage("❌ Failed to analyze resume.");
      } else {
        setResumeStatusMessage("✔ Resume analyzed!");
        setResumeText(data.text);
      }
    } catch {
      setResumeStatusMessage("❌ Network error while uploading resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Start Recording
  const startRecording = async () => {
    stopVoice();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    endInterviewNextRef.current = false;
    setRecording(true);
    setFinalReview(null); // clear old review

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    mediaRecorder.onstop = async () => {
      setRecording(false);
      setAiThinking(true);

      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      await sendAudio(audioBlob, endInterviewNextRef.current);

      setAiThinking(false);
    };

    mediaRecorder.start();
  };

  // Stop & Send
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    endInterviewNextRef.current = false;
    mediaRecorderRef.current.stop();
  };

  // End Interview & Coach Review
  const handleEndInterview = () => {
    // Already have a review → don't spam
    if (finalReview) return;

    if (recording && mediaRecorderRef.current) {
      endInterviewNextRef.current = true;
      mediaRecorderRef.current.stop();
    } else {
      endInterviewNextRef.current = true;
      // Send empty audio just to trigger coach mode
      void sendAudio(new Blob(), true);
    }
  };

  const sendAudio = async (audioBlob: Blob, endInterviewFlag: boolean) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("company", selectedCompany || "");
      formData.append("role", selectedRole || "");
      formData.append("resumeText", resumeText || "");
      formData.append("endInterview", endInterviewFlag ? "true" : "false");

      const res = await fetch("/api/voice", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          { from: "AI", text: "Sorry, something went wrong with the interview API." },
        ]);
        return;
      }

      // ---------------------------
      // NORMAL INTERVIEW MODE
      // ---------------------------
      if (!endInterviewFlag) {
        if (data.transcript) {
          setMessages((prev) => [
            ...prev,
            { from: "You", text: data.transcript as string },
            { from: "AI", text: data.reply as string },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { from: "AI", text: data.reply as string },
          ]);
        }

        await speak(data.reply as string); // only in interview mode
        return;
      }

      // ---------------------------
      // FINAL REVIEW MODE
      // ---------------------------
      if (data.ended && data.review) {
        setFinalReview(data.review as FinalReview);

        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
    } catch (err) {
      console.error("Error sending audio:", err);
      setMessages((prev) => [
        ...prev,
        { from: "AI", text: "Sorry, something went wrong processing your audio." },
      ]);
    }
  };

  // Disable talking if busy or resume not processed yet
  const disableTalk =
    aiThinking ||
    uploadingResume ||
    (!!resumeFile && !resumeText);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1224] to-[#0f1a31] text-white px-4 py-12 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-center mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
            🎙️ Voice Interview
          </span>
        </h1>
        <p className="text-lg text-slate-300 text-center mb-10">
          Practice a real-time, voice-to-voice interview and get a detailed coach review at the end.
        </p>

        {/* Job Configuration */}
        <div className="mb-10 p-6 bg-[#16223a]/80 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Job Configuration</h2>

          <label className="block text-sm mb-1 text-gray-300">Target Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1d2a45] border border-slate-600 text-white focus:ring-teal-500"
          >
            <option value="">Choose a company...</option>
            {COMPANIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="block text-sm mt-4 mb-1 text-gray-300">Target Role</label>
          <input
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1d2a45] border border-slate-600 text-white focus:ring-teal-500"
            placeholder="Software Engineer, Cloud Engineer, Security Engineer, etc."
          />
        </div>

        {/* Resume Upload */}
        <div className="mb-12 p-6 bg-[#16223a]/80 rounded-2xl shadow-xl border border-slate-700 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Resume Input</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="flex-grow p-2 rounded-lg bg-[#1d2a45] border border-slate-700 text-white"
            />

            <button
              onClick={uploadResume}
              disabled={!resumeFile || uploadingResume}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {uploadingResume ? "Analyzing..." : "Upload & Analyze"}
            </button>
          </div>

          {resumeStatusMessage && (
            <p className="mt-3 text-sm text-slate-200">{resumeStatusMessage}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={startRecording}
            disabled={disableTalk || recording}
            className={`px-8 py-4 text-lg rounded-full font-bold text-white transition transform hover:scale-105 shadow-lg ${
              !recording && !disableTalk
                ? "bg-green-600 hover:bg-green-500"
                : "bg-slate-700 cursor-not-allowed"
            }`}
          >
            {recording ? "🎙️ Listening..." : "Start Talking"}
          </button>

          <button
            onClick={stopRecording}
            disabled={!recording}
            className={`px-8 py-4 text-lg rounded-full font-bold text-white transition transform hover:scale-105 shadow-lg ${
              recording
                ? "bg-red-600 hover:bg-red-500"
                : "bg-slate-700 cursor-not-allowed"
            }`}
          >
            Stop &amp; Send
          </button>

          <button
            onClick={handleEndInterview}
            disabled={disableTalk}
            className={`px-8 py-4 text-lg rounded-full font-bold text-white transition transform hover:scale-105 shadow-lg ${
              !disableTalk
                ? "bg-purple-600 hover:bg-purple-500"
                : "bg-slate-700 cursor-not-allowed"
            }`}
          >
            End Interview &amp; Review
          </button>

          <button
            onClick={stopVoice}
            className="px-6 py-3 rounded-full text-sm font-semibold bg-red-700 hover:bg-red-600 text-white shadow-md"
          >
            🛑 Stop AI Voice
          </button>

          {recording && (
            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping self-center" />
          )}
        </div>

        {/* Chat Window */}
        <div className="p-6 bg-[#131e33]/60 rounded-xl border border-slate-700 max-h-[420px] overflow-y-auto shadow-lg">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl mb-3 max-w-[85%] ${
                m.from === "You" ? "bg-blue-700 ml-auto" : "bg-slate-800"
              }`}
            >
              <p className="text-xs font-mono opacity-60 mb-1">{m.from}</p>
              <p className="whitespace-pre-wrap text-sm md:text-base">{m.text}</p>
            </div>
          ))}

          {aiThinking && (
            <div className="flex gap-2 p-3">
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-150" />
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-300" />
            </div>
          )}
        </div>

        {/* Final Coach Review */}
        {finalReview && (
          <div className="mt-14">
            {/* BIG SCORE OUTSIDE BOX */}
            <p className="text-4xl font-extrabold text-teal-300 text-center mb-6">
              ⭐ {finalReview.score}/10
            </p>

            {/* REVIEW CARD */}
            <div className="p-8 bg-[#16223a]/80 rounded-2xl border border-slate-700 shadow-xl space-y-6">
              <h2 className="text-2xl font-bold text-teal-200">
                Final Interview Review
              </h2>

              {/* CATEGORY SCORES */}
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Category Scores
                </h3>
                <div className="space-y-1 text-slate-300 text-[15px] leading-relaxed">
                  {finalReview.categories.map((c) => (
                    <p key={c.label}>
                      <span className="font-semibold text-slate-200">
                        {c.label}:
                      </span>{" "}
                      {c.value}/10
                    </p>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Summary
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {finalReview.summary}
                </p>
              </div>

              {/* STRENGTHS */}
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Strengths
                </h3>
                <ul className="list-disc ml-6 space-y-1 text-slate-300">
                  {finalReview.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* IMPROVEMENTS */}
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Areas to Improve
                </h3>
                <ul className="list-disc ml-6 space-y-1 text-slate-300">
                  {finalReview.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* NEXT STEPS */}
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Suggested Next Steps
                </h3>
                <ul className="list-disc ml-6 space-y-1 text-slate-300">
                  {finalReview.nextSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
