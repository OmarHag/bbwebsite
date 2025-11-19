"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Target, Brain, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import LogoIntro from "../components/LogoIntro";
import CompanyTicker from "../components/CompanyTicker";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== "undefined" && !sessionStorage.getItem("hasSeenIntro")
  );
  const [contentReady, setContentReady] = useState(() => !showIntro);

  const handleIntroComplete = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hasSeenIntro", "true");
    }
    setContentReady(true);
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <LogoIntro onComplete={handleIntroComplete} />}

      {contentReady && (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          {/* HERO */}
          <section className="pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                {/* BADGE */}
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 rounded-full bg-teal-500/20 text-teal-300 text-sm font-medium border border-teal-500/30">
                    🚀 AI-Powered Voice Interview Training
                  </span>
                </div>

                {/* TITLE */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Master Your Interviews With
                  <br />
                  <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                    A Realistic Voice AI Coach
                  </span>
                </h1>

                {/* SUBTEXT */}
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Practice real interviews by speaking naturally to an AI hiring
                  manager. Get realistic follow-up questions, instant feedback,
                  and confidence scoring—perfect for tech, finance, retail, and
                  more.
                </p>

                {/* CTA BUTTONS */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                  <Link
                    href="/voice"
                    className="inline-flex h-12 items-center rounded-full bg-teal-600 px-8 text-base md:text-lg font-semibold text-white hover:bg-teal-700 transition"
                  >
                    Try Voice Interview
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>

                  <Link
                    href="/pricing"
                    className="inline-flex h-12 items-center rounded-full bg-slate-800/80 border border-slate-700 px-8 text-base md:text-lg font-semibold text-white hover:bg-slate-700 transition"
                  >
                    View Pricing
                  </Link>
                </div>
              </motion.div>

              {/* COMPANY TICKER */}
              <CompanyTicker />
            </div>
          </section>

          {/* FEATURE GRID */}
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Everything You Need to Ace Your Interview
                </h2>
                <p className="text-lg md:text-xl text-slate-400">
                  Designed for students, interns, and early-career professionals.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Target,
                    title: "Company-Specific Questions",
                    description:
                      "Practice with questions tailored to your target company and role.",
                  },
                  {
                    icon: Brain,
                    title: "AI Interview Coach",
                    description:
                      "Interactive AI that guides you step-by-step and explains concepts.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Personalized Feedback",
                    description:
                      "Get scored with detailed strengths and areas to improve.",
                  },
                  {
                    icon: Users,
                    title: "All Industries",
                    description:
                      "Support for tech, finance, accounting, journalism, and more.",
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all"
                  >
                    <feature.icon className="w-10 h-10 text-teal-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA STRIP */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-10 md:p-12 text-center"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Land Your Next Offer?
                </h2>
                <p className="text-lg md:text-xl text-teal-100 mb-8">
                  Start practicing with realistic voice interviews. No credit
                  card required to get started.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center rounded-full bg-white px-10 text-lg font-semibold text-teal-700 hover:bg-slate-100 transition"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-10 px-6 border-t border-white/10">
            <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
              © {new Date().getFullYear()} Avanti AI Career Coach. All rights
              reserved.
            </div>
          </footer>
        </main>
      )}
    </>
  );
}
