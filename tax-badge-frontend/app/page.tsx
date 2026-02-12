"use client";

import { useEffect, useMemo, useState } from "react";
import BankComparison from "@/components/BankComparison";
import Disclaimer from "@/components/Disclaimer";
import LoanComparison from "@/components/LoanComparison";
import QuickInsights from "@/components/QuickInsights";

const toNumber = (value: string) => Number.parseFloat(value) || 0;

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const calculateIndicativeNewRegimeTax = (taxableIncome: number) => {
  if (taxableIncome <= 300000) return 0;
  if (taxableIncome <= 700000) return (taxableIncome - 300000) * 0.05;
  if (taxableIncome <= 1000000) return 20000 + (taxableIncome - 700000) * 0.1;
  if (taxableIncome <= 1200000) return 50000 + (taxableIncome - 1000000) * 0.15;
  if (taxableIncome <= 1500000) return 80000 + (taxableIncome - 1200000) * 0.2;
  return 140000 + (taxableIncome - 1500000) * 0.3;
};

const calculateIndicativeOldRegimeTax = (taxableIncome: number, ageGroup: "below60" | "60to80" | "above80") => {
  const exemption = ageGroup === "above80" ? 500000 : ageGroup === "60to80" ? 300000 : 250000;
  const adjusted = Math.max(taxableIncome - exemption, 0);

  if (adjusted <= 250000) return adjusted * 0.05;
  if (adjusted <= 750000) return 12500 + (adjusted - 250000) * 0.2;
  return 112500 + (adjusted - 750000) * 0.3;
};

