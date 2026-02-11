"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type AdminSubmission = {
  id: number;
  user_email: string;
  financial_year: string;
  tax_paid: number;
  status: string;
  badge_id?: string | null;
  badge_expires_at?: string | null;
  admin_comment?: string | null;
};

export default function AdminPage() {
  const [rows, setRows] = useState<AdminSubmission[]>([]);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [financialYear, setFinancialYear] = useState("FY 2024-25");
  const [taxPaid, setTaxPaid] = useState("");
  const [rejectComments, setRejectComments] = useState<Record<number, string>>({});

  const load = async () => {
    try {
      const data = await apiFetch("/admin/submissions");
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch (e: any) {
      setError(e?.detail || "Failed to load admin data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const approved = rows.filter((row) => row.status === "APPROVED");
    const expired = approved.filter((row) => row.badge_expires_at && new Date(row.badge_expires_at) < today);

    return {
      totalGenerated: approved.length,
      pending: rows.filter((row) => row.status === "PENDING").length,
      rejected: rows.filter((row) => row.status === "REJECTED").length,
      invalidated: rows.filter((row) => row.status === "INVALIDATED").length,
      expired: expired.length,
    };
  }, [rows]);

  const approve = async (id: number) => {
    try {
      await apiFetch(`/admin/approve/${id}`, { method: "POST" });
      await load();
    } catch (e: any) {
      alert(e?.detail || "Approve failed");
    }
  };

  const reject = async (id: number) => {
    const comment = rejectComments[id]?.trim();
    if (!comment) {
      alert("Please add reject comment.");
      return;
    }

    try {
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
      alert(e?.detail || "Delete badge failed");
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
    <ProtectedRoute requireAdmin>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl">Admin Panel</h1>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="card">Generated: {stats.totalGenerated}</div>
          <div className="card">Pending: {stats.pending}</div>
          <div className="card">Expired: {stats.expired}</div>
          <div className="card">Rejected: {stats.rejected}</div>
          <div className="card">Invalidated: {stats.invalidated}</div>
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
            <option>FY 2024-25</option>
            <option>FY 2025-26</option>
            <option>FY 2026-27</option>
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
              {row.badge_id && <p>Badge ID: {row.badge_id}</p>}
              {row.admin_comment && <p>Admin comment: {row.admin_comment}</p>}
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button className="btn" onClick={() => approve(row.id)} disabled={row.status !== "PENDING"}>
                    Approve
                  </button>
                  <button className="btn" onClick={() => reject(row.id)} disabled={row.status !== "PENDING"}>
                    Reject
                  </button>
                  <button className="btn" onClick={() => invalidate(row.id)} disabled={!row.badge_id}>
                    Delete Invalid Badge
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="Comment for rejection"
                  value={rejectComments[row.id] || ""}
                  onChange={(e) => setRejectComments((prev) => ({ ...prev, [row.id]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
