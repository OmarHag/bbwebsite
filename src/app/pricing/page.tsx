"use client";

import Link from "next/link";

type Plan = {
  title: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
};

const plans: Plan[] = [
  {
    title: "Free Trial",
    price: 0,
    period: "1 month",
    features: [
      "Limited practice sessions",
      "Access to 5 companies",
      "Basic AI feedback",
      "Technical & behavioral questions",
      "No credit card required",
    ],
    ctaText: "Start Free Trial",
  },
  {
    title: "Student Basic",
    price: 19.99,
    period: "month",
    features: [
      "Limited sessions per month",
      "Access to all companies",
      "All roles and domains",
      "Detailed AI feedback",
      "Score tracking",
      "Email support",
    ],
    ctaText: "Get Basic",
  },
  {
    title: "Student Pro",
    price: 49.99,
    period: "month",
    features: [
      "Unlimited practice sessions",
      "All companies & roles",
      "Advanced AI coaching",
      "Progress analytics",
      "Session history & review",
      "Priority support",
      "Custom question generation",
    ],
    highlighted: true,
    ctaText: "Get Pro",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* HERO */}
      <section className="pt-10 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Start with a free trial. Upgrade anytime for unlimited access and
            advanced features.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={`rounded-2xl border p-8 shadow-sm bg-white ${
                plan.highlighted
                  ? "border-teal-500 shadow-md scale-[1.02]"
                  : "border-slate-200"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
              <p className="mb-4 text-slate-500">
                {plan.price === 0 ? (
                  <>Free for {plan.period}</>
                ) : (
                  <>
                    <span className="text-4xl font-bold">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-base text-slate-500">
                      /{plan.period}
                    </span>
                  </>
                )}
              </p>

              <ul className="mb-6 space-y-2 text-sm text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* UNIVERSITY SECTION */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-10 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              University & B2B Licensing
            </h3>
            <p className="text-slate-200 mb-6 text-base md:text-lg">
              Interested in bringing Avanti to your campus or organization?
            </p>
            <button className="inline-flex h-11 items-center rounded-full bg-teal-600 px-8 text-sm font-semibold text-white hover:bg-teal-700 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 text-sm md:text-base">
            {[
              {
                q: "How does the free trial work?",
                a: "You get 1 month of limited access with no credit card required. Practice with a selection of companies and get basic AI feedback.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. No questions asked.",
              },
              {
                q: "What companies are included?",
                a: "We cover top companies across tech, finance, consulting, and more. New companies are added regularly.",
              },
              {
                q: "Do you offer student discounts?",
                a: "Our Student Basic and Pro plans are already discounted for students. Just verify your .edu email when signing up.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-slate-200 pb-4">
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                  {faq.q}
                </h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-slate-600 text-sm">
          © {new Date().getFullYear()} Avanti AI Career Coach. All rights
          reserved.
        </div>
      </footer>
    </main>
  );
}
