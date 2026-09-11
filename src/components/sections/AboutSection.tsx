import Link from "next/link";
import { ArrowRight, Target, ShieldCheck, Gauge, Award } from "lucide-react";

export function AboutSection() {
  const pillars = [
    {
      icon: Target,
      title: "Precision",
      desc: "High accuracy in every detail",
    },
    {
      icon: ShieldCheck,
      title: "Quality",
      desc: "Strict quality control at every stage",
    },
    {
      icon: Gauge,
      title: "Speed",
      desc: "On-time delivery, every time",
    },
    {
      icon: Award,
      title: "Reliability",
      desc: "Trusted by industries across India",
    },
  ];

  return (
    <section id="about" className="relative w-full py-24 bg-bg overflow-hidden border-t border-line/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="mb-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                ABOUT US
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.05]">
              Engineering Precision.<br />
              Delivering Excellence.
            </h2>

            {/* Paragraph */}
            <p className="mt-5 text-sm sm:text-base text-ink-dim leading-relaxed max-w-2xl">
              At Petvin Febtech, we combine advanced technology with skilled craftsmanship to deliver precision engineered components that power industries.
            </p>

            {/* 4 Feature Badges in a Row */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="flex flex-col gap-2 rounded-lg border border-line bg-bg-card/70 p-4 transition-all duration-200 hover:border-accent/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold uppercase text-white">
                        {p.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-ink-dimmer leading-snug">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Button */}
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-line-bright bg-bg-card px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:border-accent hover:text-accent"
              >
                <span>KNOW MORE ABOUT US</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: High Quality Part Image (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-alt/50 shadow-2xl">
              <img
                src="/images/about_metal_part.jpg"
                alt="Precision Laser Cut and CNC Bent Sheet Metal Chassis"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-40" />
            </div>
            {/* Subtle glow backdrop */}
            <div className="absolute -inset-4 -z-10 rounded-full bg-accent/10 blur-3xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}
