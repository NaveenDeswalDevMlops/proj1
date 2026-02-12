const insights = [
  {
    title: "Safe EMI Rule",
    tip: "EMI should not exceed 35–40% of income",
  },
  {
    title: "FD vs RD Tip",
    tip: "RD suits monthly savers, FD suits lump sum",
  },
  {
    title: "Tax Saving Reminder",
    tip: "80C limit ₹1.5L",
  },
];

export default function QuickInsights() {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Quick Insights</h2>
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
          Smart Saver Notes
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((insight) => (
          <article
            key={insight.title}
            className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4"
          >
            <h3 className="text-lg font-semibold text-cyan-100">{insight.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{insight.tip}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
