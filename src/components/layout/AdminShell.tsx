"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile drawer */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar />
      </div>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-bg-alt px-5 py-4 md:hidden">
          <span className="font-display text-sm uppercase tracking-wide text-ink">Dashboard</span>
          <button
            onClick={() => setOpen(true)}
            className="border border-line px-3 py-1.5 text-xs uppercase tracking-wide text-ink-dim"
          >
            Menu
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
