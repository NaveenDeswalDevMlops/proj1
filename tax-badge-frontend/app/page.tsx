export default function Home() {
  return (
    <section className="text-center mt-20">
      <h1 className="text-5xl font-bold mb-6">🇮🇳 Nation Builder Badge</h1>
      <p className="text-slate-400 text-xl max-w-2xl mx-auto">
        A civic recognition for Indian taxpayers who contribute
        to building the nation.
      </p>

      <div className="mt-10 flex justify-center gap-6">
        <a href="/signup" className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg">
          Get Started
        </a>
        <a href="/login?next=%2Fverify" className="px-6 py-3 border border-slate-700 rounded-lg">
          Verify Badge
        </a>
      </div>
    </section>
  );
}
