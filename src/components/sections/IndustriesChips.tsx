import { INDUSTRIES } from "@/lib/site-content";

export function IndustriesChips() {
  return (
    <div className="flex flex-wrap gap-3.5">
      {INDUSTRIES.map((industry) => (
        <div
          key={industry}
          className="flex items-center gap-2.5 border border-line px-5.5 py-3 text-sm text-ink-dim transition-colors hover:border-accent hover:text-ink"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {industry}
        </div>
      ))}
    </div>
  );
}
