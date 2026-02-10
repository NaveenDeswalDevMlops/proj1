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
    let err;
    try {
      err = await res.json();
    } catch {
      throw new Error("API error");
    }
    throw err;
  }

  return res.json();
}
