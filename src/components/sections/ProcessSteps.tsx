import { PROCESS_STEPS } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function ProcessSteps() {
  return (
    <div className="flex flex-col">
      {PROCESS_STEPS.map((step, i) => (
        <div
          key={step.num}
          className={cn(
            "grid grid-cols-[70px_1fr] gap-6 border-t border-line-soft py-7 sm:grid-cols-[90px_1fr]",
            i === PROCESS_STEPS.length - 1 && "border-b"
          )}
        >
          <div className="font-mono text-3xl font-medium text-line">{step.num}</div>
          <div>
            <h4 className="mb-1.5 font-display text-lg uppercase text-ink">{step.title}</h4>
            <p className="max-w-lg text-sm text-ink-dim">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
