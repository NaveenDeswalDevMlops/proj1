"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type VerifyResponse = {
  valid: boolean;
  badge_id: string;
  badge_name: string;
  financial_year: string;
  expires_at: string | null;
  status: "VALID" | "EXPIRED";
};

export default function VerifyPage() {
  const [badgeId, setBadgeId] = useState("");
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = query.get("badge");
    if (fromQuery) setBadgeId(fromQuery);
  }, []);

  const verifyBadge = async () => {
    try {
      const data = await apiFetch(`/verify/${badgeId}`);
      setResult(data);
      setError("");
    } catch (e: any) {
      setResult(null);
      setError(e?.detail || "Badge verification failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-10">
        <h1 className="text-2xl mb-4">Verify Badge</h1>
        <input
          className="input"
          placeholder="Enter badge ID"
          value={badgeId}
          onChange={(e) => setBadgeId(e.target.value)}
        />
        <button className="btn mt-3" onClick={verifyBadge}>
          Verify
        </button>

        {error && <p className="mt-4 text-red-300">{error}</p>}

        {result && (
          <div className="card mt-6 space-y-2">
            <p>Badge ID: {result.badge_id}</p>
            <p>Badge: {result.badge_name}</p>
            <p>Financial Year: {result.financial_year}</p>
            <p>Status: {result.status}</p>
            <p>Valid: {result.valid ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
