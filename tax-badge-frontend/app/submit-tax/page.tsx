"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

function fyLabel(startYear: number) {
  const next = String((startYear + 1) % 100).padStart(2, "0");
  return `FY ${startYear}-${next}`;
}

export default function SubmitTaxPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentFyStart = currentMonth >= 4 ? currentYear : currentYear - 1;

  const fyOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => currentFyStart - 3 + i),
    [currentFyStart],
  );

  const [fy, setFy] = useState(fyLabel(currentFyStart));
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
      setTax("");
    } catch (e: any) {
      alert(e.detail || "Submission failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-xl mb-4">Submit Tax</h1>

        <label className="block mb-1">Financial Year</label>
        <select className="input" value={fy} onChange={(e) => setFy(e.target.value)}>
          {fyOptions.map((year) => {
            const label = fyLabel(year);
            const isFuture = year > currentFyStart;
            return (
              <option key={year} value={label} disabled={isFuture}>
                {label}{isFuture ? " (future - disabled)" : ""}
              </option>
            );
          })}
        </select>

        <input
          type="number"
          className="input mt-2"
          placeholder="Tax Paid"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
        />

        <button className="btn mt-4" onClick={submit}>
          Submit
        </button>
      </div>
    </ProtectedRoute>
  );
}
