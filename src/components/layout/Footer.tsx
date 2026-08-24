import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg pt-16 pb-8 text-sm text-ink-dim">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 pb-12 border-b border-line/60">
          {/* Col 1: Logo */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <img
                src="/images/petvin_febtech_updated.svg"
                alt="Petvin Febtech"
                className="w-36 h-auto"
              />
            </Link>
            <p className="text-xs text-ink-dimmer max-w-xs leading-relaxed">
              Precision Laser Cutting, CNC Bending & Sheet Metal Fabrication in Ahmedabad.
            </p>
          </div>

          {/* Col 2: Company */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              COMPANY
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-dim">
              <li>
                <Link href="/about" className="transition-colors hover:text-accent">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/our-work" className="transition-colors hover:text-accent">
                  Our Work
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-accent">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Capabilities */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              CAPABILITIES
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-dim">
              <li>
                <Link href="/laser-cutting" className="transition-colors hover:text-accent">
                  Laser Cutting
                </Link>
              </li>
              <li>
                <Link href="/cnc-bending" className="transition-colors hover:text-accent">
                  CNC Bending
                </Link>
              </li>
              <li>
                <Link href="/custom-metal-fabrication" className="transition-colors hover:text-accent">
                  Fabrication
                </Link>
              </li>
              <li>
                <Link href="/sheet-metal-fabrication" className="transition-colors hover:text-accent">
                  Prototype to Bulk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Industries */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              INDUSTRIES
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-dim">
              <li>
                <Link href="/#industries" className="transition-colors hover:text-accent">
                  Automotive
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="transition-colors hover:text-accent">
                  Electrical
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="transition-colors hover:text-accent">
                  HVAC
                </Link>
              </li>
              <li>
                <Link href="/#industries" className="transition-colors hover:text-accent">
                  Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Us */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              CONTACT US
            </h4>
            <ul className="flex flex-col gap-3 text-xs text-ink-dim">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                <a href={`tel:${SITE.phone}`} className="hover:text-accent">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
            </ul>

            {/* Socials */}
            <div className="mt-2 flex items-center gap-4 text-ink-dim">
              <a
                href="#"
                aria-label="Facebook"
                className="transition-colors hover:text-accent"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="transition-colors hover:text-accent"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.4 9.74v-8.37H5.06v8.37z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="transition-colors hover:text-accent"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-ink-dimmer sm:flex-row">
          <p>© {new Date().getFullYear()} Petvin Febtech. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-ink">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
