"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signup(email, password);
      router.push("/login");
    } catch (e: any) {
      alert(e.detail || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Signup</h1>

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

      <button className="btn mt-4" onClick={handleSignup}>
        Signup
      </button>
    </div>
  );
}
