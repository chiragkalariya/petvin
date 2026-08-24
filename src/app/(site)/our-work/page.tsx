import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ShieldCheck, Zap, Award, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Manufacturing Portfolio & Job Work Projects | Petvin Febtech Ahmedabad",
  description:
    "Explore our manufacturing portfolio of precision fiber laser cutting, CNC bending, and sheet metal fabrication job-work projects in Ahmedabad, Gujarat. Fast turnaround & high accuracy.",
  openGraph: {
    title: "Manufacturing Portfolio & Job Work | Petvin Febtech",
    description:
      "Precision Parts. Real Manufacturing Capability. Laser Cutting & CNC Bending Job Work in Ahmedabad.",
    url: "https://petvinfebtech.com/our-work",
  },
};

export default function OurWorkPage() {
  const stats = [
    { label: "Parts Fabricated", value: "50,000+", icon: Award },
    { label: "Cutting Tolerance", value: "±0.05 mm", icon: Zap },
    { label: "Bending Capacity", value: "160 Ton", icon: ShieldCheck },
    { label: "Quote Turnaround", value: "< 24 Hours", icon: Clock },
  ];

  return (
    <>
      {/* Page Hero Header */}
      <section className="relative w-full overflow-hidden bg-bg pt-16 pb-14 border-b border-line/50">
        {/* Subtle glowing ambient backdrop */}
        <div className="absolute top-0 right-1/3 -z-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              JOB WORK & MANUFACTURING PORTFOLIO
            </span>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.0]">
              OUR WORK
            </h1>
            <p className="mt-4 text-base text-ink-dim leading-relaxed">
              Precision Parts. Real Manufacturing Capability. A comprehensive showcase of B2B job work, OEM components, and custom sheet-metal assemblies produced on our 3 kW Fiber Laser and 160 Ton CNC Press Brake in Ahmedabad.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 pt-6 border-t border-line/60">
            {stats.map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-display text-lg font-bold text-white block">
                      {st.value}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Portfolio Showcase Grid */}
      <section className="relative w-full py-16 bg-bg">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PortfolioGrid />
        </div>
      </section>

      {/* Conversion Banner */}
      <CtaBanner />
    </>
  );
}
