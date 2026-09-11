import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg pt-16 pb-8 text-sm text-ink-dim">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-8 pb-12 border-b border-line/60">
          {/* Col 1: Logo & Tagline (3 cols) */}
          <div className="flex flex-col gap-4 md:col-span-4 lg:col-span-3">
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

          {/* Col 2, 3, 4: Company, Capabilities, Industries grouped close together (5 cols) */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:col-span-8 lg:col-span-5">
            {/* Company */}
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

            {/* Capabilities */}
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

            {/* Industries */}
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
          </div>

          {/* Col 5: Contact Us - Expanded Width (4 cols) */}
          <div className="flex flex-col gap-3 md:col-span-12 lg:col-span-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              CONTACT US
            </h4>
            <ul className="flex flex-col gap-3 text-xs text-ink-dim">
              {SITE.phones.map((phone) => (
                <li key={phone} className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-accent transition-colors font-medium">
                    {phone}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-accent transition-colors font-medium">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors leading-relaxed hover:underline max-w-sm"
                >
                  {SITE.address}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-ink-dimmer sm:flex-row">
          <p>© {new Date().getFullYear()} Petvin Febtech. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-ink transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
