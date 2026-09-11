import Link from "next/link";
import { CAPABILITIES } from "@/lib/site-content";
import { ArrowUpRight } from "lucide-react";

export function CapabilitiesGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CAPABILITIES.map((cap) => (
        <Link
          key={cap.num}
          href={cap.link || "/products"}
          className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-bg-card/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_8px_30px_rgba(255,106,26,0.15)]"
        >
          {/* Card Top: Image with Number Badge */}
          <div className="relative h-48 w-full overflow-hidden bg-bg-alt">
            {/* Number badge on top left */}
            <div className="absolute top-3 left-3 z-10 rounded-md border border-line-bright bg-bg/85 px-2.5 py-1 backdrop-blur-md">
              <span className="font-mono text-xs font-bold text-accent">{cap.num}</span>
            </div>

            <img
              src={cap.image}
              alt={cap.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />
          </div>

          {/* Card Body */}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white transition-colors group-hover:text-accent">
                {cap.title}
              </h3>
              <p className="mt-2 text-xs text-ink-dim leading-relaxed">
                {cap.description}
              </p>
            </div>

            {/* Bottom Right Arrow Link */}
            <div className="mt-4 flex justify-end">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line/60 text-ink-dim transition-all duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
