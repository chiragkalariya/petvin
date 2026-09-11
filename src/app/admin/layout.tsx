"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/components/layout/AuthProvider";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("h-full", "overflow-hidden");
    document.body.classList.add("h-full", "overflow-hidden");
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.classList.remove("h-full", "overflow-hidden");
      document.body.classList.remove("h-full", "overflow-hidden");
    };
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
