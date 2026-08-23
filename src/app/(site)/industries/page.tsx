import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/Schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { IndustriesChips } from "@/components/sections/IndustriesChips";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Industries We Serve | Petvin Febtech",
  description:
    "Petvin Febtech manufactures sheet metal components for automotive, furniture, electrical enclosures, signage, HVAC, and architecture industries.",
  openGraph: {
    title: "Industries We Serve | Petvin Febtech",
    description:
      "Petvin Febtech manufactures sheet metal components for various industries including automotive, furniture, HVAC, and more.",
    url: "https://petvinfebtech.com/industries",
  },
};

export default function IndustriesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://petvinfebtech.com" },
          { name: "Industries", url: "https://petvinfebtech.com/industries" },
        ]}
      />

      <Section alt className="pt-24 md:pt-32">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl lg:text-6xl">
            Industries We Serve
          </h1>
          <p className="mt-6 text-lg text-ink-dim max-w-2xl">
            Our precision laser cutting and CNC bending services cater to a wide array of industrial sectors. We understand the specific material and tolerance requirements for each industry.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Sectors" title="Industrial Applications" />
        <div className="mt-12">
          {/* Reusing existing component for now */}
          <IndustriesChips />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="border border-line p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Automotive</h3>
            <p className="text-ink-dim">Chassis parts, custom mounting brackets, and exhaust components.</p>
          </div>
          <div className="border border-line p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Furniture & Interiors</h3>
            <p className="text-ink-dim">Metal frames, decorative panels, and precise structural supports.</p>
          </div>
          <div className="border border-line p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Electrical Enclosures</h3>
            <p className="text-ink-dim">NEMA-rated boxes, control panels, and server rack components.</p>
          </div>
          <div className="border border-line p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Signage & Display</h3>
            <p className="text-ink-dim">Intricate laser-cut logos, lettering, and retail display structures.</p>
          </div>
          <div className="border border-line p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">HVAC & Ducting</h3>
            <p className="text-ink-dim">Precision flanges, ventilation covers, and heavy-duty duct supports.</p>
          </div>
          <div className="border border-line p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Architecture & Railings</h3>
            <p className="text-ink-dim">Custom balustrades, decorative screens, and façade panels.</p>
          </div>
        </div>
      </Section>

      <Section alt>
        <div className="flex flex-col items-center justify-center text-center gap-6 border border-line bg-bg p-16">
          <h2 className="font-display text-3xl uppercase text-ink">Have a Project in Mind?</h2>
          <p className="text-ink-dim max-w-lg">
            Let's discuss how our fabrication capabilities can meet your industry's specific standards.
          </p>
          <Link
            href="/contact"
            className="mt-4 bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
          >
            Contact Us
          </Link>
        </div>
      </Section>
    </>
  );
}
