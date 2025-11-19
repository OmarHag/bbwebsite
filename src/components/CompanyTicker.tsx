"use client";

import { motion } from "framer-motion";

const COMPANIES = [
  { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { name: "Meta", logo: "https://logo.clearbit.com/meta.com" },
  { name: "Apple", logo: "https://logo.clearbit.com/apple.com" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Netflix", logo: "https://logo.clearbit.com/netflix.com" },
  { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "NVIDIA", logo: "https://logo.clearbit.com/nvidia.com" },
  { name: "Tesla", logo: "https://logo.clearbit.com/tesla.com" },
  { name: "Uber", logo: "https://logo.clearbit.com/uber.com" },
  { name: "Stripe", logo: "https://logo.clearbit.com/stripe.com" },
  { name: "PayPal", logo: "https://logo.clearbit.com/paypal.com" },
  { name: "JPMorgan", logo: "https://logo.clearbit.com/jpmorgan.com" },
  { name: "Goldman Sachs", logo: "https://logo.clearbit.com/goldmansachs.com" },
  { name: "Morgan Stanley", logo: "https://logo.clearbit.com/morganstanley.com" },
  { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com" },
  { name: "Salesforce", logo: "https://logo.clearbit.com/salesforce.com" },
  { name: "Bloomberg", logo: "https://logo.clearbit.com/bloomberg.com" },
];

export default function CompanyTicker() {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border-y border-white/10 py-6 mt-4 rounded-2xl">
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          },
        }}
        className="flex gap-6 md:gap-12 items-center whitespace-nowrap"
      >
        {[...COMPANIES, ...COMPANIES, ...COMPANIES].map((company, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10"
          >
            <img
              src={company.logo}
              alt={company.name}
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-medium text-white/90">
              {company.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
