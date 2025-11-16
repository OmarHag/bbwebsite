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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-8 md:px-6 lg:px-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            For students & first-time job seekers
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Avanti InterviewCoach <span className="text-emerald-400">AI</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            A mock-interview platform where the AI acts as your{" "}
            <span className="font-semibold text-emerald-300">
              interviewer and coach
            </span>
            . Get role-specific questions, instant scoring from 1–10, and
            step-by-step feedback that turns every answer into a learning
            moment.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-300 shadow-lg sm:text-sm">
          <p className="font-semibold text-slate-100">
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

      {/* MAIN GRID: INTERVIEW + SIDEBAR */}
      <section className="grid gap-6 lg:grid-cols-[1.7fr,1.1fr]">
        {/* LEFT: Interactive Interview */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
            Try the interactive mock interview
          </h2>
          <p className="text-xs text-slate-300 sm:text-sm">
            Choose a company, major, and role. The AI will ask a realistic
            interview question, analyze your answer, and coach you with detailed
            feedback.
          </p>

          {/* Controls */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Company</label>
              <select
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="text-xs text-slate-400">Major / Focus</label>
              <select
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="text-xs text-slate-400">Role</label>
              <select
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="text-xs text-slate-400">Difficulty</label>
              <select
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {currentQuestion ? "Start new interview" : "Start interview"}
            </button>
            <p className="text-xs text-slate-400">
              {currentQuestion
                ? `Round ${round + 1} • Answer and get coached in real time.`
                : "Click “Start interview” to get your first question."}
            </p>
          </div>

          {/* Question + Answer box */}
          <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Interview question
              </p>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                Mock interviewer · {company || "Company"}
              </span>
            </div>

            <p className="text-sm text-slate-100">
              {currentQuestion ? (
                currentQuestion
              ) : (
                <span className="text-slate-400">
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
                className="text-xs font-medium text-slate-300"
              >
                Your answer
              </label>
              <span className="text-[10px] text-slate-500">
                Use the STAR method if you can (Situation, Task, Action, Result)
              </span>
            </div>
            <textarea
              id="answer"
              rows={6}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Type your answer here. If you’re stuck, leave it blank and click “Get feedback” — the AI will walk you through a strong sample answer."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!currentQuestion || isLoading}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-950 shadow transition hover:bg-white disabled:opacity-60"
              >
                {answer.trim()
                  ? "Submit & get feedback"
                  : "Get help / sample answer"}
              </button>
              {isLoading && (
                <span className="text-xs text-slate-400">
                  Thinking like a mock interviewer…
                </span>
              )}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="mt-4 space-y-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Feedback on your last answer
                </p>
                {feedback.score !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-300">
                      Score: {feedback.score}/10
                    </span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-400"
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
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 rounded-lg bg-slate-900/80 p-3">
                  <p className="text-xs font-semibold text-emerald-300">
                    Strengths
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
                    {feedback.strengths.length ? (
                      feedback.strengths.map((s, i) => <li key={i}>{s}</li>)
                    ) : (
                      <li>We’ll highlight your strengths as you answer.</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-1 rounded-lg bg-slate-900/80 p-3">
                  <p className="text-xs font-semibold text-rose-300">
                    Areas to improve
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
                    {feedback.weaknesses.length ? (
                      feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)
                    ) : (
                      <li>We’ll call out concrete ways to improve.</li>
                    )}
                  </ul>
                </div>
              </div>

              {feedback.improvedAnswer && (
                <div className="space-y-2 rounded-lg bg-slate-900/80 p-3">
                  <p className="text-xs font-semibold text-slate-200">
                    Step-by-step sample answer
                  </p>
                  <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                    {feedback.improvedAnswer}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                The goal of this prototype is to act like a{" "}
                <span className="font-semibold text-slate-300">
                  real interviewer and coach
                </span>
                — giving you questions, scoring, and a better answer you can
                learn from, then gently increasing difficulty with follow-up
                questions.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Product Story / Value sections */}
        <aside className="space-y-4">
          {/* Problem & Solution */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-50">
              Why Avanti InterviewCoach AI?
            </h2>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Problem</p>
              <p>
                Students and recent grads often don’t know what questions
                companies actually ask. Career centers are overloaded, and
                YouTube videos give generic advice with no personalized
                feedback.
              </p>
              <p className="font-semibold text-slate-100">Solution</p>
              <p>
                Avanti lets students pick their{" "}
                <span className="font-medium text-emerald-300">
                  company, major, and role
                </span>{" "}
                and instantly practice with realistic interview questions, live
                scoring, and coaching in a safe, low-pressure environment.
              </p>
            </div>
          </div>

          {/* Learning support / progress mock */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Progress tracking snapshot (mock)
            </h3>
            <p className="text-xs text-slate-300">
              The full product will include a dashboard where students can see
              trends over time.
            </p>
            <div className="mt-2 space-y-3 rounded-xl bg-slate-950/60 p-3 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span>Average score this week</span>
                <span className="font-semibold text-emerald-300">7.4 / 10</span>
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
          </div>

          {/* Pricing / Early access */}
          <div className="space-y-3 rounded-2xl border border-emerald-700/60 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Early-access pricing (concept)
            </h3>
            <p className="text-xs text-slate-300">
              We’re exploring a simple subscription for students plus campus
              licenses for universities.
            </p>
            <ul className="mt-2 space-y-2 text-xs text-slate-200">
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
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
              <input
                name="goal"
                placeholder="What role are you preparing for?"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
              <button
                type="submit"
                className="mt-1 w-full rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow hover:bg-emerald-400"
              >
                Join early-access waitlist
              </button>
              <p className="text-[10px] text-slate-500">
                This is a prototype — the form logs to the console instead of
                sending real emails.
              </p>
            </form>
          </div>
        </aside>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 pt-4 text-[11px] text-slate-500">
        <p>
          Avanti InterviewCoach AI · Interactive mock-interview prototype for
          college students and early-career job seekers.
        </p>
      </footer>
    </main>
  );
}
