"use client";

import { useMemo } from "react";

type LoanComparisonProps = {
  loanAmount: number;
  tenureYears: number;
  className?: string;
};

type LoanBankRate = {
  name: string;
  personalLoanRate: number;
};

const LOAN_BANK_RATES: LoanBankRate[] = [
  { name: "SBI", personalLoanRate: 10.4 },
  { name: "HDFC", personalLoanRate: 10.75 },
  { name: "ICICI", personalLoanRate: 10.9 },
  { name: "Axis", personalLoanRate: 11.1 },
  { name: "Kotak", personalLoanRate: 10.95 },
  { name: "PNB", personalLoanRate: 10.6 },
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const calculateEmi = (principal: number, annualRate: number, months: number) => {
  if (!principal || !months) return 0;

  const monthlyRate = annualRate / 12 / 100;
  if (!monthlyRate) return principal / months;

  const factor = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * factor) / (factor - 1);
};

export default function LoanComparison({ loanAmount, tenureYears, className = "" }: LoanComparisonProps) {
  const rows = useMemo(() => {
    const months = tenureYears * 12;

    return LOAN_BANK_RATES.map((bank) => {
      const emi = calculateEmi(loanAmount, bank.personalLoanRate, months);
      const totalPayable = emi * months;

      return {
        bankName: bank.name,
        rate: bank.personalLoanRate,
        emi,
        totalPayable,
      };
    });
  }, [loanAmount, tenureYears]);

  const bestEmi = Math.min(...rows.map((row) => row.emi).filter((value) => value > 0), Infinity);

  return (
    <div className={`mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Compare Personal Loans</h3>
        <span className="text-xs text-yellow-300">Rates indicative – updated monthly</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-slate-300">
            <tr className="border-b border-slate-700">
              <th className="px-2 py-2">Bank Name</th>
              <th className="px-2 py-2">Interest Rate</th>
              <th className="px-2 py-2">Monthly EMI</th>
              <th className="px-2 py-2">Total Payable</th>
              <th className="px-2 py-2">Difference vs Best EMI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const differenceVsBest = Number.isFinite(bestEmi) ? row.emi - bestEmi : 0;
              const isBest = Math.abs(row.emi - bestEmi) < 0.01;

              return (
                <tr key={row.bankName} className={`border-b border-slate-800/80 ${isBest ? "bg-emerald-500/10" : ""}`}>
                  <td className="px-2 py-2 font-medium text-white">{row.bankName}</td>
                  <td className="px-2 py-2 text-slate-200">{row.rate.toFixed(2)}%</td>
                  <td className={`px-2 py-2 ${isBest ? "font-semibold text-emerald-300" : "text-slate-100"}`}>
                    {formatINR(row.emi)}
                  </td>
                  <td className="px-2 py-2 text-slate-100">{formatINR(row.totalPayable)}</td>
                  <td className="px-2 py-2 text-slate-300">
                    {differenceVsBest <= 0.01 ? "Best" : `+${formatINR(differenceVsBest)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
