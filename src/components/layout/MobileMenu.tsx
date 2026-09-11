"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Menu, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-content";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[99] bg-black/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-[100] flex h-full h-dvh w-[85vw] max-w-sm flex-col justify-between border-l border-line bg-[#13161B] p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between border-b border-line/60 pb-4">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
              <img
                src="/images/petvin_febtech_updated.svg"
                alt="Petvin Febtech"
                className="w-28 h-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 text-ink-dim transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-lg px-3.5 py-3 font-display text-lg uppercase tracking-wider text-ink-muted transition-all hover:bg-white/[0.04] hover:text-accent"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-accent" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Drawer Footer / CTAs */}
        <div className="border-t border-line/60 pt-6 mt-6 flex flex-col gap-4">
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 bg-accent px-5 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(255,106,26,0.4)]"
          >
            <span>GET A QUOTE</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex flex-col gap-2 pt-2 text-xs text-ink-dim">
            {SITE.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors py-0.5"
              >
                <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>{phone}</span>
              </a>
            ))}
            {SITE.email && (
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors py-0.5"
              >
                <Mail className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>{SITE.email}</span>
              </a>
            )}
            {SITE.address && (
              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors py-0.5 group"
              >
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5 group-hover:text-accent-hover" />
                <span className="leading-snug text-[11px] group-hover:underline">{SITE.address}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-ink-dim transition-colors hover:bg-white/10 hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}

