"use client";

import { useState } from "react";

type Difficulty = "Easy" | "Medium" | "Hard";

type InterviewRequest = {
  company: string;
  major: string;
  role: string;
  difficulty: Difficulty;
  previousQuestion?: string | null;
  answer?: string;
};

type Feedback = {
  score: number | null;
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  askedQuestion: string;
};

export default function PracticePage() {
  const [company, setCompany] = useState("Amazon");
  const [major, setMajor] = useState("Computer Science");
  const [role, setRole] = useState("Software Engineering Intern");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function callInterviewAPI(payload: InterviewRequest) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      return await res.json();
    } catch (err) {
      alert("AI error — try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartInterview() {
    setFeedback(null);
    setAnswer("");

    const data = await callInterviewAPI({
      company,
      major,
      role,
      difficulty,
      previousQuestion: null,
    });

    if (data?.question) setCurrentQuestion(data.question);
  }

  async function handleSubmitAnswer() {
    if (!currentQuestion) return;

    const data = await callInterviewAPI({
      company,
      major,
      role,
      difficulty,
      previousQuestion: currentQuestion,
      answer: answer.trim() || undefined,
    });

    if (!data) return;

    setFeedback({
      score: data.score ?? null,
      strengths: data.strengths ?? [],
      weaknesses: data.weaknesses ?? [],
      improvedAnswer: data.improvedAnswer ?? "",
      askedQuestion: currentQuestion,
    });

    setAnswer("");

    if (data.nextQuestion) setCurrentQuestion(data.nextQuestion);
    else if (data.question) setCurrentQuestion(data.question);
  }

  return (
    <main className="min-h-screen bg-[#0A0F1F] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Interactive Mock Interview</h1>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">

          {/* FORM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-300">Company</label>
              <select
                className="w-full mt-1 bg-[#0d1323] border border-white/10 px-3 py-2 rounded-lg"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option>Amazon</option>
                <option>Microsoft</option>
                <option>Google</option>
                <option>Meta</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Major</label>
              <select
                className="w-full mt-1 bg-[#0d1323] border border-white/10 px-3 py-2 rounded-lg"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              >
                <option>Computer Science</option>
                <option>Finance</option>
                <option>Business</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Role</label>
              <select
                className="w-full mt-1 bg-[#0d1323] border border-white/10 px-3 py-2 rounded-lg"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Software Engineering Intern</option>
                <option>Data Analyst Intern</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Difficulty</label>
              <select
                className="w-full mt-1 bg-[#0d1323] border border-white/10 px-3 py-2 rounded-lg"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as Difficulty)
                }
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          {/* START */}
          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className="mt-3 bg-blue-500 hover:bg-blue-400 px-5 py-2 rounded-lg font-semibold"
          >
            Start Interview
          </button>

          {/* QUESTION */}
          <div className="bg-[#0f172a] p-4 rounded-xl border border-white/10 mt-4">
            <h3 className="text-gray-400 text-sm mb-2">Interview Question</h3>
            <p>
              {currentQuestion ||
                `Click “Start Interview” to generate your first question.`}
            </p>
          </div>

          {/* ANSWER */}
          <textarea
            rows={5}
            className="w-full bg-[#0d1323] border border-white/10 px-3 py-2 rounded-lg"
            placeholder="Type your answer here…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <button
            onClick={handleSubmitAnswer}
            disabled={!currentQuestion || isLoading}
            className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Submit Answer
          </button>

          {/* FEEDBACK */}
          {feedback && (
            <div className="mt-6 bg-[#0f172a] p-5 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                  Score: {feedback.score}/10
                </span>
                <span className="text-gray-400 text-xs">
                  (10 = excellent, 1 = needs improvement)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-300 font-medium mb-1">Strengths</p>
                  <ul className="text-sm text-gray-200 list-disc pl-5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-red-300 font-medium mb-1">
                    Areas to Improve
                  </p>
                  <ul className="text-sm text-gray-200 list-disc pl-5">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <p className="text-gray-300 font-medium mb-2">
                  Improved Sample Answer
                </p>
                <p className="text-gray-200 text-sm whitespace-pre-line">
                  {feedback.improvedAnswer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
