// src/app/layout.tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Avanti InterviewCoach AI",
  description: "Interactive AI mock interview system with voice AI interviewer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0A0F1F] text-white">
        {/* HEADER */}
        <header className="w-full border-b border-white/10 bg-[#0D1224]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Avanti Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
              <span className="text-2xl font-semibold text-blue-400">
                Avanti InterviewCoach AI
              </span>
            </Link>

            {/* NAVIGATION */}
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/practice" className="hover:text-blue-400">
                Practice
              </Link>
              <Link href="/voice" className="hover:text-blue-400">
                Voice Interview
              </Link>
              <Link href="/pricing" className="hover:text-blue-400">
                Pricing
              </Link>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div>{children}</div>
      </body>
    </html>
  );
}
