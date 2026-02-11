"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

const API_BASE = "http://localhost:8000";

type BadgeItem = {
  submission_id: number;
  badge_id: string;
  financial_year: string;
};

async function downloadWithToken(path: string, filename: string) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Download failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function DownloadPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [badgeId, setBadgeId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiFetch("/submission/my-badges");
        const rows = Array.isArray(list) ? (list as BadgeItem[]) : [];
        setBadges(rows);

        const query = new URLSearchParams(window.location.search);
        const fromQuery = query.get("badge");
        if (fromQuery) {
          setBadgeId(fromQuery);
        } else if (rows.length > 0) {
          setBadgeId(rows[0].badge_id);
        }
      } catch {
        setBadges([]);
      }
    };

    load();
  }, []);

  const onDownload = async (type: "png" | "pdf") => {
    if (!badgeId) return;
    try {
      await downloadWithToken(`/badge/${badgeId}/${type}`, `${badgeId}.${type}`);
    } catch (e: any) {
      alert(e?.message || "Download failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-10">
        <h1 className="text-2xl mb-4">Download Badge</h1>

        {badges.length === 0 ? (
          <p className="text-slate-300">No approved badges available yet.</p>
        ) : (
          <>
            <label className="block mb-1">Select your Badge ID</label>
            <select className="input" value={badgeId} onChange={(e) => setBadgeId(e.target.value)}>
              {badges.map((badge) => (
                <option key={badge.submission_id} value={badge.badge_id}>
                  {badge.badge_id} ({badge.financial_year})
                </option>
              ))}
            </select>

            <div className="mt-4 flex gap-3">
              <button className="btn" onClick={() => onDownload("png")}>Download PNG</button>
              <button className="btn" onClick={() => onDownload("pdf")}>Download PDF</button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
