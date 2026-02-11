"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      const candidatePaths = [
        "/submission/me",
        "/submission/my",
        "/submission/mine",
        "/submission/",
      ];

      for (const path of candidatePaths) {
        try {
          const data = await apiFetch(path);
          setSubs(Array.isArray(data) ? data : []);
          setError("");
          return;
        } catch (e: any) {
          if (e?.status === 404) continue;
          setError(e?.detail || "Failed to load submissions");
          return;
        }
      }

      setError("No compatible submissions endpoint found on backend.");
    };

    loadSubmissions();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl mb-4">My Submissions</h1>

        {error && <p className="mb-4 text-red-300">{error}</p>}

        {!error && subs.length === 0 && (
          <p className="mb-4 text-slate-300">No submissions available yet.</p>
        )}

        {subs.map((s) => (
          <div key={s.id} className="card mb-4">
            <p>FY: {s.financial_year}</p>
            <p>Status: {s.status}</p>
            {s.badge_id && <p>Badge ID: {s.badge_id}</p>}
          </div>
        ))}
      </div>
    </ProtectedRoute>
  );
}
