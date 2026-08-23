import { Metadata } from "next";
import { ServiceSchema, BreadcrumbSchema } from "@/components/seo/Schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Metal Fabrication in Ahmedabad | Petvin Febtech",
  description:
    "Looking for custom metal fabrication in Ahmedabad? We manufacture custom brackets, machine components, and industrial sheet metal parts from prototypes to production batches.",
  openGraph: {
    title: "Custom Metal Fabrication in Ahmedabad | Petvin Febtech",
    description:
      "We manufacture custom brackets, machine components, and industrial sheet metal parts from prototypes to production batches in Ahmedabad.",
    url: "https://petvinfebtech.com/custom-metal-fabrication",
  },
};

export default function CustomMetalFabricationPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://petvinfebtech.com" },
          { name: "Custom Metal Fabrication", url: "https://petvinfebtech.com/custom-metal-fabrication" },
        ]}
      />
      <ServiceSchema
        name="Custom Metal Fabrication"
        description="Custom brackets, panels, enclosures, and industrial parts manufacturing in Ahmedabad."
        url="https://petvinfebtech.com/custom-metal-fabrication"
      />

      <Section alt className="pt-24 md:pt-32">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl lg:text-6xl">
            Custom Metal Fabrication in Ahmedabad
          </h1>
          <p className="mt-6 text-lg text-ink-dim max-w-2xl">
            We specialize in bespoke metal manufacturing solutions. Whether you need a one-off prototype or a continuous supply of custom sheet metal parts, our facility is equipped to handle your unique requirements.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Products" title="What We Fabricate" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Custom Brackets & Connectors</h3>
            <p className="text-ink-dim">Durable, precisely cut and bent brackets tailored to your assembly requirements.</p>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Machine Components</h3>
            <p className="text-ink-dim">Internal sheet metal parts, chassis, and supports for industrial machinery.</p>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Industrial Panels & Enclosures</h3>
            <p className="text-ink-dim">Custom-sized electrical boxes, control panels, and protective housings.</p>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-2">Architectural Metal Parts</h3>
            <p className="text-ink-dim">Decorative and structural sheet metal elements for construction and interior fit-outs.</p>
          </div>
        </div>
      </Section>

      <Section alt>
        <div className="flex flex-col items-center justify-center text-center gap-6 border border-line bg-bg p-16">
          <h2 className="font-display text-3xl uppercase text-ink">Ready to bring your design to life?</h2>
          <p className="text-ink-dim max-w-lg">
            Send us your drawing for a detailed, no-obligation quote on your custom metal fabrication project.
          </p>
          <Link
            href="/contact"
            className="mt-4 bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
          >
            Send Your Drawing for a Quote
          </Link>
        </div>
      </Section>
    </>
  );
}
