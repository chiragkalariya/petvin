import type { Metadata } from "next";
import { Section, SectionHeading, Eyebrow } from "@/components/ui/Section";
import { SpecPlate, SpecRow } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About Us — Petvin Febtech",
};

export default function AboutPage() {
  return (
    <Section className="pt-16">
      <Eyebrow>About Us</Eyebrow>
      <h1 className="mb-10 max-w-2xl font-display text-3xl uppercase text-ink md:text-4xl">
        Built around two machines that do the heavy lifting.
      </h1>

      <div className="grid gap-14 md:grid-cols-2">
        <div className="space-y-4 text-[15.5px] text-ink-dim">
          <p>
            Petvin Febtech is a sheet metal fabrication shop. We don&apos;t outsource the two
            operations that matter most — cutting and bending happen under one roof, on our own
            equipment, so your drawing goes from file to finished part without changing hands.
          </p>
          <p>
            Our fiber laser handles clean, accurate cuts across a range of sheet thicknesses, and our
            CNC press brake takes it straight to final form — consistent angles, tight tolerances, no
            guesswork.
          </p>
          <p>Whether it&apos;s a one-off prototype or a repeat production run, we quote it straight and deliver it on time.</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm uppercase tracking-wide text-ink">Equipment on the floor</h4>
          <SpecPlate>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Cutting</div>
            <SpecRow k="Fiber Laser" v="190 kW" />
            <SpecRow k="Materials" v="MS / SS / AL / Brass" />
          </SpecPlate>
          <SpecPlate>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Bending</div>
            <SpecRow k="Press Brake" v="175 Ton CNC" />
            <SpecRow k="Tolerance" v="Tight, repeatable" />
          </SpecPlate>
        </div>
      </div>
    </Section>
  );
}
