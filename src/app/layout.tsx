// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Avanti InterviewCoach AI",
  description: "Interactive AI mock interview system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900">
        {children}
      </body>
    </html>
  );
}
