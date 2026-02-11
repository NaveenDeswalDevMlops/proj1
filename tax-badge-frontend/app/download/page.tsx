"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_BASE = "http://localhost:8000";

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadPage() {
  const [badgeId, setBadgeId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = query.get("badge");
    if (fromQuery) setBadgeId(fromQuery);
  }, []);

  const downloadFile = async (format: "png" | "pdf") => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setError("");
      const res = await fetch(`${API_BASE}/badge/${badgeId}/${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null);
        throw new Error(maybeJson?.detail || `Download failed (${res.status})`);
      }

      const blob = await res.blob();
      triggerBrowserDownload(blob, `${badgeId}.${format}`);
    } catch (e: any) {
      setError(e?.message || "Download failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-10">
        <h1 className="text-2xl mb-4">Download Badge</h1>
        <input
          className="input"
          placeholder="Enter approved badge ID"
          value={badgeId}
          onChange={(e) => setBadgeId(e.target.value)}
        />

        <div className="mt-4 flex gap-3">
          <button className="btn" onClick={() => downloadFile("png")}>
            Download PNG
          </button>
          <button className="btn" onClick={() => downloadFile("pdf")}>
            Download PDF
          </button>
        </div>

        {error && <p className="mt-4 text-red-300">{error}</p>}
      </div>
    </ProtectedRoute>
  );
}
