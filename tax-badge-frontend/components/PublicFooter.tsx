"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

const publicRoutes = new Set([
  "/",
  "/login",
  "/signup",
  "/rates-comparison",
  "/about-us",
  "/how-it-works",
  "/contact-us",
  "/privacy-policy",
  "/terms-of-use",
  "/disclaimer",
]);

export default function PublicFooter() {
  const pathname = usePathname();

  if (!pathname || !publicRoutes.has(pathname)) {
    return null;
  }

  return <Footer />;
}
