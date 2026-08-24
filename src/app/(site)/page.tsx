import { Hero } from "@/components/sections/Hero";
import { CapabilitiesGrid } from "@/components/sections/CapabilitiesGrid";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { MachinesSection } from "@/components/sections/MachinesSection";
import { FeaturedPortfolio } from "@/components/sections/FeaturedPortfolio";
import { IndustriesChips } from "@/components/sections/IndustriesChips";
import { CtaBanner } from "@/components/sections/CtaBanner";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Core Capabilities */}
      <section id="capabilities" className="relative w-full py-24 bg-bg border-t border-line/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              WHAT WE DO
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              Our Core Capabilities
            </h2>
          </div>
          <CapabilitiesGrid />
        </div>
      </section>

      {/* 3. About Us */}
      <AboutSection />

      {/* 4. Our Process */}
      <section id="process" className="relative w-full py-24 bg-bg border-t border-line/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              OUR PROCESS
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              From Drawing to Delivery
            </h2>
          </div>
          <ProcessSteps />
        </div>
      </section>

      {/* 5. Our Machines */}
      <MachinesSection />

      {/* 6. Featured Portfolio & Work */}
      <FeaturedPortfolio />

      {/* 7. Industries We Serve */}
      <section id="industries" className="relative w-full py-24 bg-bg border-t border-line/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              INDUSTRIES WE SERVE
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              Built For Every Industry
            </h2>
          </div>
          <IndustriesChips />
        </div>
      </section>

      {/* 7. CTA Banner */}
      <CtaBanner />
    </>
  );
}
