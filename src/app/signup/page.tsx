export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-md bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Create your Avanti account</h1>
        <p className="text-sm text-slate-300 mb-6">
          Start a free trial and practice mock interviews with Voice AI.
        </p>

        <form className="space-y-4">
          <div>
            <label className="text-sm text-slate-200 mb-1 block">
              Email address
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label className="text-sm text-slate-200 mb-1 block">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
          >
            Sign Up Free
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
