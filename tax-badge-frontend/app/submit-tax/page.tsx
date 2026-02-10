"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

export default function SubmitTaxPage() {
  const [fy, setFy] = useState("FY 2024-25");
  const [tax, setTax] = useState("");

  const submit = async () => {
    try {
      await apiFetch("/submission/", {
        method: "POST",
        body: JSON.stringify({
          financial_year: fy,
          tax_paid: Number(tax),
        }),
      });
      alert("Submitted for approval");
    } catch (e: any) {
      alert(e.detail || "Submission failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-xl mb-4">Submit Tax</h1>

        <select onChange={(e) => setFy(e.target.value)}>
          <option>FY 2024-25</option>
          <option>FY 2025-26</option>
        </select>

        <input
          type="number"
          className="input mt-2"
          placeholder="Tax Paid"
          onChange={(e) => setTax(e.target.value)}
        />

        <button className="btn mt-4" onClick={submit}>
          Submit
        </button>
      </div>
    </ProtectedRoute>
  );
}
