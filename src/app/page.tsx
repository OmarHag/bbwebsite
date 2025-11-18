// src/app/page.tsx
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

type InterviewResponse = {
  question: string;
  score?: number | null;
  strengths?: string[];
  weaknesses?: string[];
  improvedAnswer?: string;
  nextQuestion?: string;
};

type Feedback = {
  score: number | null;
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  askedQuestion: string;
};

type Tab = "Mock Interview" | "Dashboard" | "How It Works" | "Early Access";

const TABS: Tab[] = [
  "Mock Interview",
  "Dashboard",
  "How It Works",
  "Early Access",
];

export default function HomePage() {
  const [company, setCompany] = useState("Amazon");
  const [major, setMajor] = useState("Computer Science");
  const [role, setRole] = useState("Software Engineering Intern");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Mock Interview");

  async function callInterviewAPI(payload: InterviewRequest) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data: InterviewResponse = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the mock AI. Try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartInterview() {
    setFeedback(null);
    setAnswer("");
    setRound(0);

    const payload: InterviewRequest = {
      company,
      major,
      role,
      difficulty,
      previousQuestion: null,
    };

    const data = await callInterviewAPI(payload);
    if (data?.question) {
      setCurrentQuestion(data.question);
    }
    setActiveTab("Mock Interview");
  }

  async function handleSubmitAnswer() {
    if (!currentQuestion) {
      return;
    }
    if (!answer.trim()) {
      const confirmHelp = window.confirm(
        "You didn't type an answer. Do you want the AI to walk you through a sample answer instead?"
      );
      if (!confirmHelp) return;
    }

    const payload: InterviewRequest = {
      company,
      major,
      role,
      difficulty,
      previousQuestion: currentQuestion,
      answer: answer.trim() || undefined,
    };

    const data = await callInterviewAPI(payload);
    if (!data) return;

    const fb: Feedback = {
      score: data.score ?? null,
      strengths: data.strengths ?? [],
      weaknesses: data.weaknesses ?? [],
      improvedAnswer: data.improvedAnswer ?? "",
      askedQuestion: currentQuestion,
    };

    setFeedback(fb);
    setAnswer("");
    setRound((r) => r + 1);

    if (data.nextQuestion) {
      setCurrentQuestion(data.nextQuestion);
    } else if (data.question) {
      setCurrentQuestion(data.question);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 bg-[#F8FAFC] px-4 py-8 text-slate-900 md:px-6 lg:px-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            For students & first-time job seekers
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-blue-900 sm:text-4xl lg:text-5xl">
            Avanti InterviewCoach <span className="text-blue-600">AI</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            A mock-interview platform where the AI acts as your{" "}
            <span className="font-semibold text-blue-700">
              interviewer and coach
            </span>
            . Get role-specific questions, instant scoring from 1–10, and
            step-by-step feedback that turns every answer into a learning
            moment.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-md sm:text-sm">
          <p className="font-semibold text-slate-900">
            What this prototype shows
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Role-specific question generation</li>
            <li>AI scoring (1–10) + strengths & weaknesses</li>
            <li>Improved sample answer</li>
            <li>Follow-up questions that adapt to performance</li>
          </ul>
        </div>
      </header>

      {/* TABS */}
      <nav className="border-b border-slate-200">
        <div className="flex flex-wrap gap-4 text-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 font-medium text-blue-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* TAB CONTENT */}
      <section className="flex-1 pb-6">
        {/* TAB: MOCK INTERVIEW */}
        {activeTab === "Mock Interview" && (
          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Try the interactive mock interview
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              Choose a company, major, and role. The AI will ask a realistic
              interview question, analyze your answer, and coach you with
              detailed feedback.
            </p>

            {/* Controls */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Company</label>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                >
                  <option>Amazon</option>
                  <option>Microsoft</option>
                  <option>Google</option>
                  <option>Meta</option>
                  <option>Big 4 Accounting</option>
                  <option>Startup</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Major / Focus</label>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                >
                  <option>Computer Science</option>
                  <option>Finance</option>
                  <option>Business</option>
                  <option>Marketing</option>
                  <option>Cybersecurity</option>
                  <option>Data Science</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Role</label>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>Software Engineering Intern</option>
                  <option>Data Analyst Intern</option>
                  <option>Product Management Intern</option>
                  <option>Finance Intern</option>
                  <option>Marketing Intern</option>
                  <option>Cybersecurity Analyst Intern</option>
                  <option>General Behavioral Interview</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Difficulty</label>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={isLoading}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-60"
              >
                {currentQuestion ? "Start new interview" : "Start interview"}
              </button>
              <p className="text-xs text-slate-500">
                {currentQuestion
                  ? `Round ${round + 1} • Answer and get coached in real time.`
                  : "Click “Start interview” to get your first question."}
              </p>
            </div>

            {/* Question + Answer box */}
            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Interview question
                </p>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] text-slate-600 border border-slate-200">
                  Mock interviewer · {company || "Company"}
                </span>
              </div>

              <p className="text-sm text-slate-900">
                {currentQuestion ? (
                  currentQuestion
                ) : (
                  <span className="text-slate-500">
                    No question yet. Start an interview to generate a
                    company- and role-specific question.
                  </span>
                )}
              </p>
            </div>

            {/* Answer input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="answer"
                  className="text-xs font-medium text-slate-800"
                >
                  Your answer
                </label>
                <span className="text-[10px] text-slate-500">
                  Use STAR if you can (Situation, Task, Action, Result)
                </span>
              </div>
              <textarea
                id="answer"
                rows={6}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                placeholder="Type your answer here. If you’re stuck, leave it blank and click “Get help / sample answer”."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!currentQuestion || isLoading}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-black disabled:opacity-60"
                >
                  {answer.trim()
                    ? "Submit & get feedback"
                    : "Get help / sample answer"}
                </button>
                {isLoading && (
                  <span className="text-xs text-slate-500">
                    Thinking like a mock interviewer…
                  </span>
                )}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Feedback on your last answer
                  </p>
                  {feedback.score !== null && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700 border border-blue-200">
                        Score: {feedback.score}/10
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (10 = excellent, 1 = needs improvement)
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${Math.max(
                              10,
                              Math.min(100, (feedback.score / 10) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {feedback.score === null && (
                    <span className="text-[11px] text-slate-500">
                      No score this time — AI provided guidance instead.
                    </span>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1 rounded-lg bg-white p-3 border border-slate-200">
                    <p className="text-xs font-semibold text-green-700">
                      Strengths
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-slate-800">
                      {feedback.strengths.length ? (
                        feedback.strengths.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li>We’ll highlight your strengths as you answer.</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-1 rounded-lg bg-white p-3 border border-slate-200">
                    <p className="text-xs font-semibold text-rose-700">
                      Areas to improve
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-slate-800">
                      {feedback.weaknesses.length ? (
                        feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)
                      ) : (
                        <li>We’ll call out concrete ways to improve.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {feedback.improvedAnswer && (
                  <div className="space-y-2 rounded-lg bg-white p-3 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-800">
                      Step-by-step sample answer
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                      {feedback.improvedAnswer}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  The goal of this prototype is to act like a{" "}
                  <span className="font-semibold text-slate-800">
                    real interviewer and coach
                  </span>{" "}
                  — giving you questions, scoring, and a better answer you can
                  learn from, then gently increasing difficulty with follow-up
                  questions.
                </p>
              </div>
            )}
          </section>
        )}

        {/* TAB: DASHBOARD */}
        {activeTab === "Dashboard" && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Progress tracking snapshot (mock)
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              This is a preview of how the full dashboard would help students
              monitor their growth over time.
            </p>
            <div className="mt-2 space-y-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
              <div className="flex items-center justify-between">
                <span>Average score this week</span>
                <span className="font-semibold text-blue-700">7.4 / 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Behavioral questions completed</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Top strength</span>
                <span className="font-semibold">Clear structure (STAR)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Main focus</span>
                <span className="font-semibold">Quantifying impact</span>
              </div>
            </div>
          </section>
        )}

        {/* TAB: HOW IT WORKS */}
        {activeTab === "How It Works" && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Why Avanti InterviewCoach AI?
            </h2>
            <div className="space-y-2 text-xs text-slate-700 sm:text-sm">
              <p className="font-semibold text-slate-900">Problem</p>
              <p>
                Students and recent grads often don’t know what questions
                companies actually ask. Career centers are overloaded, and
                YouTube videos give generic advice with no personalized
                feedback.
              </p>
              <p className="font-semibold text-slate-900">Solution</p>
              <p>
                Avanti lets students pick their{" "}
                <span className="font-medium text-blue-700">
                  company, major, and role
                </span>{" "}
                and instantly practice with realistic interview questions, live
                scoring, and coaching in a safe, low-pressure environment.
              </p>
            </div>
          </section>
        )}

        {/* TAB: EARLY ACCESS */}
        {activeTab === "Early Access" && (
          <section className="space-y-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Early-access pricing (concept)
            </h2>
            <p className="text-xs text-slate-700 sm:text-sm">
              We’re exploring a simple subscription for students plus campus
              licenses for universities.
            </p>
            <ul className="mt-2 space-y-2 text-xs text-slate-800">
              <li>• Student plan: affordable monthly access</li>
              <li>• Unlimited mock interviews & feedback</li>
              <li>• Role-specific question banks (engineering, finance, etc.)</li>
              <li>• Campus dashboard for career centers</li>
            </ul>

            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                console.log("Early access signup", {
                  name: formData.get("name"),
                  email: formData.get("email"),
                  goal: formData.get("goal"),
                });
                alert(
                  "Thanks! In a real deployment this would add you to an early-access waitlist."
                );
                e.currentTarget.reset();
              }}
            >
              <input
                name="name"
                placeholder="Name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
              <input
                name="goal"
                placeholder="What role are you preparing for?"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="submit"
                className="mt-1 w-full rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
              >
                Join early-access waitlist
              </button>
              <p className="text-[10px] text-slate-500">
                This is a prototype — the form logs to the console instead of
                sending real emails.
              </p>
            </form>
          </section>
        )}
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 pt-4 text-[11px] text-slate-500">
        <p>
          Avanti InterviewCoach AI · Interactive mock-interview prototype for
          college students and early-career job seekers.
        </p>
      </footer>
    </main>
  );
}
