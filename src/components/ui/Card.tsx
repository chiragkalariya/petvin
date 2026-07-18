import { cn } from "@/lib/utils";

/** Base panel with hairline border, used throughout the site. */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border border-line bg-bg-alt", className)}>{children}</div>;
}

/**
 * The site's signature "spec plate" motif: a panel with small corner
 * brackets, styled like a machine nameplate. Used for hero specs,
 * machine capability blocks, and stat displays.
 */
export function SpecPlate({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative border border-line bg-bg-alt p-5", className)}>
      <span className="absolute -top-px -left-px h-2.5 w-2.5 border-l-2 border-t-2 border-accent" />
      <span className="absolute -top-px -right-px h-2.5 w-2.5 border-r-2 border-t-2 border-accent" />
      <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-accent" />
      <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-accent" />
      {children}
    </div>
  );
}

export function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft py-3.5 last:border-none">
      <span className="text-sm text-ink-dim">{k}</span>
      <span className="font-mono text-[15px] text-accent">{v}</span>
    </div>
  );
}

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-bg-light text-ink-dim border-line",
  accent: "bg-accent/10 text-accent border-accent/30",
  success: "bg-emerald-950 text-emerald-400 border-emerald-800",
  warning: "bg-amber-950 text-amber-400 border-amber-800",
  danger: "bg-red-950 text-red-400 border-red-800",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
        badgeTones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border border-dashed border-line py-16 text-center">
      <p className="font-display text-lg uppercase tracking-wide text-ink-dim">{title}</p>
      {description && <p className="mt-2 text-sm text-ink-dimmer">{description}</p>}
    </div>
  );
}
