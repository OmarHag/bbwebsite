import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Avanti InterviewCoach AI",
  description: "AI-powered interview coach with realistic voice practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        {/* TOP NAVBAR */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
            {/* LOGO + BRAND */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="relative h-10 w-28 md:h-12 md:w-32">
                <Image
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691ce79519a4c03a38244c47/bc8be9f3d_Screenshot2025-11-18141322.png"
                  alt="Avanti Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="hidden text-xl font-bold text-white md:inline">
                Avanti InterviewCoach AI
              </span>
            </Link>

            {/* NAV LINKS */}
            <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium">
              <Link
                href="/practice"
                className="text-slate-200 hover:text-teal-400 transition-colors"
              >
                Practice
              </Link>
              <Link
                href="/voice"
                className="text-slate-200 hover:text-teal-400 transition-colors"
              >
                Voice Interview
              </Link>
              <Link
                href="/pricing"
                className="text-slate-200 hover:text-teal-400 transition-colors"
              >
                Pricing
              </Link>

              {/* SIGN UP BUTTON */}
              <Link
                href="/signup"
                className="ml-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Sign Up Free
              </Link>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT - add top padding to clear fixed header */}
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}
