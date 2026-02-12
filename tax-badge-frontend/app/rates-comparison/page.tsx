const bankRates = [
  { bank: "State Bank of India", fdRate: "6.80%", rdRate: "6.50%" },
  { bank: "HDFC Bank", fdRate: "7.00%", rdRate: "6.80%" },
  { bank: "ICICI Bank", fdRate: "6.90%", rdRate: "6.70%" },
  { bank: "Axis Bank", fdRate: "7.10%", rdRate: "6.85%" },
  { bank: "Kotak Mahindra Bank", fdRate: "7.20%", rdRate: "6.90%" },
  { bank: "Punjab National Bank", fdRate: "6.75%", rdRate: "6.40%" },
];

export default function RatesComparisonPage() {
  return (
    <section className="mx-auto my-12 max-w-5xl px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">FD & RD Rates Comparison</h1>
        <p className="mt-3 text-sm text-slate-400">Rates indicative – updated monthly</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Bank</th>
              <th className="px-4 py-3 font-semibold">FD Rate (1Y)</th>
              <th className="px-4 py-3 font-semibold">RD Rate (1Y)</th>
            </tr>
          </thead>
          <tbody>
            {bankRates.map((entry) => (
              <tr key={entry.bank} className="border-t border-slate-800 text-slate-200">
                <td className="px-4 py-3">{entry.bank}</td>
                <td className="px-4 py-3">{entry.fdRate}</td>
                <td className="px-4 py-3">{entry.rdRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4 text-center text-yellow-100">
        Responsible savers build a stronger nation.
      </div>
    </section>
  );
}
