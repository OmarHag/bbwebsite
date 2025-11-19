import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-8 py-4 flex items-center justify-between border-b border-white/10 bg-[#0A0F1F]">
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="h-8" />
        <span className="text-xl font-bold text-blue-300">
          Avanti InterviewCoach AI
        </span>
      </div>

      <div className="flex items-center gap-8 text-gray-300 font-medium">
        <Link href="/practice" className="hover:text-white">Practice</Link>
        <Link href="/voice" className="hover:text-white">Voice Interview</Link>
        <Link href="/pricing" className="hover:text-white">Pricing</Link>

        {/* NEW SIGNUP TAB */}
        <Link
          href="/signup"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
