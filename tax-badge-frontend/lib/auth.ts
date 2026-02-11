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
  localStorage.setItem("is_admin", String(Boolean(res.user.is_admin)));

  return res;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("is_admin");
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("is_admin") === "true";
}
