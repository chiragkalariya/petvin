"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/site-content";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[60] h-6 w-8 md:hidden"
      >
        <span
          className={cn(
            "absolute left-0 top-0 h-0.5 w-full bg-ink transition-transform",
            open && "translate-y-[11px] rotate-45"
          )}
        />
        <span
          className={cn("absolute left-0 top-[11px] h-0.5 w-full bg-ink transition-opacity", open && "opacity-0")}
        />
        <span
          className={cn(
            "absolute left-0 top-[22px] h-0.5 w-full bg-ink transition-transform",
            open && "-translate-y-[11px] -rotate-45"
          )}
        />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-[55] flex h-full w-[78vw] max-w-xs flex-col gap-6 border-l border-line bg-bg-alt px-8 pb-10 pt-24 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="font-display text-xl uppercase tracking-wide text-ink-dim hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="mt-2 border border-accent px-5 py-3 text-center text-sm uppercase tracking-wider text-accent"
        >
          Get a Quote
        </Link>
      </div>
    </>
  );
}
