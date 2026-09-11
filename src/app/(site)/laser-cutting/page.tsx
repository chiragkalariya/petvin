import { Metadata } from "next";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo/Schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laser Cutting Service in Ahmedabad | Petvin Febtech",
  description:
    "Petvin Febtech provides precision 3 kW fiber laser cutting service in Ahmedabad for MS, SS, and Aluminium. We handle prototype jobs to bulk production with high accuracy.",
  openGraph: {
    title: "Laser Cutting Service in Ahmedabad | Petvin Febtech",
    description:
      "Petvin Febtech provides precision 3 kW fiber laser cutting service in Ahmedabad for MS, SS, and Aluminium. We handle prototype jobs to bulk production.",
    url: "https://petvinfebtech.com/laser-cutting",
  },
};

const FAQS = [
  {
    question: "What is fiber laser cutting?",
    answer: "Fiber laser cutting uses a high-powered laser to cut sheet metal with extreme precision, minimal heat distortion, and excellent edge quality compared to traditional methods.",
  },
  {
    question: "What materials can Petvin Febtech laser cut?",
    answer: "We process Mild Steel (MS), Stainless Steel (SS), and Aluminium using our 3 kW fiber laser cutting machine.",
  },
  {
    question: "Can I send a DXF or DWG drawing?",
    answer: "Yes, we accept standard 2D vector formats like DXF and DWG for quick programming and nesting.",
  },
  {
    question: "Do you handle prototype and bulk production?",
    answer: "Yes, our setup allows us to cater to both single-piece prototypes and scheduled bulk production runs.",
  },
];

export default function LaserCuttingPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://petvinfebtech.com" },
          { name: "Laser Cutting", url: "https://petvinfebtech.com/laser-cutting" },
        ]}
      />
      <ServiceSchema
        name="Laser Cutting Service"
        description="Precision fiber laser cutting service in Ahmedabad for MS, SS, and Aluminium."
        url="https://petvinfebtech.com/laser-cutting"
      />
      <FAQSchema faqs={FAQS} />

      <Section alt className="pt-24 md:pt-32">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl uppercase text-ink md:text-5xl lg:text-6xl">
            Precision Fiber Laser Cutting Service in Ahmedabad
          </h1>
          <p className="mt-6 text-lg text-ink-dim max-w-2xl">
            We provide fast, accurate, and high-quality sheet metal laser cutting services using our 3 kW fiber laser machine. Whether you need a single prototype or a bulk production run, we deliver precision parts in MS, SS, and Aluminium.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Capabilities" title="Laser Cutting Capabilities" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-4">Materials</h3>
            <ul className="space-y-2 text-ink-dim">
              <li>Mild Steel (MS)</li>
              <li>Stainless Steel (SS)</li>
              <li>Aluminium</li>
            </ul>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-4">Production</h3>
            <ul className="space-y-2 text-ink-dim">
              <li>Prototype Jobs</li>
              <li>Small Batch Runs</li>
              <li>Bulk Production</li>
              <li>Job Work Services</li>
            </ul>
          </div>
          <div className="border border-line bg-bg p-8">
            <h3 className="font-display text-xl uppercase text-ink mb-4">Workflow</h3>
            <ul className="space-y-2 text-ink-dim">
              <li>DXF / DWG File Support</li>
              <li>Strict Quality Inspection</li>
              <li>Fast Turnaround Time</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section alt>
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mt-12 space-y-6 max-w-3xl">
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">What is fiber laser cutting?</h4>
            <p className="text-ink-dim mt-2">Fiber laser cutting uses a high-powered laser to cut sheet metal with extreme precision, minimal heat distortion, and excellent edge quality compared to traditional methods.</p>
          </div>
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">What materials can Petvin Febtech laser cut?</h4>
            <p className="text-ink-dim mt-2">We process Mild Steel (MS), Stainless Steel (SS), and Aluminium using our 3 kW fiber laser cutting machine.</p>
          </div>
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">Can I send a DXF or DWG drawing?</h4>
            <p className="text-ink-dim mt-2">Yes, we accept standard 2D vector formats like DXF and DWG for quick programming and nesting.</p>
          </div>
          <div className="border-b border-line pb-6">
            <h4 className="font-bold text-ink">Do you handle prototype and bulk production?</h4>
            <p className="text-ink-dim mt-2">Yes, our setup allows us to cater to both single-piece prototypes and scheduled bulk production runs.</p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 border border-line bg-bg-alt p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl uppercase text-ink">Need a Quote for Laser Cutting?</h3>
            <p className="mt-2 text-sm text-ink-dim">Send us your drawing and requirements for an accurate estimate.</p>
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
