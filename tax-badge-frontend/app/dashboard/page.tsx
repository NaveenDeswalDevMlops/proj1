"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type Submission = {
  id?: string | number;
  financial_year?: string;
  status?: string;
  badge_id?: string | number | null;
  admin_comment?: string | null;
};

type ApprovedBadge = {
  submission_id: number;
  badge_id: string;
  financial_year: string;
  badge_name: string;
};

function normalizeSubmissionsResponse(data: unknown): Submission[] {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== "object") return [];

  const singleSubmission = data as Submission;
  if (
    "financial_year" in singleSubmission ||
    "status" in singleSubmission ||
    "badge_id" in singleSubmission ||
    "id" in singleSubmission
  ) {
    return [singleSubmission];
  }

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
  const [subs, setSubs] = useState<Submission[]>([]);
  const [approvedBadges, setApprovedBadges] = useState<ApprovedBadge[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      const candidatePaths = ["/submission/mine", "/submission/me"];

      for (const path of candidatePaths) {
        try {
          const data = await apiFetch(path);
          setSubs(normalizeSubmissionsResponse(data));
          setError("");
          return;
        } catch (e: any) {
          if (e?.status === 404) continue;
          setError(e?.detail || "Failed to load submissions");
          return;
        }
      }

      setError("No compatible submissions endpoint found on backend.");
      setSubs([]);
    };

    const loadBadges = async () => {
      try {
        const data = await apiFetch("/submission/my-badges");
        setApprovedBadges(Array.isArray(data) ? data : []);
      } catch {
        setApprovedBadges([]);
      }
    };

    loadSubmissions();
    loadBadges();
  }, []);

  const safeSubs = useMemo(() => (Array.isArray(subs) ? subs : []), [subs]);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl mb-4">My Submission History</h1>

        {error && <p className="mb-4 text-red-300">{error}</p>}

        {!error && safeSubs.length === 0 && (
          <p className="mb-4 text-slate-300">No submissions available yet.</p>
        )}

        {safeSubs.map((s, index) => (
          <div key={s.id ?? `${s.financial_year ?? "submission"}-${index}`} className="card mb-4">
            <p>FY: {s.financial_year ?? "-"}</p>
            <p>Status: {s.status ?? "-"}</p>
            {s.admin_comment && <p>Admin comment: {s.admin_comment}</p>}
            {s.badge_id && (
              <>
                <p>Badge ID: {s.badge_id}</p>
                <div className="mt-2 flex gap-2">
                  <a className="btn" href={`/verify?badge=${s.badge_id}`}>Verify</a>
                  <a className="btn" href={`/download?badge=${s.badge_id}`}>Download</a>
                </div>
              </>
            )}
          </div>
        ))}

        <h2 className="text-xl mt-8 mb-4">All Approved Badges</h2>
        {approvedBadges.length === 0 ? (
          <p className="text-slate-300">No approved badges yet.</p>
        ) : (
          approvedBadges.map((badge) => (
            <div key={badge.submission_id} className="card mb-3">
              <p>FY: {badge.financial_year}</p>
              <p>Badge Tier: {badge.badge_name}</p>
              <p>Badge ID: {badge.badge_id}</p>
              <div className="mt-2 flex gap-2">
                <a className="btn" href={`/verify?badge=${badge.badge_id}`}>Verify</a>
                <a className="btn" href={`/download?badge=${badge.badge_id}`}>Download</a>
              </div>
            </div>
          ))
        )}
      </div>
    </ProtectedRoute>
  );
}
