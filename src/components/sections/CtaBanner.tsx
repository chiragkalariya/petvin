import Link from "next/link";
import { ArrowRight, Zap, Coins, ShieldCheck } from "lucide-react";

export function CtaBanner() {
  const valueProps = [
    {
      icon: Zap,
      title: "Quick Response",
      desc: "Get reply within 24 hours",
    },
    {
      icon: Coins,
      title: "Best Price",
      desc: "Competitive & transparent pricing",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assured",
      desc: "We never compromise on quality",
    },
  ];

  return (
    <section className="relative w-full py-20 bg-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-bg-card via-bg-alt to-bg-card p-8 md:p-12 lg:p-14 shadow-2xl">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-1/4 -z-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Col: Heading & CTA Button (5 cols) */}
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.05]">
                HAVE A <span className="text-accent text-glow">PROJECT</span><br />
                IN MIND?
              </h2>
              <p className="mt-4 text-sm text-ink-dim leading-relaxed max-w-md">
                Send us your drawing and let&apos;s bring your ideas to life.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 bg-accent px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(255,106,26,0.45)]"
                >
                  <span>GET A QUOTE</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Center Col: Metal Part Graphic (3 cols) */}
            <div className="hidden lg:flex lg:col-span-3 items-center justify-center">
              <div className="relative h-44 w-44 overflow-hidden rounded-xl">
                <img
                  src="/images/cta_part_preview.jpg"
                  alt="Precision Laser Cut Sheet Metal Part"
                  className="h-full w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
              </div>
            </div>

            {/* Right Col: 3 Value Props (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {valueProps.map((vp) => {
                const Icon = vp.icon;
                return (
                  <div key={vp.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
                        {vp.title}
                      </h4>
                      <p className="text-xs text-ink-dimmer mt-0.5">
                        {vp.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
