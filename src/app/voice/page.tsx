"use client";

import { useEffect, useState, useRef } from "react";

export default function VoiceInterviewPage() {
  // ------------------------------
  // STATE (must be INSIDE component)
  // ------------------------------
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [recording, setRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ------------------------------
  // UPLOAD RESUME FUNCTION
  // ------------------------------
  const uploadResume = async () => {
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append("resume", resumeFile); // Key "resume" matches backend

    const res = await fetch("/api/resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resume upload failed:", data.error);
      return;
    }

    // Save the raw text for the interview API
    setResumeText(data.text);
  };

  // ------------------------------------------
  // STOP SPEAKING WHEN PAGE UNMOUNTS
  // ------------------------------------------
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // ------------------------------------------
  // STOP AI VOICE
  // ------------------------------------------
  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // ------------------------------------------
  // ELEVENLABS TTS
  // ------------------------------------------
  const speak = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const res = await fetch("/api/tts", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    });

    // NOTE: The TTS server response is audio/mpeg, handled by browser's Audio constructor
    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
  };

  // ------------------------------------------
  // START RECORDING
  // ------------------------------------------
  const startRecording = async () => {
    stopVoice();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    setRecording(true);

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    mediaRecorder.onstop = async () => {
      setRecording(false);
      setAiThinking(true);

      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      await sendAudio(audioBlob);

      setAiThinking(false);
    };

    mediaRecorder.start();
  };

  // ------------------------------------------
  // STOP RECORDING
  // ------------------------------------------
  const stopRecording = () => {
    stopVoice();
    mediaRecorderRef.current?.stop();
  };

  // ------------------------------------------
  // SEND AUDIO TO BACKEND
  // ------------------------------------------
  const sendAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("company", selectedCompany || "");
    formData.append("role", selectedRole || "");
    formData.append("resumeText", resumeText || ""); // Sent if resume was uploaded

    const res = await fetch("/api/voice", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { from: "You", text: data.transcript },
      { from: "AI", text: data.reply },
    ]);

    await speak(data.reply);
  };

  return (
    <main className="min-h-screen bg-[#0A0F1F] text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          🎤 Voice Interview Mode
        </h1>

        <p className="text-gray-400 text-sm mb-8">
          Practice real-time interviews with an AI hiring manager. Speak naturally —
          the AI listens, analyzes, and responds instantly.
        </p>


        {/* COMPANY + ROLE SELECTOR */}
        <div className="mb-8 space-y-4">

          {/* Company */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Select Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg"
            >
              <option value="">Choose a company</option>
              <option value="Google">Google</option>
              <option value="Amazon">Amazon</option>
              <option value="Meta">Meta</option>
              <option value="Apple">Apple</option>
              <option value="Microsoft">Microsoft</option>
              <option value="NVIDIA">NVIDIA</option>
              <option value="Tesla">Tesla</option>
              <option value="Stripe">Stripe</option>
              <option value="Uber">Uber</option>
              <option value="Bloomberg">Bloomberg</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg"
            >
              <option value="">Choose a role</option>

              {/* Engineering */}
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Backend Engineer">Backend Engineer</option>
              <option value="Full-Stack Engineer">Full-Stack Engineer</option>
              <option value="Mobile Engineer">Mobile Engineer (iOS/Android)</option>
              <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="Cloud Engineer">Cloud Engineer</option>
              <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
              <option value="DevOps Engineer">DevOps / Infrastructure Engineer</option>
              <option value="SRE">Site Reliability Engineer (SRE)</option>

              {/* Data */}
              <option value="Data Analyst">Data Analyst</option>
              <option value="Business Intelligence Analyst">Business Intelligence Analyst</option>
              <option value="Product Data Analyst">Product Data Analyst</option>

              {/* Product & Design */}
              <option value="Product Manager">Product Manager</option>
              <option value="Program Manager">Program Manager</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="UX Researcher">UX Researcher</option>

              {/* Hardware Roles (Tesla, Apple, NVIDIA) */}
              <option value="Electrical Engineer">Electrical Engineer</option>
              <option value="Mechanical Engineer">Mechanical Engineer</option>
              <option value="Hardware Engineer">Hardware Engineer</option>
              <option value="Autopilot Engineer">Autopilot / Robotics Engineer</option>

              {/* Business / Ops */}
              <option value="Business Analyst">Business Analyst</option>
              <option value="Operations Analyst">Operations Analyst</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Sales Engineer">Sales Engineer</option>
              <option value="Technical Program Manager">Technical Program Manager</option>
            </select>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-center gap-6 mb-10">

          {/* RESUME UPLOAD */}
          <div className="mb-6">
            <label className="block mb-1 text-sm text-gray-300">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg"
            />

            <button
              onClick={uploadResume}
              disabled={!resumeFile}
              className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              Upload Resume
            </button>

            {resumeText && (
              <p className="text-green-400 text-sm mt-2">
                ✔ Resume uploaded and analyzed
              </p>
            )}
          </div>

          {/* START */}
          <button
            onClick={startRecording}
            disabled={recording}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${recording
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500"
              }`}
          >
            {recording ? "Listening..." : "Start Talking"}
          </button>

          {/* STOP & SEND */}
          <button
            onClick={stopRecording}
            disabled={!recording}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${recording
              ? "bg-red-600 hover:bg-red-500"
              : "bg-gray-700 cursor-not-allowed"
              }`}
          >
            Stop & Send
          </button>

          {/* STOP VOICE */}
          <button
            onClick={stopVoice}
            className="px-6 py-3 rounded-lg font-semibold bg-red-700 hover:bg-red-600 text-white shadow-md"
          >
            Stop Voice
          </button>

          {/* RECORDING DOT */}
          {recording && (
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
          )}
        </div>

        {/* MESSAGES */}
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl max-w-[80%] ${m.from === "You"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-800 text-gray-200"
                }`}
            >
              <p className="text-sm opacity-60 mb-1">{m.from}</p>
              <p>{m.text}</p>
            </div>
          ))}

          {aiThinking && (
            <div className="bg-gray-800 p-4 rounded-xl w-24 flex gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}