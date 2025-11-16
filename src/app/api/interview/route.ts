// src/app/api/interview/route.ts
import { NextRequest, NextResponse } from "next/server";

type Difficulty = "Easy" | "Medium" | "Hard";

type InterviewBody = {
  company: string;
  major: string;
  role: string;
  difficulty: Difficulty;
  previousQuestion?: string | null;
  answer?: string;
};

const questionBank: Record<string, { easy: string[]; medium: string[]; hard: string[] }> =
  {
    "Software Engineering Intern": {
      easy: [
        "Tell me about a software project you worked on recently. What was your role and what technologies did you use?",
        "Describe a time you had to debug a difficult issue in your code. How did you find the root cause?",
      ],
      medium: [
        "Walk me through a time you had to quickly learn a new technology or framework for a project. How did you approach it?",
        "Tell me about a time you disagreed with a teammate on a technical decision. What happened and what was the outcome?",
      ],
      hard: [
        "Describe the most complex system you have worked on. How did you think about trade-offs like performance, readability, and scalability?",
        "Tell me about a time you owned a project end-to-end. How did you handle requirements, design, implementation, and testing?",
      ],
    },
    "Data Analyst Intern": {
      easy: [
        "Tell me about a time you used data to answer a simple question or support a decision.",
        "Describe a project where you cleaned or organized messy data. What tools did you use?",
      ],
      medium: [
        "Walk me through an analysis you did from start to finish: what was the question, what data did you use, and what did you find?",
        "Describe a time you had to explain a data insight to a non-technical audience.",
      ],
      hard: [
        "Tell me about a time your analysis challenged a stakeholder’s assumptions. How did you present your findings?",
        "Describe a situation where the data was incomplete or noisy. How did you still move the project forward?",
      ],
    },
    "Product Management Intern": {
      easy: [
        "Tell me about a time you worked on a project that involved many different people. What was your role?",
        "Describe a product you really like. Why do you think it works well for its users?",
      ],
      medium: [
        "Tell me about a time you had to prioritize between multiple tasks or features. How did you decide what came first?",
        "Describe a situation where you had to balance user needs with technical constraints.",
      ],
      hard: [
        "Walk me through how you would improve the onboarding experience for a mobile app used by students.",
        "Tell me about a time you had to say no to a feature or idea. How did you communicate that decision?",
      ],
    },
    "Finance Intern": {
      easy: [
        "Tell me about a time you worked with numbers or budgets in a class or project.",
        "Describe a situation where you had to be very detail-oriented. What did you do?",
      ],
      medium: [
        "Walk me through a time you analyzed financial or numerical data. What tools did you use and what did you conclude?",
        "Describe a time you identified a mistake in numbers or calculations. How did you handle it?",
      ],
      hard: [
        "Tell me about a time you had to explain a financial concept to someone with little background in finance.",
        "Describe a situation where you had to weigh risk versus reward when making a recommendation.",
      ],
    },
    "Marketing Intern": {
      easy: [
        "Tell me about a time you helped promote an event, club, or project.",
        "Describe a brand you think markets well to students. What do they do right?",
      ],
      medium: [
        "Walk me through a marketing project or campaign you worked on. What was the goal and what did you do?",
        "Tell me about a time you used social media or content to reach a specific audience.",
      ],
      hard: [
        "Describe a time a campaign did not perform as expected. What did you learn and what would you change?",
        "Tell me how you would launch a simple campaign to reach first-year university students.",
      ],
    },
    "Cybersecurity Analyst Intern": {
      easy: [
        "Tell me about a time you helped someone stay safe online or protect their account.",
        "Describe a security topic or vulnerability you learned about that interested you.",
      ],
      medium: [
        "Walk me through a time you investigated a security issue or suspicious activity, even if it was in a lab or class project.",
        "Describe how you stay up to date with security best practices or news.",
      ],
      hard: [
        "Tell me about a time you had to balance usability with security. What trade-offs did you consider?",
        "Imagine a student’s account was compromised. Walk me through how you would investigate and respond.",
      ],
    },
    "General Behavioral Interview": {
      easy: [
        "Tell me about yourself and why you’re interested in this role.",
        "Describe a time you worked on a team to accomplish something.",
      ],
      medium: [
        "Tell me about a time you faced a setback or failure. What happened and what did you learn?",
        "Describe a situation where you had to manage multiple priorities or deadlines.",
      ],
      hard: [
        "Tell me about a time you had a conflict with a teammate. How did you handle it?",
        "Describe the most challenging project you’ve worked on. What made it challenging?",
      ],
    },
  };

