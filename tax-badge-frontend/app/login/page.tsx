"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || "/dashboard";
      router.push(nextPath);
    } catch (e: any) {
      alert(e.detail || "Login failed");
    }
  };

  return (
    <div className="relative isolate mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/55 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:mt-20 sm:p-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
            Secure Access Portal
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
            Nation Builder Login
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Sign in to continue filing, tracking, and managing your taxpayer workflows in one dashboard.
          </p>
          <div className="mt-8 rounded-xl border border-slate-700/60 bg-slate-950/60 p-4 text-sm text-slate-300">
            Protected with encrypted sessions and verified access controls.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-xl shadow-black/20">
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mb-2 mt-5 block text-sm font-medium text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn mt-6" onClick={handleLogin}>
            Login
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-sky-300 hover:text-sky-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
