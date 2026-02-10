"use client";

import { useEffect, useState } from "react";
import { isLoggedIn } from "@/lib/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <nav className="border-b border-slate-800 py-4">
      <div className="max-w-5xl mx-auto px-6 flex justify-between">
        <a href="/" className="font-bold">Nation Builder</a>
        <div className="flex gap-4">
          {loggedIn ? (
            <>
              <a href="/dashboard">Dashboard</a>
              <a href="/logout">Logout</a>
            </>
          ) : (
            <>
              <a href="/login">Login</a>
              <a href="/signup">Signup</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
