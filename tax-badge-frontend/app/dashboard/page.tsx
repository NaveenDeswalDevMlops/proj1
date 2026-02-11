"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type Submission = {
  id?: string | number;
  financial_year?: string;
  status?: string;
  badge_id?: string | number | null;
};

function normalizeSubmissionsResponse(data: unknown): Submission[] {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== "object") return [];

  const payload = data as {
    submissions?: unknown;
    items?: unknown;
    data?: unknown;
  };

  if (Array.isArray(payload.submissions)) return payload.submissions as Submission[];
  if (Array.isArray(payload.items)) return payload.items as Submission[];
  if (Array.isArray(payload.data)) return payload.data as Submission[];

  return [];
}

export default function DashboardPage() {

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

  const safeSubs = useMemo(() => (Array.isArray(subs) ? subs : []), [subs]);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl mb-4">My Submissions</h1>

        {error && <p className="mb-4 text-red-300">{error}</p>}


            {s.badge_id && <p>Badge ID: {s.badge_id}</p>}
          </div>
        ))}
      </div>
    </ProtectedRoute>
  );
}
