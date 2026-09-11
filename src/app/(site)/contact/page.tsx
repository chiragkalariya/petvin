import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ContactForm } from "@/components/sections/ContactForm";
import { SITE } from "@/lib/site-content";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Quote for Sheet Metal Fabrication | Petvin Febtech",
  description: "Contact Petvin Febtech in Ahmedabad for a quotation on laser cutting, CNC bending, and custom sheet metal fabrication. Send your drawing today.",
  openGraph: {
    title: "Contact Us | Quote for Sheet Metal Fabrication | Petvin Febtech",
    description: "Contact Petvin Febtech in Ahmedabad for a quotation on laser cutting, CNC bending, and custom sheet metal fabrication.",
    url: "https://petvinfebtech.com/contact",
  }
};

export default function ContactPage() {
  return (
    <Section className="pt-16">
      <SectionHeading
        eyebrow="Get In Touch"
        title="Contact Us"
        description="Have a drawing ready or just an idea? Send it over and we'll get back to you with a quote."
      />

      <div className="grid gap-14 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-bg-card p-6 space-y-6">
            <div>
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Company</div>
              <div className="text-xl font-bold text-white font-display uppercase tracking-wide">{SITE.name}</div>
              <div className="text-xs text-ink-dim mt-0.5">{SITE.tagline}</div>
            </div>

            <div>
              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Phone / WhatsApp</div>
              <div className="flex flex-col gap-2.5">
                {SITE.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2.5 text-base text-ink transition-colors hover:text-accent font-medium group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg-alt text-accent group-hover:border-accent">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{phone}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Email</div>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 text-base text-ink transition-colors hover:text-accent font-medium group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg-alt text-accent group-hover:border-accent">
                  <Mail className="h-4 w-4" />
                </div>
                <span>{SITE.email}</span>
              </a>
            </div>

            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Working Hours</div>
              <div className="flex items-center gap-2.5 text-sm text-ink-dim">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg-alt text-accent">
                  <Clock className="h-4 w-4" />
                </div>
                <span>{SITE.hours}</span>
              </div>
            </div>

            <div>
              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Factory Location & Address</div>
              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-line/80 bg-bg-alt/70 p-4 transition-all hover:border-accent hover:bg-bg-alt hover:shadow-[0_4px_20px_rgba(255,106,26,0.15)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-accent group-hover:border-accent mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-ink group-hover:text-white leading-relaxed">
                      {SITE.address}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:underline">
                      <span>View on Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
