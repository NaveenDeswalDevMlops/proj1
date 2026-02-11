"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import { isAdmin } from "@/lib/auth";

type AdminSubmission = {
  id: number;
  user_email: string;
  financial_year: string;
  tax_paid: number;
  status: string;
  badge_id?: string | null;
  admin_comment?: string | null;
};

type AdminStats = {
  total_submissions: number;
  generated_badges: number;
  pending_badges: number;
  rejected_requests: number;
  invalidated_badges: number;
  expired_badges: number;
};

const defaultStats: AdminStats = {
  total_submissions: 0,
  generated_badges: 0,
  pending_badges: 0,
  rejected_requests: 0,
  invalidated_badges: 0,
  expired_badges: 0,
};

export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminSubmission[]>([]);
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [financialYear, setFinancialYear] = useState("FY 2024-25");
  const [taxPaid, setTaxPaid] = useState("");
  const [rejectComments, setRejectComments] = useState<Record<number, string>>({});

  const load = async () => {
    try {
      const [data, statsData] = await Promise.all([
        apiFetch("/admin/submissions"),
        apiFetch("/admin/stats"),
      ]);
      setRows(Array.isArray(data) ? data : []);
      setStats((statsData as AdminStats) || defaultStats);
      setError("");
    } catch (e: any) {
      setError(e?.detail || "Failed to load admin data");
    }
  };

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/dashboard");
      return;
    }
    load();
  }, []);

  const approve = async (id: number) => {
    try {
      await apiFetch(`/admin/approve/${id}`, { method: "POST" });
      await load();
    } catch (e: any) {
      alert(e?.detail || "Approve failed");
    }
  };

  const reject = async (id: number) => {
    try {
      const comment = rejectComments[id] || "Rejected by admin";
      await apiFetch(`/admin/reject/${id}`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      });
      await load();
    } catch (e: any) {
      alert(e?.detail || "Reject failed");
    }
  };

  const invalidate = async (id: number) => {
    try {
      await apiFetch(`/admin/invalidate/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert(e?.detail || "Invalidate failed");
    }
  };

  const submitForUser = async () => {
    try {
      await apiFetch("/admin/submit-for-user", {
        method: "POST",
        body: JSON.stringify({
          user_email: userEmail,
          financial_year: financialYear,
          tax_paid: Number(taxPaid),
        }),
      });
      setUserEmail("");
      setTaxPaid("");
      await load();
    } catch (e: any) {
      alert(e?.detail || "Submit for user failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl">Admin Panel</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="card">Generated: {stats.generated_badges}</div>
          <div className="card">Pending: {stats.pending_badges}</div>
          <div className="card">Expired: {stats.expired_badges}</div>
          <div className="card">Rejected: {stats.rejected_requests}</div>
          <div className="card">Invalidated: {stats.invalidated_badges}</div>
          <div className="card">Total: {stats.total_submissions}</div>
        </div>

        <div className="card">
          <h2 className="text-lg mb-3">Submit tax details for a user</h2>
          <input
            className="input"
            placeholder="user@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <select
            className="input mt-2"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
          >
            <option>FY 2022-23</option>
            <option>FY 2023-24</option>
            <option>FY 2024-25</option>
            <option>FY 2025-26</option>
          </select>
          <input
            type="number"
            className="input mt-2"
            placeholder="Tax Paid"
            value={taxPaid}
            onChange={(e) => setTaxPaid(e.target.value)}
          />
          <button className="btn mt-3" onClick={submitForUser}>
            Submit for User
          </button>
        </div>

        <div>
          <h2 className="text-lg mb-3">All submissions</h2>
          {error && <p className="text-red-300">{error}</p>}
          {rows.map((row) => (
            <div key={row.id} className="card mb-3">
              <p>User: {row.user_email}</p>
              <p>FY: {row.financial_year}</p>
              <p>Tax Paid: {row.tax_paid}</p>
              <p>Status: {row.status}</p>
              {row.admin_comment && <p>Comment: {row.admin_comment}</p>}
              {row.badge_id && <p>Badge ID: {row.badge_id}</p>}
              <textarea
                className="input mt-2"
                placeholder="Reject comment"
                value={rejectComments[row.id] || ""}
                onChange={(e) =>
                  setRejectComments((prev) => ({ ...prev, [row.id]: e.target.value }))
                }
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                <button className="btn" onClick={() => approve(row.id)} disabled={row.status !== "PENDING"}>
                  Approve
                </button>
                <button className="btn" onClick={() => reject(row.id)} disabled={row.status !== "PENDING"}>
                  Reject
                </button>
                <button className="btn" onClick={() => invalidate(row.id)} disabled={!row.badge_id}>
                  Delete Invalid Badge
                </button>
                {row.badge_id && (
                  <>
                    <a className="btn" href={`/verify?badge=${row.badge_id}`}>
                      Verify
                    </a>
                    <a className="btn" href={`/download?badge=${row.badge_id}`}>
                      Download
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
