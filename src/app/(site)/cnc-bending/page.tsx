import { Metadata } from "next";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo/Schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CNC Bending Service in Ahmedabad | Petvin Febtech",
  description:
    "Petvin Febtech offers precision CNC sheet metal bending services in Ahmedabad. We form custom brackets, panels, and enclosures for prototype and production work.",
  openGraph: {
    title: "CNC Bending Service in Ahmedabad | Petvin Febtech",
    description:
      "Petvin Febtech offers precision CNC sheet metal bending services in Ahmedabad for custom brackets, panels, and enclosures.",
    url: "https://petvinfebtech.com/cnc-bending",
  },
};

const FAQS = [
  {
    question: "What is CNC sheet metal bending?",
    answer: "It is a manufacturing process where a CNC-controlled press brake is used to bend and form sheet metal into desired shapes with high precision and repeatability.",
  },
  {
    question: "Can you bend custom brackets and panels?",
    answer: "Yes, forming custom brackets, panels, and enclosures is our specialty.",
  },
  {
    question: "Can you handle prototype quantities?",
    answer: "Absolutely. We take on both low-volume prototype work and high-volume production batches.",
  },
  {
    question: "What information is required for a bending quotation?",
    answer: "Please provide a 2D drawing (DXF/DWG/PDF), 3D model if available, material type, thickness, and required quantities.",
  },
];

export default function CNCBendingPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://petvinfebtech.com" },
          { name: "CNC Bending", url: "https://petvinfebtech.com/cnc-bending" },
        ]}
      />
      <ServiceSchema
        name="CNC Bending Service"
        description="Precision CNC sheet metal bending service in Ahmedabad for custom brackets, panels, and enclosures."
        url="https://petvinfebtech.com/cnc-bending"
      />
      <FAQSchema faqs={FAQS} />

      <Section alt className="pt-24 md:pt-32">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl lg:text-6xl">
            CNC Sheet Metal Bending Service in Ahmedabad
          </h1>
          <p className="mt-6 text-lg text-ink-dim max-w-2xl">
            We provide highly accurate CNC press brake bending services. From simple angles to complex multi-bend parts, we ensure strict repeatability across prototype and bulk production runs for custom components.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Applications" title="What We Bend" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-lg uppercase text-ink mb-4">Custom Brackets</h3>
            <p className="text-sm text-ink-dim">Heavy-duty structural brackets and precision mounting components.</p>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-lg uppercase text-ink mb-4">Panels</h3>
            <p className="text-sm text-ink-dim">Sheet metal panels for machinery, control rooms, and architecture.</p>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-lg uppercase text-ink mb-4">Enclosures</h3>
            <p className="text-sm text-ink-dim">Electrical and electronic enclosures with precise dimensional accuracy.</p>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-lg uppercase text-ink mb-4">Custom Parts</h3>
            <p className="text-sm text-ink-dim">Complex formed components tailored to specific industrial requirements.</p>
          </div>
        </div>
      </Section>

      <Section alt>
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mt-12 space-y-6 max-w-3xl">
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">What is CNC sheet metal bending?</h4>
            <p className="text-ink-dim mt-2">It is a manufacturing process where a CNC-controlled press brake is used to bend and form sheet metal into desired shapes with high precision and repeatability.</p>
          </div>
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">Can you bend custom brackets and panels?</h4>
            <p className="text-ink-dim mt-2">Yes, forming custom brackets, panels, and enclosures is our specialty.</p>
          </div>
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">Can you handle prototype quantities?</h4>
            <p className="text-ink-dim mt-2">Absolutely. We take on both low-volume prototype work and high-volume production batches.</p>
          </div>
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">What information is required for a bending quotation?</h4>
            <p className="text-ink-dim mt-2">Please provide a 2D drawing (DXF/DWG/PDF), 3D model if available, material type, thickness, and required quantities.</p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 border border-line bg-bg-alt p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl uppercase text-ink">Ready to Start Your Project?</h3>
            <p className="mt-2 text-sm text-ink-dim">Contact us for reliable CNC bending services.</p>
          </div>
          <Link
            href="/contact"
            className="whitespace-nowrap bg-accent px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-bg hover:bg-accent-light"
          >
            Get in Touch
          </Link>
        </div>
      </Section>
    </>
  );
}
