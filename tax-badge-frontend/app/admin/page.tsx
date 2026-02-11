"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type AdminSubmission = {
  id: number;
  user_email: string;
  financial_year: string;
  tax_paid: number;
  status: string;
  badge_id?: string | null;
};

export default function AdminPage() {
  const [rows, setRows] = useState<AdminSubmission[]>([]);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [financialYear, setFinancialYear] = useState("FY 2024-25");
  const [taxPaid, setTaxPaid] = useState("");

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

  const approve = async (id: number) => {
    try {
      await apiFetch(`/admin/approve/${id}`, { method: "POST" });
      await load();
    } catch (e: any) {
      alert(e?.detail || "Approve failed");
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
              <div className="mt-2 flex gap-2">
                <button className="btn" onClick={() => approve(row.id)} disabled={row.status !== "PENDING"}>
                  Approve
                </button>
                {row.badge_id && (
                  <>
                    <a className="btn" target="_blank" rel="noreferrer" href={`http://localhost:8000/verify/${row.badge_id}`}>
                      Verify
                    </a>
                    <a className="btn" target="_blank" rel="noreferrer" href={`http://localhost:8000/badge/${row.badge_id}/png`}>
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
