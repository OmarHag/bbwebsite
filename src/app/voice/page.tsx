"use client";

import { useEffect, useState, useRef } from "react";

export default function VoiceInterviewPage() {
// ------------------------------
// STATE
// ------------------------------
const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
const [recording, setRecording] = useState(false);
const [aiThinking, setAiThinking] = useState(false);
const [uploadingResume, setUploadingResume] = useState(false);

const [selectedCompany, setSelectedCompany] = useState("");
const [selectedRole, setSelectedRole] = useState("");

const [resumeFile, setResumeFile] = useState<File | null>(null);
const [resumeText, setResumeText] = useState<string>(""); 
const [resumeStatusMessage, setResumeStatusMessage] = useState<string>("");

const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
const audioRef = useRef<HTMLAudioElement | null>(null);

// ------------------------------
// UPLOAD RESUME FUNCTION
// ------------------------------
const uploadResume = async () => {
  if (!resumeFile) return;

  setUploadingResume(true); 
  setResumeStatusMessage(""); 
  setResumeText(""); // Clear previous text

  const formData = new FormData();
  formData.append("resume", resumeFile); 

  try {
    const res = await fetch("/api/resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resume extraction failed:", data.error);
      setResumeStatusMessage(`❌ Failed to analyze: ${data.error || 'Check server logs.'}`);
      return;
    }

    setResumeText(data.text);
    setResumeStatusMessage("✔ Resume uploaded and analyzed successfully!");
  } catch (error) {
      console.error("Network or catch block error:", error);
      setResumeStatusMessage("❌ Network error during upload.");
  } finally {
      setUploadingResume(false); 
  }
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
  // Check the ref to ensure it's not null before calling stop()
  if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
  }
};

// ------------------------------------------
// SEND AUDIO TO BACKEND
// ------------------------------------------
const sendAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("company", selectedCompany || "");
  formData.append("role", selectedRole || "");
  formData.append("resumeText", resumeText || ""); 

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

// Disable talking if the AI is thinking, uploading, or if resume analysis failed
const disableTalk = aiThinking || uploadingResume || (resumeFile && !resumeText);


return (
  <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-12 flex justify-center">
    <div className="w-full max-w-3xl">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-center">
          <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
              🎙️ Voice Interview
          </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed text-center border-b border-slate-700 pb-4">
          Practice a real-time, voice-to-voice technical interview tailored to you.
      </p>


      {/* CONFIGURATION */}
      <div className="mb-10 p-6 bg-slate-800/80 rounded-xl shadow-2xl space-y-4">
        <h2 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-3">Job Configuration</h2>
        {/* Company */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">Target Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Choose a company...</option>
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
          <label className="block mb-2 text-sm font-medium text-slate-300">Target Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Choose a role...</option>

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

            <option value="Data Analyst">Data Analyst</option>
            <option value="Business Intelligence Analyst">Business Intelligence Analyst</option>
            <option value="Product Data Analyst">Product Data Analyst</option>

            <option value="Product Manager">Product Manager</option>
            <option value="Program Manager">Program Manager</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="UX Researcher">UX Researcher</option>

            <option value="Electrical Engineer">Electrical Engineer</option>
            <option value="Mechanical Engineer">Mechanical Engineer</option>
            <option value="Hardware Engineer">Hardware Engineer</option>
            <option value="Autopilot Engineer">Autopilot / Robotics Engineer</option>

            <option value="Business Analyst">Business Analyst</option>
            <option value="Operations Analyst">Operations Analyst</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Sales Engineer">Sales Engineer</option>
            <option value="Technical Program Manager">Technical Program Manager</option>
          </select>
        </div>
      </div>

      {/* RESUME UPLOAD AND STATUS */}
      <div className="p-6 bg-slate-800/80 rounded-xl shadow-2xl mb-10">
          <h2 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-3 mb-4">Resume Input</h2>
          <div className="flex items-center gap-4">
              <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-600 bg-slate-700 text-white rounded-lg p-2 cursor-pointer"
              />

              <button
                  onClick={uploadResume}
                  disabled={!resumeFile || uploadingResume}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
              >
                  {uploadingResume ? (
                      <>
                          <span className="animate-spin mr-2">⚙️</span>
                          Analyzing...
                      </>
                  ) : (
                      "Upload & Analyze"
                  )}
              </button>
          </div>
          {/* Status message display */}
          {resumeStatusMessage && (
              <p className={`text-sm mt-3 p-2 rounded-lg ${resumeStatusMessage.startsWith("✔") ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {resumeStatusMessage}
              </p>
          )}
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-center gap-6 mb-12">
        
        {/* START */}
        <button
          onClick={startRecording}
          // Fix: Ensure the disabled prop is a straight boolean
          disabled={Boolean(recording || disableTalk)} 
          className={`px-8 py-4 rounded-full font-bold text-white transition transform hover:scale-105 shadow-lg ${!disableTalk && !recording
            ? "bg-green-600 hover:bg-green-500"
            : "bg-slate-700 cursor-not-allowed"
            }`}
        >
          {recording ? "🎙️ Listening..." : "Start Talking"}
        </button>

        {/* STOP & SEND */}
        <button
          onClick={stopRecording}
          // Fix: Ensure the disabled prop is a straight boolean
          disabled={Boolean(!recording)} 
          className={`px-8 py-4 rounded-full font-bold text-white transition transform hover:scale-105 shadow-lg ${recording
            ? "bg-red-600 hover:bg-red-500"
            : "bg-slate-700 cursor-not-allowed"
            }`}
        >
          Stop & Send
        </button>

        {/* STOP VOICE */}
        <button
          onClick={stopVoice}
          className="px-6 py-3 rounded-lg font-semibold bg-red-800 hover:bg-red-700 text-white shadow-md text-sm"
        >
          🛑 Stop AI Voice
        </button>

        {/* RECORDING DOT */}
        {recording && (
          <div className="w-5 h-5 rounded-full bg-red-500 animate-ping"></div>
        )}
      </div>

      {/* CHAT MESSAGES */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto p-4 border border-slate-700 rounded-xl bg-slate-900/50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl max-w-[85%] ${m.from === "You"
              ? "bg-blue-700 ml-auto shadow-md"
              : "bg-slate-800 text-slate-200 shadow-md"
              }`}
          >
            <p className="text-xs font-mono opacity-70 mb-1">{m.from}</p>
            <p className="text-base">{m.text}</p>
          </div>
        ))}

        {/* AI THINKING INDICATOR */}
        {(aiThinking || uploadingResume) && (
          <div className="p-4 rounded-xl w-32 flex gap-2 bg-slate-800">
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-0"></div>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse delay-300"></div>
          </div>
        )}
      </div>
    </div>
  </main>
);
}