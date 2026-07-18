import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ContactForm } from "@/components/sections/ContactForm";
import { SITE } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact Us — Petvin Febtech",
};

function InfoBlock({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="mb-7">
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">{label}</div>
      {href ? (
        <a href={href} className="text-base text-ink transition-colors hover:text-accent">
          {value}
        </a>
      ) : (
        <div className="text-base text-ink">{value}</div>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Section className="pt-16">
      <SectionHeading
        eyebrow="Get In Touch"
        title="Contact Us"
        description="Have a drawing ready or just an idea? Send it over and we'll get back to you with a quote."
      />

      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <InfoBlock label="Company" value={SITE.name} />
          <InfoBlock label="Phone / WhatsApp" value={SITE.phone} href={`tel:${SITE.phone.replace(/\s/g, "")}`} />
          <InfoBlock label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
          <InfoBlock label="Working Hours" value={SITE.hours} />
          <InfoBlock label="Address" value={SITE.address} />
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
