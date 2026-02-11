"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

export default function DownloadPage() {
  const [badgeId, setBadgeId] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fromQuery = query.get("badge");
    if (fromQuery) setBadgeId(fromQuery);
  }, []);

  const pngUrl = `${API_BASE}/badge/${badgeId}/png`;
  const pdfUrl = `${API_BASE}/badge/${badgeId}/pdf`;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl mb-4">Download Badge</h1>
      <input
        className="input"
        placeholder="Enter approved badge ID"
        value={badgeId}
        onChange={(e) => setBadgeId(e.target.value)}
      />

      <div className="mt-4 flex gap-3">
        <a
          href={pngUrl}
          target="_blank"
          rel="noreferrer"
          className="btn"
        >
          Download PNG
        </a>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="btn"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
