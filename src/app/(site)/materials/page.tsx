import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/Schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sheet Metal Materials We Work With | Petvin Febtech",
  description:
    "Petvin Febtech processes Mild Steel (MS), Stainless Steel (SS), and Aluminium for precision laser cutting and CNC bending in Ahmedabad.",
  openGraph: {
    title: "Sheet Metal Materials We Work With | Petvin Febtech",
    description:
      "We process Mild Steel (MS), Stainless Steel (SS), and Aluminium for precision laser cutting and CNC bending.",
    url: "https://petvinfebtech.com/materials",
  },
};

export default function MaterialsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://petvinfebtech.com" },
          { name: "Materials", url: "https://petvinfebtech.com/materials" },
        ]}
      />

      <Section alt className="pt-24 md:pt-32">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl lg:text-6xl">
            Sheet Metal Materials We Process
          </h1>
          <p className="mt-6 text-lg text-ink-dim max-w-2xl">
            Our state-of-the-art 3 kW fiber laser cutting and 160-ton CNC bending machines are calibrated to handle a variety of metals with distinct thicknesses and structural properties.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Capabilities" title="Metals & Specifications" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-2xl uppercase text-ink mb-4">Mild Steel (MS)</h3>
            <p className="text-ink-dim mb-4">
              Cost-effective and highly versatile for structural components, brackets, and machine enclosures.
            </p>
            <ul className="space-y-2 text-sm text-ink-dim">
              <li>• Excellent weldability</li>
              <li>• High tensile strength</li>
              <li>• Ideal for general fabrication</li>
            </ul>
          </div>
          
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-2xl uppercase text-ink mb-4">Stainless Steel (SS)</h3>
            <p className="text-ink-dim mb-4">
              Provides superior corrosion resistance and hygiene, perfect for food processing, medical, and architectural applications.
            </p>
            <ul className="space-y-2 text-sm text-ink-dim">
              <li>• High corrosion resistance</li>
              <li>• Excellent aesthetic finish</li>
              <li>• Suitable for harsh environments</li>
            </ul>
          </div>
          
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-2xl uppercase text-ink mb-4">Aluminium</h3>
            <p className="text-ink-dim mb-4">
              Lightweight yet strong, aluminium is often used in automotive parts, aerospace, and electronics enclosures.
            </p>
            <ul className="space-y-2 text-sm text-ink-dim">
              <li>• High strength-to-weight ratio</li>
              <li>• Natural corrosion resistance</li>
              <li>• Non-magnetic</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section alt>
        <div className="flex flex-col items-center justify-center text-center gap-6 border border-line bg-bg p-16">
          <h2 className="font-display text-3xl uppercase text-ink">Unsure about material selection?</h2>
          <p className="text-ink-dim max-w-lg">
            Our engineers can help you choose the right material and thickness for your specific application and budget.
          </p>
          <Link
            href="/contact"
            className="mt-4 bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
          >
            Consult With Us
          </Link>
        </div>
      </Section>
    </>
  );
}
