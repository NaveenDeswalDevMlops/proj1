"use client";

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
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.detail || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Login</h1>

      <input
        className="input"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="input mt-2"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn mt-4" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
