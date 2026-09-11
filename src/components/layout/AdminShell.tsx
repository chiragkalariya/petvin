"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Lock viewport scroll so modals and inputs never cause the admin layout to shift
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:block h-full shrink-0">
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

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Mobile top header with logo and bar icon */}
        <div className="flex items-center justify-between border-b border-line bg-bg-alt px-5 py-3.5 md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="/images/petvin_febtech_updated.svg"
              alt="Petvin Febtech"
              className="w-28 h-auto"
            />
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open Navigation Menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-bg text-ink-dim hover:border-accent hover:text-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
