import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { CapabilitiesGrid } from "@/components/sections/CapabilitiesGrid";
import { IndustriesChips } from "@/components/sections/IndustriesChips";

export const metadata: Metadata = {
  title: "Capabilities & Products — Petvin Febtech",
};

export default function ProductsPage() {
  return (
    <>
      <Section className="pt-16">
        <SectionHeading
          eyebrow="What We Do"
          title="Capabilities"
          description="From a single custom bracket to a scheduled monthly run — here's what goes through our shop."
        />
        <CapabilitiesGrid />
      </Section>

      <Section alt>
        <SectionHeading eyebrow="Who We Work With" title="Industries We Serve" />
        <IndustriesChips />
      </Section>
    </>
  );
}
