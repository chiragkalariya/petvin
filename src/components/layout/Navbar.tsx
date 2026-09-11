import Link from "next/link";
import { NAV_LINKS } from "@/lib/site-content";
import { MobileMenu } from "./MobileMenu";
import { ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-bg/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/images/petvin_febtech_updated.svg"
            alt="Petvin Febtech"
            className="w-32 md:w-36 h-auto transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <div className="flex gap-7 text-[13px] font-medium tracking-wide text-ink-dim">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(255,106,26,0.4)]"
          >
            <span>GET A QUOTE</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <MobileMenu />
      </nav>
    </header>
  );
}
