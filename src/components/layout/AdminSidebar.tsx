"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/visits", label: "Company Visits" },
  { href: "/admin/costing", label: "Costing Calculator" },
  { href: "/admin/portfolio", label: "Our Work" },
  { href: "/admin/users", label: "Employees", adminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-[100dvh] md:h-screen w-64 flex-col border-r border-line bg-bg-alt">
      <div className="border-b border-line px-6 py-5">
        <div className="flex items-center gap-2.5 font-display text-base uppercase tracking-wide text-ink">
          <span className="h-3 w-3 bg-accent [clip-path:polygon(0_0,100%_0,100%_70%,70%_100%,0_100%)]" />
          Shreeji Admin
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {LINKS.filter((link) => !link.adminOnly || session?.user.role === "ADMIN").map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-sm px-3.5 py-2.5 text-sm transition-colors",
                isActive ? "bg-accent/10 text-accent" : "text-ink-dim hover:bg-bg-light hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-light font-mono text-xs text-ink-dim">
            {session?.user.name ? getInitials(session.user.name) : "--"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{session?.user.name}</p>
            <p className="truncate text-xs text-ink-dimmer">{session?.user.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full border border-line py-2 text-xs uppercase tracking-wide text-ink-dim hover:border-ink-dim hover:text-ink"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
