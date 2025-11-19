export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1F] text-white flex justify-center px-6 py-20">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Pricing</h1>
        <p className="text-gray-400 text-lg mb-12">
          Avanti InterviewCoach AI is currently free while in early development.
          Premium features will arrive soon.
        </p>

        <div className="bg-gray-800/60 p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Free Tier</h2>
          <p className="text-gray-300 mb-4">
            ✔ Unlimited voice interview practice <br />
            ✔ AI-powered coaching <br />
            ✔ Whisper speech-to-text <br />
            ✔ Fast responses powered by Groq LLMs <br />
          </p>
          <p className="text-blue-400 font-semibold">Price: $0 / month</p>
        </div>
      </div>
    </main>
  );
}