function pickQuestion(role: string, difficulty: Difficulty, exclude?: string | null) {
  const bank = questionBank[role] ?? questionBank["General Behavioral Interview"];
  const level =
    difficulty === "Easy"
      ? bank.easy
      : difficulty === "Hard"
      ? bank.hard
      : bank.medium;

  if (!level.length) return "Tell me about a time you solved a difficult problem.";

  const options = level.filter((q) => q !== exclude);
  const arr = options.length ? options : level;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

function analyzeAnswer(answer: string | undefined, role: string, difficulty: Difficulty) {
  if (!answer || !answer.trim()) {
    const sample =
      "Here’s a strong way to approach this kind of question using the STAR method:\n\n" +
      "1. Situation – Briefly set the context: where were you, what was the problem?\n" +
      "2. Task – What were you responsible for?\n" +
      "3. Action – What specific steps did you take? Focus on your decisions.\n" +
      "4. Result – What happened in the end? Add numbers or impact if you can.\n\n" +
      "Even if you don’t have a perfect story yet, pick a class project, club, or part-time job and walk through it step by step.";

    return {
      score: null,
      strengths: [
        "You asked for help instead of guessing, which is how improvement starts.",
      ],
      weaknesses: [
        "You didn’t provide an answer yet. Next time, try drafting even a rough story so the coach can give more targeted feedback.",
      ],
      improvedAnswer: sample,
    };
  }

  const text = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).length;

  // Very simple heuristic scoring for the prototype
  let score = Math.min(10, Math.max(3, Math.round(words / 12)));
  if (text.includes("situation") && text.includes("task") && text.includes("action") && text.includes("result")) {
    score = Math.min(10, score + 2);
  } else if (text.includes("star")) {
    score = Math.min(10, score + 1);
  }
  if (text.includes("because") || text.includes("so that")) {
    score = Math.min(10, score + 1);
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (words > 80) {
    strengths.push("You provided enough detail for the interviewer to understand the full story.");
  } else {
    weaknesses.push("Your answer is on the shorter side. Add more context and detail to make it memorable.");
  }

  if (text.includes("i led") || text.includes("i owned") || text.includes("i was responsible")) {
    strengths.push("You clearly highlighted your ownership and responsibilities.");
  } else {
    weaknesses.push("Make sure to emphasize what *you* personally did, not just what the team did.");
  }

  if (text.includes("%") || text.match(/\b\d+/)) {
    strengths.push("You quantified impact with numbers, which makes your story more persuasive.");
  } else {
    weaknesses.push(
      "Try to include numbers or concrete outcomes (e.g., time saved, users impacted, grade improved)."
    );
  }

  if (!text.includes("result")) {
    weaknesses.push(
      "Close with a clear result: what changed or improved because of your actions?"
    );
  }

  if (!strengths.length) {
    strengths.push("You provided a clear, understandable answer that the interviewer can follow.");
  }

  const roleLabel = role || "this role";

  const improvedAnswer =
    "Here’s a polished structure you could use next time:\n\n" +
    "• Situation – Briefly set the scene in one or two sentences.\n" +
    "• Task – Explain what you were responsible for.\n" +
    "• Action – Describe 2–3 specific things you did, focusing on decisions and problem-solving.\n" +
    "• Result – End with a concrete outcome and what you learned.\n\n" +
    "Example opening you might adapt for " +
    roleLabel +
    ":\n" +
    "“In my second-year project, our team was building a feature for X. We were struggling with Y, and as the person responsible for Z, I decided to…”.\n\n" +
    "From there, walk step-by-step through your actions and finish with a clear, quantified result.";

  return { score, strengths, weaknesses, improvedAnswer };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InterviewBody;

  const { company, major, role, difficulty, previousQuestion, answer } = body;

  const diff =
    difficulty === "Easy" || difficulty === "Hard" ? difficulty : "Medium";

  // If there is no current question, we’re starting a new interview
  if (!previousQuestion) {
    const question = pickQuestion(role, diff, null);
    return NextResponse.json({ question });
  }

  // We’re evaluating an answer to the previous question
  const analysis = analyzeAnswer(answer, role, diff);
  const nextQuestion = pickQuestion(role, diff, previousQuestion);

  return NextResponse.json({
    question: previousQuestion,
    nextQuestion,
    ...analysis,
    meta: {
      company,
      major,
      role,
      difficulty: diff,
    },
  });
}
