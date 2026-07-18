import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { CapabilitiesGrid } from "@/components/sections/CapabilitiesGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { IndustriesChips } from "@/components/sections/IndustriesChips";
import { Section, SectionHeading } from "@/components/ui/Section";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section id="capabilities" alt>
        <SectionHeading
          eyebrow="What We Do"
          title="Capabilities"
          description="From a single custom bracket to a scheduled monthly run — here's what goes through our shop."
        />
        <CapabilitiesGrid />
      </Section>

      <Section id="industries">
        <SectionHeading eyebrow="Who We Work With" title="Industries We Serve" />
        <IndustriesChips />
      </Section>

      <Section id="process" alt>
        <SectionHeading eyebrow="How We Work" title="From Drawing to Delivery" />
        <ProcessSteps />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 border border-line bg-bg-alt p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl uppercase text-ink">Have a drawing ready?</h3>
            <p className="mt-2 text-sm text-ink-dim">Send it over and we&apos;ll get back with a quote.</p>
          </div>
          <Link
            href="/contact"
            className="whitespace-nowrap bg-accent px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
          >
            Request a Quote
          </Link>
        </div>
      </Section>
    </>
  );
}
