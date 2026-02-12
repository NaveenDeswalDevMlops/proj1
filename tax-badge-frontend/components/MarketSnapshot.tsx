"use client";

import { useEffect, useMemo, useState } from "react";

type SnapshotData = {
  goldPerGramInr: number;
  silverPerKgInr: number;
  sensex: number;
  nifty50: number;
};

type SnapshotResponse = {
  data?: SnapshotData;
  fetchedAt?: string;
  source?: string;
  isFallback?: boolean;
  message?: string;
};

const formatINR = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);

const formatIndex = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function MarketSnapshot() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("Indicative");
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchSnapshot = async () => {
      try {
        const response = await fetch("/api/market-snapshot", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Unable to fetch market data (${response.status})`);
        }

        const payload: SnapshotResponse = await response.json();
        if (!cancelled) {
          setData(payload?.data || null);
          setLastUpdated(payload?.fetchedAt ? new Date(payload.fetchedAt) : new Date());
          setSource(payload?.source || "Indicative");
          setIsFallback(Boolean(payload?.isFallback));
          setError(payload?.message || null);
        }
      } catch {
        if (!cancelled) {
          setError("Market data temporarily unavailable. Please retry in a few minutes.");
        }
      }
    };

    fetchSnapshot();
    const timer = setInterval(fetchSnapshot, 60_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return "Last updated: --:-- IST";
    }

    const istTime = lastUpdated.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    return `Last updated: ${istTime} IST`;
  }, [lastUpdated]);

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <h3 className="text-xl font-semibold text-white">Market Snapshot (Indicative)</h3>
      <p className="mt-1 text-xs text-slate-400">For informational purposes only</p>
      <p className="mt-1 text-xs text-slate-500">{lastUpdatedLabel}</p>
      <p className="mt-1 text-xs text-slate-500">Source: {source}</p>

      {error && (
        <p className={`mt-3 rounded-lg border p-3 text-sm ${isFallback ? "border-yellow-400/40 bg-yellow-500/10 text-yellow-200" : "border-red-400/40 bg-red-500/10 text-red-200"}`}>
          {error}
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
          <span className="text-slate-300">Gold (24K, per gram)</span>
          <span className="font-semibold text-yellow-300">{formatINR(data?.goldPerGramInr || 0)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
          <span className="text-slate-300">Silver (per kg)</span>
          <span className="font-semibold text-slate-100">{formatINR(data?.silverPerKgInr || 0)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
          <span className="text-slate-300">Sensex</span>
          <span className="font-semibold text-emerald-300">{formatIndex(data?.sensex || 0)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
          <span className="text-slate-300">Nifty 50</span>
          <span className="font-semibold text-emerald-300">{formatIndex(data?.nifty50 || 0)}</span>
        </div>
      </div>
    </aside>
  );
}
