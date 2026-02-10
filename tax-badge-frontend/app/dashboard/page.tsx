"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/submission/me").then(setSubs);
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl mb-4">My Submissions</h1>

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
