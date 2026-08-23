import { Metadata } from "next";
import { ServiceSchema, BreadcrumbSchema } from "@/components/seo/Schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Sheet Metal Fabrication in Ahmedabad | Petvin Febtech",
  description:
    "End-to-end custom sheet metal fabrication in Ahmedabad. Our full workflow includes drawing review, laser cutting, CNC bending, and quality check for industrial parts.",
  openGraph: {
    title: "Custom Sheet Metal Fabrication in Ahmedabad | Petvin Febtech",
    description:
      "End-to-end custom sheet metal fabrication in Ahmedabad. Full workflow from drawing to finished part.",
    url: "https://petvinfebtech.com/sheet-metal-fabrication",
  },
};

export default function SheetMetalFabricationPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://petvinfebtech.com" },
          { name: "Sheet Metal Fabrication", url: "https://petvinfebtech.com/sheet-metal-fabrication" },
        ]}
      />
      <ServiceSchema
        name="Custom Sheet Metal Fabrication"
        description="End-to-end custom sheet metal fabrication in Ahmedabad."
        url="https://petvinfebtech.com/sheet-metal-fabrication"
      />

      <Section alt className="pt-24 md:pt-32">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl lg:text-6xl">
            Custom Sheet Metal Fabrication in Ahmedabad
          </h1>
          <p className="mt-6 text-lg text-ink-dim max-w-2xl">
            We offer comprehensive sheet metal job work and manufacturing services. We transform flat sheet metal into finished, precision-engineered products tailored to your exact specifications.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Process" title="Our Fabrication Workflow" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {[
            { step: "1", title: "Drawing & CAD", desc: "Reviewing DXF/DWG files and planning the most efficient nesting." },
            { step: "2", title: "Material Selection", desc: "Sourcing and verifying high-quality MS, SS, or Aluminium." },
            { step: "3", title: "Laser Cutting", desc: "Precision cutting using our advanced 3 kW fiber laser." },
            { step: "4", title: "Deburring", desc: "Removing sharp edges and preparing surfaces for the next steps." },
            { step: "5", title: "CNC Bending", desc: "Forming the parts using accurate CNC press brake technology." },
            { step: "6", title: "Quality Check & Dispatch", desc: "Final dimensional inspection before secure packaging and dispatch." },
          ].map((s) => (
            <div key={s.step} className="border border-line bg-bg p-8 relative">
              <span className="absolute top-4 right-4 text-4xl font-display text-line font-bold">{s.step}</span>
              <h3 className="font-display text-xl uppercase text-ink mb-4">{s.title}</h3>
              <p className="text-ink-dim">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section alt>
        <div className="flex flex-col items-start gap-6 border border-line bg-bg p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl uppercase text-ink">Discuss Your Manufacturing Needs</h3>
            <p className="mt-2 text-sm text-ink-dim">Looking for a reliable sheet metal components manufacturer?</p>
          </div>
          <Link
            href="/contact"
            className="whitespace-nowrap bg-accent px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
          >
            Contact Us Today
          </Link>
        </div>
      </Section>
    </>
  );
}
