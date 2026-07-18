import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  alt,
  children,
}: {
  id?: string;
  className?: string;
  alt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", alt && "border-y border-line bg-bg-alt", className)}
    >
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
      <span className="inline-block h-px w-5 bg-accent" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 max-w-xl", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl uppercase text-ink md:text-4xl">{title}</h2>
      {description && <p className="mt-3.5 text-[15px] text-ink-dim">{description}</p>}
    </div>
  );
}
