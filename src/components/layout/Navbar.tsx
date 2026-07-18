import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site-content";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bg">
      <nav className="flex w-full items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg uppercase tracking-wide text-ink">
          <span className="h-3 w-3 bg-accent [clip-path:polygon(0_0,100%_0,100%_70%,70%_100%,0_100%)]" />
          {SITE.name}
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          <div className="flex gap-8 text-sm tracking-wide text-ink-dim">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            className="border border-accent px-5 py-2.5 text-xs uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-bg"
          >
            Get a Quote
          </Link>
        </div>

        <MobileMenu />
      </nav>
    </header>
  );
}
