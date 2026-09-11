import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Phone } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SITE } from "@/lib/site-content";
import legalData from "@/content/legal.json";

export const metadata: Metadata = {
  title: "Privacy Policy | Petvin Febtech",
  description: "Privacy Policy for Petvin Febtech. Learn how we handle your personal information and protect proprietary CAD drawings.",
};

export default function PrivacyPolicyPage() {
  const { privacyPolicy } = legalData;

  return (
    <Section className="pt-16 pb-24">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-dimmer hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <SectionHeading
        eyebrow="Legal & Data Protection"
        title={privacyPolicy.title}
        description={`Last Updated: ${privacyPolicy.lastUpdated}`}
      />

      <div className="max-w-4xl space-y-8">
        <div className="rounded-xl border border-line bg-bg-card p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-white">
                Our Commitment to Your Privacy
              </h3>
              <p className="mt-2 text-sm text-ink-dim leading-relaxed">
                {privacyPolicy.description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {privacyPolicy.sections.map((section) => (
            <div
              key={section.heading}
              className="rounded-xl border border-line/80 bg-bg-alt/40 p-6 md:p-8 transition-colors hover:border-line"
            >
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm text-ink-dim leading-relaxed">
                {section.content}
              </p>
              {"points" in section && Array.isArray(section.points) && (
                <ul className="mt-4 space-y-2 pl-4 list-disc marker:text-accent text-sm text-ink-dim">
                  {section.points.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Contact info box */}
        <div className="rounded-xl border border-line bg-bg-card p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Questions Regarding Privacy?
            </h3>
            <p className="text-xs text-ink-dimmer mt-1">
              Reach out to our team directly for any data or confidentiality inquiries.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-alt px-4 py-2.5 text-white hover:border-accent hover:text-accent transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              <span>{SITE.email}</span>
            </a>
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-alt px-4 py-2.5 text-white hover:border-accent hover:text-accent transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span>{SITE.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