export default function Home() {
  const [hasToken, setHasToken] = useState(false);

  const [emiLoanAmount, setEmiLoanAmount] = useState("500000");
  const [emiRate, setEmiRate] = useState("9");
  const [emiTenureYears, setEmiTenureYears] = useState("5");
  const [emiAnnualIncome, setEmiAnnualIncome] = useState("1200000");
  const [emiAnnualSpending, setEmiAnnualSpending] = useState("720000");

  const [fdPrincipal, setFdPrincipal] = useState("100000");
  const [fdRate, setFdRate] = useState("7");
  const [fdTenureYears, setFdTenureYears] = useState("3");

  const [rdDeposit, setRdDeposit] = useState("5000");
  const [rdRate, setRdRate] = useState("6.5");
  const [rdTenureYears, setRdTenureYears] = useState("5");

  const [annualIncome, setAnnualIncome] = useState("1200000");
  const [deductions, setDeductions] = useState("150000");

  const [showEmiComparison, setShowEmiComparison] = useState(false);
  const [showFdComparison, setShowFdComparison] = useState(false);
  const [showRdComparison, setShowRdComparison] = useState(false);

  const [showAccuracyDetails, setShowAccuracyDetails] = useState(false);
  const [ageGroup, setAgeGroup] = useState<"below60" | "60to80" | "above80">("below60");
  const [selectedRegime, setSelectedRegime] = useState<"new" | "old" | "compare">("new");
  const [healthInsurance80D, setHealthInsurance80D] = useState("0");

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("token")));
  }, []);

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

  const awarenessResult = useMemo(() => {
    const income = toNumber(emiAnnualIncome);
    const spending = toNumber(emiAnnualSpending);
    const principal = toNumber(emiLoanAmount);
    const years = toNumber(emiTenureYears);

    const annualSavings = Math.max(income - spending, 0);
    const savingsRate = income > 0 ? annualSavings / income : 0;
    const emiBurdenRatio = income > 0 ? (emiResult.emi * 12) / income : 1;
    const loanToIncome = income > 0 ? principal / income : 1;

    let score = 100;

    score -= Math.min(45, emiBurdenRatio * 80);
    score -= Math.min(25, Math.max(0, loanToIncome - 0.4) * 35);
    score -= years > 7 ? 15 : years > 5 ? 8 : 0;
    score += Math.min(20, savingsRate * 40);

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    const band = finalScore >= 75 ? "Strong" : finalScore >= 55 ? "Moderate" : "Needs Attention";

    return {
      annualSavings,
      savingsRate,
      emiBurdenRatio,
      score: finalScore,
      band,
    };
  }, [emiAnnualIncome, emiAnnualSpending, emiLoanAmount, emiTenureYears, emiResult.emi]);

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
    const healthInsurance = showAccuracyDetails ? toNumber(healthInsurance80D) : 0;

    const taxableWithoutDeductions = Math.max(income, 0);
    const taxableForOld = Math.max(income - deductionsValue - healthInsurance, 0);
    const taxableForNew = Math.max(income - deductionsValue, 0);

    const oldRegimeTax = calculateIndicativeOldRegimeTax(taxableForOld, ageGroup);
    const newRegimeTax = calculateIndicativeNewRegimeTax(taxableForNew);

    let estimatedTaxPayable = newRegimeTax;

    if (showAccuracyDetails) {
      if (selectedRegime === "old") {
        estimatedTaxPayable = oldRegimeTax;
      } else if (selectedRegime === "compare") {
        estimatedTaxPayable = Math.min(oldRegimeTax, newRegimeTax);
      }
    }

    const taxBefore = calculateIndicativeNewRegimeTax(taxableWithoutDeductions);
    const taxSaved = Math.max(taxBefore - estimatedTaxPayable, 0);

    return {
      estimatedTaxPayable,
      taxSaved,
      oldRegimeTax,
      newRegimeTax,
      postTaxAnnualIncome: Math.max(income - estimatedTaxPayable, 0),
      monthlyTaxBurden: estimatedTaxPayable / 12,
      effectiveTaxRate: income > 0 ? (estimatedTaxPayable / income) * 100 : 0,
      selectedRegimeLabel: showAccuracyDetails ? selectedRegime : "new",
    };
  }, [annualIncome, deductions, showAccuracyDetails, healthInsurance80D, ageGroup, selectedRegime]);

  const inputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none";

  return (
    <section className="mx-auto my-12 max-w-6xl px-4">
      <div className="text-center">
        <h1 className="mb-6 text-5xl font-bold">🇮🇳 Nation Builder Badge</h1>
        <p className="mx-auto max-w-2xl text-xl text-slate-400">
          A civic recognition for Indian taxpayers who contribute to building the nation.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <a href="/signup" className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black">
            Get Started
          </a>
          <a href="/login?next=%2Fverify" className="rounded-lg border border-slate-700 px-6 py-3">
            Verify Badge
          </a>
        </div>
      </div>

      <div className="mt-14 grid gap-6">
        <article className="rounded-2xl border border-yellow-500/50 bg-slate-950 p-6">
          <div className={`grid gap-5 ${showEmiComparison ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start" : ""}`}>
            <div>
              <h2 className="text-2xl font-semibold">EMI Calculator</h2>
              <p className="mt-1 font-medium text-yellow-300">Plan before you borrow.</p>
              <p className="mt-1 text-sm text-slate-400">Top priority: understand your monthly commitment before taking a loan.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">Loan Amount
                  <input className={inputClasses} value={emiLoanAmount} onChange={(e) => setEmiLoanAmount(e.target.value)} type="number" min="0" />
                </label>
                <label className="block text-sm">Interest Rate (%)
                  <input className={inputClasses} value={emiRate} onChange={(e) => setEmiRate(e.target.value)} type="number" min="0" step="0.01" />
                </label>
                <label className="block text-sm">Tenure (Years)
                  <input className={inputClasses} value={emiTenureYears} onChange={(e) => setEmiTenureYears(e.target.value)} type="number" min="0" step="0.1" />
                </label>
                <label className="block text-sm">Annual Income
                  <input className={inputClasses} value={emiAnnualIncome} onChange={(e) => setEmiAnnualIncome(e.target.value)} type="number" min="0" />
                </label>
                <label className="block text-sm">Annual Spending
                  <input className={inputClasses} value={emiAnnualSpending} onChange={(e) => setEmiAnnualSpending(e.target.value)} type="number" min="0" />
                </label>
              </div>

              <div className="mt-5 space-y-1 rounded-xl bg-slate-900 p-4 text-sm">
                <p>EMI: <span className="font-semibold">{formatINR(emiResult.emi)}</span></p>
                <p>Total Interest: <span className="font-semibold">{formatINR(emiResult.totalInterest)}</span></p>
                <p>Total Payable: <span className="font-semibold">{formatINR(emiResult.totalPayable)}</span></p>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                <p className="font-semibold">Financial Awareness Score: {awarenessResult.score}/100 ({awarenessResult.band})</p>
                <p className="mt-1 text-cyan-100/90">Savings: {formatINR(awarenessResult.annualSavings)} · Savings Rate: {(awarenessResult.savingsRate * 100).toFixed(1)}%</p>
                <p className="mt-1 text-cyan-100/90">EMI to Income Burden: {(awarenessResult.emiBurdenRatio * 100).toFixed(1)}%</p>
              </div>

              <button
                type="button"
                onClick={() => setShowEmiComparison((prev) => !prev)}
                className="mt-4 rounded-lg border border-yellow-400/70 px-3 py-2 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/10"
              >
                Compare Across Banks
              </button>
            </div>

            {showEmiComparison && (
              <LoanComparison loanAmount={toNumber(emiLoanAmount)} tenureYears={toNumber(emiTenureYears)} className="mt-0" />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className={`grid gap-5 ${showFdComparison ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start" : ""}`}>
            <div>
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

              <div className="mt-5 space-y-1 rounded-xl bg-slate-900 p-4 text-sm">
                <p>Maturity Amount: <span className="font-semibold">{formatINR(fdResult.maturityAmount)}</span></p>
                <p>Interest Earned: <span className="font-semibold">{formatINR(fdResult.interestEarned)}</span></p>
              </div>

              <button
                type="button"
                onClick={() => setShowFdComparison((prev) => !prev)}
                className="mt-4 rounded-lg border border-yellow-400/70 px-3 py-2 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/10"
              >
                Compare Across Banks
              </button>
            </div>

            {showFdComparison && (
              <BankComparison productType="FD" amount={toNumber(fdPrincipal)} tenureYears={toNumber(fdTenureYears)} className="mt-0" />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className={`grid gap-5 ${showRdComparison ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start" : ""}`}>
            <div>
              <h2 className="text-2xl font-semibold"> RD Calculator</h2>
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

              <div className="mt-5 space-y-1 rounded-xl bg-slate-900 p-4 text-sm">
                <p>Total Investment: <span className="font-semibold">{formatINR(rdResult.totalInvestment)}</span></p>
                <p>Maturity Value: <span className="font-semibold">{formatINR(rdResult.maturityValue)}</span></p>
              </div>

              <button
                type="button"
                onClick={() => setShowRdComparison((prev) => !prev)}
                className="mt-4 rounded-lg border border-yellow-400/70 px-3 py-2 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/10"
              >
                Compare Across Banks
              </button>
            </div>

            {showRdComparison && (
              <BankComparison productType="RD" amount={toNumber(rdDeposit)} tenureYears={toNumber(rdTenureYears)} className="mt-0" />
            )}
          </div>
        </article>

        <div className="rounded-2xl border border-emerald-500/50 bg-slate-950 p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
            <article>
              <h2 className="text-2xl font-semibold"> Tax Saver Calculator</h2>
              <p className="mt-1 text-sm text-slate-400">Strong match for your badge mission—help users see immediate savings.</p>

              <div className="mt-4 space-y-3">
                <label className="block text-sm">Annual Income
                  <input className={inputClasses} value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} type="number" min="0" />
                </label>
                <label className="block text-sm">Deductions (80C, 80D, etc.)
                  <input className={inputClasses} value={deductions} onChange={(e) => setDeductions(e.target.value)} type="number" min="0" />
                </label>
              </div>

              <div className="mt-5 space-y-1 rounded-xl bg-slate-900 p-4 text-sm">
                <p>Estimated Tax Payable: <span className="font-semibold">{formatINR(taxResult.estimatedTaxPayable)}</span></p>
                <p>Tax Saved: <span className="font-semibold">{formatINR(taxResult.taxSaved)}</span></p>
              </div>
            </article>

            <aside className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <h3 className="text-lg font-semibold text-white">Tax Insights</h3>
              <p className="mt-1 text-xs text-slate-400">Computed from your current tax calculator inputs.</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                  <span className="text-slate-300">Effective Tax Rate</span>
                  <span className="font-semibold text-slate-100">{taxResult.effectiveTaxRate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                  <span className="text-slate-300">Monthly Tax Burden</span>
                  <span className="font-semibold text-slate-100">{formatINR(taxResult.monthlyTaxBurden)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                  <span className="text-slate-300">Post-Tax Annual Income</span>
                  <span className="font-semibold text-emerald-300">{formatINR(taxResult.postTaxAnnualIncome)}</span>
                </div>
              </div>

              <details
                className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3"
                onToggle={(e) => setShowAccuracyDetails((e.currentTarget as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer text-sm font-medium text-yellow-200">Add more details for better accuracy</summary>
                <div className="mt-3 space-y-3 text-sm">
                  <label className="block text-slate-300">Age Group
                    <select className={inputClasses} value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as "below60" | "60to80" | "above80") }>
                      <option value="below60">&lt; 60</option>
                      <option value="60to80">60 - 80</option>
                      <option value="above80">80+</option>
                    </select>
                  </label>
                  <label className="block text-slate-300">Tax Regime
                    <select className={inputClasses} value={selectedRegime} onChange={(e) => setSelectedRegime(e.target.value as "new" | "old" | "compare") }>
                      <option value="new">New</option>
                      <option value="old">Old</option>
                      <option value="compare">Compare</option>
                    </select>
                  </label>
                  <label className="block text-slate-300">Health Insurance (80D)
                    <input className={inputClasses} value={healthInsurance80D} onChange={(e) => setHealthInsurance80D(e.target.value)} type="number" min="0" />
                  </label>
                </div>
              </details>

              <details className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3" open>
                <summary className="cursor-pointer text-sm font-medium text-slate-200">Old vs New Regime (Indicative)</summary>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2">
                    <span className="text-slate-300">Old Regime (Indicative)</span>
                    <span className="font-semibold text-slate-100">{formatINR(taxResult.oldRegimeTax)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2">
                    <span className="text-slate-300">New Regime (Indicative)</span>
                    <span className="font-semibold text-slate-100">{formatINR(taxResult.newRegimeTax)}</span>
                  </div>
                  <p className="text-xs text-slate-500">Selected mode: {taxResult.selectedRegimeLabel.toUpperCase()}</p>
                </div>
              </details>

              <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                {hasToken ? (
                  <p>Already paid your taxes? Claim your Nation Builder Badge.</p>
                ) : (
                  <a href="/signup" className="font-semibold underline underline-offset-2">
                    Already paid your taxes? Claim your Nation Builder Badge.
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <QuickInsights />
      <Disclaimer />
    </section>
  );
}
