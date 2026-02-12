"use client";

import { useMemo, useState } from "react";

const toNumber = (value: string) => Number.parseFloat(value) || 0;

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function Home() {
  const [emiLoanAmount, setEmiLoanAmount] = useState("500000");
  const [emiRate, setEmiRate] = useState("9");
  const [emiTenureYears, setEmiTenureYears] = useState("5");

  const [fdPrincipal, setFdPrincipal] = useState("100000");
  const [fdRate, setFdRate] = useState("7");
  const [fdTenureYears, setFdTenureYears] = useState("3");

  const [rdDeposit, setRdDeposit] = useState("5000");
  const [rdRate, setRdRate] = useState("6.5");
  const [rdTenureYears, setRdTenureYears] = useState("5");

  const [annualIncome, setAnnualIncome] = useState("1200000");
  const [deductions, setDeductions] = useState("150000");

  const emiResult = useMemo(() => {
    const principal = toNumber(emiLoanAmount);
    const annualRate = toNumber(emiRate);
    const months = toNumber(emiTenureYears) * 12;
    const monthlyRate = annualRate / 12 / 100;

    if (!principal || !months) {
      return { emi: 0, totalPayable: 0, totalInterest: 0 };
    }

    if (!monthlyRate) {
      const emi = principal / months;
      return { emi, totalPayable: principal, totalInterest: 0 };
    }

    const factor = (1 + monthlyRate) ** months;
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;

    return { emi, totalPayable, totalInterest };
  }, [emiLoanAmount, emiRate, emiTenureYears]);

  const fdResult = useMemo(() => {
    const principal = toNumber(fdPrincipal);
    const annualRate = toNumber(fdRate);
    const years = toNumber(fdTenureYears);

    if (!principal || !years) {
      return { maturityAmount: 0, interestEarned: 0 };
    }

    const maturityAmount = principal * (1 + annualRate / 100) ** years;
    const interestEarned = maturityAmount - principal;

    return { maturityAmount, interestEarned };
  }, [fdPrincipal, fdRate, fdTenureYears]);

  const rdResult = useMemo(() => {
    const monthlyDeposit = toNumber(rdDeposit);
    const annualRate = toNumber(rdRate);
    const months = toNumber(rdTenureYears) * 12;

    if (!monthlyDeposit || !months) {
      return { totalInvestment: 0, maturityValue: 0 };
    }

    const monthlyRate = annualRate / 12 / 100;
    const maturityValue =
      monthlyRate === 0
        ? monthlyDeposit * months
        : monthlyDeposit * (((1 + monthlyRate) ** months - 1) / monthlyRate);
    const totalInvestment = monthlyDeposit * months;

    return { totalInvestment, maturityValue };
  }, [rdDeposit, rdRate, rdTenureYears]);

  const taxResult = useMemo(() => {
    const income = toNumber(annualIncome);
    const deductionsValue = toNumber(deductions);
    const taxableWithoutDeductions = Math.max(income, 0);
    const taxableWithDeductions = Math.max(income - deductionsValue, 0);

    const calcTax = (taxableIncome: number) => {
      if (taxableIncome <= 300000) {
        return 0;
      }
      if (taxableIncome <= 700000) {
        return (taxableIncome - 300000) * 0.05;
      }
      if (taxableIncome <= 1000000) {
        return 20000 + (taxableIncome - 700000) * 0.1;
      }
      if (taxableIncome <= 1200000) {
        return 50000 + (taxableIncome - 1000000) * 0.15;
      }
      if (taxableIncome <= 1500000) {
        return 80000 + (taxableIncome - 1200000) * 0.2;
      }
      return 140000 + (taxableIncome - 1500000) * 0.3;
    };

    const taxBefore = calcTax(taxableWithoutDeductions);
    const taxAfter = calcTax(taxableWithDeductions);
    const taxSaved = Math.max(taxBefore - taxAfter, 0);

    return { estimatedTaxPayable: taxAfter, taxSaved };
  }, [annualIncome, deductions]);

  const inputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none";

  return (
    <section className="mx-auto my-12 max-w-6xl px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">🇮🇳 Nation Builder Badge</h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
          A civic recognition for Indian taxpayers who contribute to building the nation.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <a href="/signup" className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg">
            Get Started
          </a>
          <a href="/login?next=%2Fverify" className="px-6 py-3 border border-slate-700 rounded-lg">
            Verify Badge
          </a>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-yellow-500/50 bg-slate-950 p-6">
          <h2 className="text-2xl font-semibold">EMI Calculator</h2>
          <p className="mt-1 text-yellow-300 font-medium">Plan before you borrow.</p>
          <p className="mt-1 text-sm text-slate-400">Top priority: understand your monthly commitment before taking a loan.</p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm">Loan Amount
              <input className={inputClasses} value={emiLoanAmount} onChange={(e) => setEmiLoanAmount(e.target.value)} type="number" min="0" />
            </label>
            <label className="block text-sm">Interest Rate (%)
              <input className={inputClasses} value={emiRate} onChange={(e) => setEmiRate(e.target.value)} type="number" min="0" step="0.01" />
            </label>
            <label className="block text-sm">Tenure (Years)
              <input className={inputClasses} value={emiTenureYears} onChange={(e) => setEmiTenureYears(e.target.value)} type="number" min="0" step="0.1" />
            </label>
          </div>

          <div className="mt-5 rounded-xl bg-slate-900 p-4 text-sm space-y-1">
            <p>EMI: <span className="font-semibold">{formatINR(emiResult.emi)}</span></p>
            <p>Total Interest: <span className="font-semibold">{formatINR(emiResult.totalInterest)}</span></p>
            <p>Total Payable: <span className="font-semibold">{formatINR(emiResult.totalPayable)}</span></p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-2xl font-semibold">💰 FD Calculator</h2>
          <p className="mt-1 text-sm text-slate-400">For conservative planners who prefer trusted and stable growth.</p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm">Principal
              <input className={inputClasses} value={fdPrincipal} onChange={(e) => setFdPrincipal(e.target.value)} type="number" min="0" />
            </label>
            <label className="block text-sm">Interest Rate (%)
              <input className={inputClasses} value={fdRate} onChange={(e) => setFdRate(e.target.value)} type="number" min="0" step="0.01" />
            </label>
            <label className="block text-sm">Tenure (Years)
              <input className={inputClasses} value={fdTenureYears} onChange={(e) => setFdTenureYears(e.target.value)} type="number" min="0" step="0.1" />
            </label>
          </div>

          <div className="mt-5 rounded-xl bg-slate-900 p-4 text-sm space-y-1">
            <p>Maturity Amount: <span className="font-semibold">{formatINR(fdResult.maturityAmount)}</span></p>
            <p>Interest Earned: <span className="font-semibold">{formatINR(fdResult.interestEarned)}</span></p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-2xl font-semibold">📆 RD Calculator</h2>
          <p className="mt-1 text-sm text-slate-400">Designed for salaried users building a monthly savings habit.</p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm">Monthly Deposit
              <input className={inputClasses} value={rdDeposit} onChange={(e) => setRdDeposit(e.target.value)} type="number" min="0" />
            </label>
            <label className="block text-sm">Interest Rate (%)
              <input className={inputClasses} value={rdRate} onChange={(e) => setRdRate(e.target.value)} type="number" min="0" step="0.01" />
            </label>
            <label className="block text-sm">Tenure (Years)
              <input className={inputClasses} value={rdTenureYears} onChange={(e) => setRdTenureYears(e.target.value)} type="number" min="0" step="0.1" />
            </label>
          </div>

          <div className="mt-5 rounded-xl bg-slate-900 p-4 text-sm space-y-1">
            <p>Total Investment: <span className="font-semibold">{formatINR(rdResult.totalInvestment)}</span></p>
            <p>Maturity Value: <span className="font-semibold">{formatINR(rdResult.maturityValue)}</span></p>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-500/50 bg-slate-950 p-6">
          <h2 className="text-2xl font-semibold">🔥 Tax Saver Calculator</h2>
          <p className="mt-1 text-sm text-slate-400">Strong match for your badge mission—help users see immediate savings.</p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm">Annual Income
              <input className={inputClasses} value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} type="number" min="0" />
            </label>
            <label className="block text-sm">Deductions (80C, 80D, etc.)
              <input className={inputClasses} value={deductions} onChange={(e) => setDeductions(e.target.value)} type="number" min="0" />
            </label>
          </div>

          <div className="mt-5 rounded-xl bg-slate-900 p-4 text-sm space-y-1">
            <p>Estimated Tax Payable: <span className="font-semibold">{formatINR(taxResult.estimatedTaxPayable)}</span></p>
            <p>Tax Saved: <span className="font-semibold">{formatINR(taxResult.taxSaved)}</span></p>
          </div>

          <a href="/signup" className="mt-5 inline-block rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black">
            Already paid your taxes? Claim your Nation Builder Badge.
          </a>
        </article>
      </div>
    </section>
  );
}
