"use client";

import { useEffect, useState, useRef } from "react";

export default function VoiceInterviewPage() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [recording, setRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ------------------------------------------
  // STOP SPEAKING ANYTIME PAGE UNMOUNTS
  // ------------------------------------------
  useEffect(() => {
    return () => {
      speechSynthesis.cancel(); // 🚫 stop AI voice when leaving page
    };
  }, []);

  // ------------------------------------------
  // STOP SPEAKING MANUALLY
  // ------------------------------------------
  const stopVoice = () => {
    speechSynthesis.cancel();
  };

  // ------------------------------------------
  // AI SPEAK FUNCTION
  // ------------------------------------------
  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    speechSynthesis.speak(utter);
  };

  // ------------------------------------------
  // START RECORDING
  // ------------------------------------------
  const startRecording = async () => {
    speechSynthesis.cancel(); // stop any current speech

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
    speechSynthesis.cancel(); // stop AI speech here too
    mediaRecorderRef.current?.stop();
  };

  // ------------------------------------------
  // SEND AUDIO TO BACKEND
  // ------------------------------------------
  const sendAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

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

    speak(data.reply);
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

        {/* BUTTONS */}
        <div className="flex items-center justify-center gap-6 mb-10">

          {/* START BUTTON */}
          <button
            onClick={startRecording}
            disabled={recording}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
              recording ? "bg-gray-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {recording ? "Listening..." : "Start Talking"}
          </button>

          {/* STOP & SEND BUTTON */}
          <button
            onClick={stopRecording}
            disabled={!recording}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
              recording ? "bg-red-600 hover:bg-red-500" : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            Stop & Send
          </button>

          {/* STOP VOICE BUTTON — NEW */}
          <button
            onClick={stopVoice}
            className="px-6 py-3 rounded-lg font-semibold bg-red-700 hover:bg-red-600 text-white shadow-md"
          >
            Stop Voice
          </button>

          {/* RED DOT */}
          {recording && (
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
          )}
        </div>

        {/* CHAT MESSAGES */}
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl max-w-[80%] ${
                m.from === "You" ? "bg-blue-600 ml-auto" : "bg-gray-800 text-gray-200"
              }`}
            >
              <p className="text-sm opacity-60 mb-1">{m.from}</p>
              <p>{m.text}</p>
            </div>
          ))}

          {/* AI thinking */}
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
