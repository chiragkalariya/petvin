import Link from "next/link";
import { Eyebrow } from "@/components/ui/Section";
import { SpecPlate, SpecRow } from "@/components/ui/Card";
import { MACHINE_SPECS } from "@/lib/site-content";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <Eyebrow>Sheet Metal Fabrication</Eyebrow>
          <h1 className="font-display text-5xl uppercase leading-[1.05] text-ink md:text-7xl">
            Precision cut.
            <br />
            <span className="text-accent">Precisely bent.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] text-ink-dim">
            Petvin Febtech turns raw sheet metal into finished parts — fast, accurate, and built to
            your drawing. One shop, from laser cutting through final bend.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="bg-accent px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
            >
              Request a Quote
            </Link>
            <Link
              href="/our-work"
              className="border border-line px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-ink-dim"
            >
              See Our Work
            </Link>
          </div>
        </div>

        <SpecPlate>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
            Machine Nameplate
          </div>
          {MACHINE_SPECS.map((spec) => (
            <SpecRow key={spec.label} k={spec.label} v={spec.value} />
          ))}
        </SpecPlate>
      </div>
    </section>
  );
}
