import { CAPABILITIES } from "@/lib/site-content";

export function CapabilitiesGrid() {
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {CAPABILITIES.map((cap) => (
        <div key={cap.num} className="bg-bg-alt p-8 transition-colors hover:bg-bg-light">
          <span className="mb-4 block font-mono text-[13px] text-accent">{cap.num}</span>
          <h3 className="mb-2.5 font-display text-lg uppercase text-ink">{cap.title}</h3>
          <p className="text-sm text-ink-dim">{cap.description}</p>
        </div>
      ))}
    </div>
  );
}
