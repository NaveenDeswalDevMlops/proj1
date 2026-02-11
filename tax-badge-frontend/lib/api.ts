// lib/api.ts
const API_BASE = "http://localhost:8000";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let err: any;
    try {
      err = await res.json();
    } catch {
      const unknownError = new Error("API error") as Error & { status?: number };
      unknownError.status = res.status;
      throw unknownError;
    }
    if (typeof err === "object" && err !== null) {
      err.status = res.status;
    }
    throw err;
  }

  return res.json();
}
