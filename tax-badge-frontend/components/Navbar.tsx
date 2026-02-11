"use client";

import { useEffect, useState } from "react";
import { isAdmin, isLoggedIn } from "@/lib/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setLoggedIn(isLoggedIn());
      setAdmin(isAdmin());
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);

    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  return (
    <nav className="border-b border-slate-800 py-4">
      <div className="max-w-5xl mx-auto px-6 flex justify-between">
        <a href="/" className="font-bold">Nation Builder</a>
        <div className="flex gap-4">
          {loggedIn ? (
            <>
              <a href="/dashboard">Dashboard</a>
              <a href="/submit-tax">Submit Tax</a>
              <a href="/download">Download</a>
              <a href="/verify">Verify</a>
              {admin && <a href="/admin">Admin</a>}
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
