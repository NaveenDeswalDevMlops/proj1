"use client";

import { useMemo } from "react";

type ProductType = "FD" | "RD";

type BankRate = {
  name: string;
  fdRate: number;
  rdRate: number;
};

type BankComparisonProps = {
  productType: ProductType;
  amount: number;
  tenureYears: number;
  className?: string;
};

const BANK_RATES: BankRate[] = [
  { name: "SBI", fdRate: 6.8, rdRate: 6.5 },
  { name: "HDFC", fdRate: 7.1, rdRate: 6.9 },
  { name: "ICICI", fdRate: 7, rdRate: 6.8 },
  { name: "Axis", fdRate: 7.05, rdRate: 6.85 },
  { name: "Kotak", fdRate: 7.15, rdRate: 6.95 },
  { name: "PNB", fdRate: 6.9, rdRate: 6.6 },
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const calculateFdMaturity = (principal: number, annualRate: number, years: number) =>
  principal * (1 + annualRate / 100) ** years;

const calculateRdMaturity = (monthlyDeposit: number, annualRate: number, years: number) => {
  const months = years * 12;
  if (!months) return 0;

  const monthlyRate = annualRate / 12 / 100;
  if (!monthlyRate) {
    return monthlyDeposit * months;
  }

  return monthlyDeposit * (((1 + monthlyRate) ** months - 1) / monthlyRate);
};

export default function BankComparison({ productType, amount, tenureYears, className = "" }: BankComparisonProps) {
  const rows = useMemo(() => {
    return BANK_RATES.map((bank) => {
      const rate = productType === "FD" ? bank.fdRate : bank.rdRate;
      const maturityAmount =
        productType === "FD"
          ? calculateFdMaturity(amount, rate, tenureYears)
          : calculateRdMaturity(amount, rate, tenureYears);

      return {
        bankName: bank.name,
        rate,
        maturityAmount,
      };
    });
  }, [amount, productType, tenureYears]);

  const bestMaturity = Math.max(...rows.map((row) => row.maturityAmount), 0);

  return (
    <div className={`mt-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Compare Across Banks</h3>
        <span className="text-xs text-yellow-300">Rates indicative – updated monthly</span>
      </div>

      <p className="mb-3 text-xs text-slate-400">
        Indicative rates are used for {productType} comparison across banks and should not be treated as final offer rates.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-slate-300">
            <tr className="border-b border-slate-700">
              <th className="px-2 py-2">Bank Name</th>
              <th className="px-2 py-2">Interest Rate</th>
              <th className="px-2 py-2">Maturity Amount</th>
              <th className="px-2 py-2">Difference vs Best</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const differenceVsBest = bestMaturity - row.maturityAmount;
              const isBest = Math.abs(row.maturityAmount - bestMaturity) < 0.01;

              return (
                <tr
                  key={row.bankName}
                  className={`border-b border-slate-800/80 ${isBest ? "bg-emerald-500/10" : ""}`}
                >
                  <td className="px-2 py-2 font-medium text-white">{row.bankName}</td>
                  <td className="px-2 py-2 text-slate-200">{row.rate.toFixed(2)}%</td>
                  <td className={`px-2 py-2 ${isBest ? "font-semibold text-emerald-300" : "text-slate-100"}`}>
                    {formatINR(row.maturityAmount)}
                  </td>
                  <td className="px-2 py-2 text-slate-300">
                    {differenceVsBest <= 0.01 ? "Best" : `-${formatINR(differenceVsBest)}`}
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
