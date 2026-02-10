"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logout();
    router.push("/login");
  }, [router]);

  return null;
}
