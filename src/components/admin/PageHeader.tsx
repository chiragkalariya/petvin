import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("border border-line bg-bg-alt p-6", className)}>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">{label}</p>
      <p className="font-display text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-ink-dimmer">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl uppercase text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ink-dim">{description}</p>}
      </div>
      {action}
    </div>
  );
}
