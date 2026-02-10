// lib/auth.ts
import { apiFetch } from "./api";

export async function signup(email: string, password: string) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("access_token", res.access_token);
  localStorage.setItem("user_email", res.user.email);

  return res;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_email");
}
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}
