// components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, isLoggedIn } from "@/lib/auth";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    if (requireAdmin && !isAdmin()) {
      router.push("/dashboard");
      return;
    }

    setAllowed(true);
  }, [requireAdmin, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
