import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";

export const metadata: Metadata = {
  title: "Our Work — Shreeji Enterprise",
};

export default function OurWorkPage() {
  return (
    <Section className="pt-16">
      <SectionHeading
        eyebrow="Portfolio"
        title="Our Work"
        description="A sample of what's come off the floor. Photos below are placeholders — real project shots go here."
      />
      <PortfolioGrid />
    </Section>
  );
}
