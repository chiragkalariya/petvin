import {
  MessageSquare,
  FileSpreadsheet,
  Zap,
  Layers,
  ShieldCheck,
  Truck,
} from "lucide-react";

export function ProcessSteps() {
  const steps = [
    {
      num: "01",
      title: "Inquiry",
      desc: "Send us your drawing or requirements",
      icon: MessageSquare,
    },
    {
      num: "02",
      title: "Quote",
      desc: "We review & provide the best quote",
      icon: FileSpreadsheet,
    },
    {
      num: "03",
      title: "Laser Cutting",
      desc: "Precision cutting with advanced fiber laser",
      icon: Zap,
    },
    {
      num: "04",
      title: "CNC Bending",
      desc: "Accurate bending with CNC press brake",
      icon: Layers,
    },
    {
      num: "05",
      title: "Quality Check",
      desc: "Strict quality inspection for perfect output",
      icon: ShieldCheck,
    },
    {
      num: "06",
      title: "Dispatch",
      desc: "Safe packaging & on-time delivery",
      icon: Truck,
    },
  ];

  return (
    <div className="relative w-full">
      {/* Horizontal timeline step items */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Connector line between steps (hidden on mobile, visible on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-1/2 w-full h-px bg-line-bright -z-0">
                  {/* Subtle orange dot on connection line */}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent/70" />
                </div>
              )}

              {/* Icon Container */}
              <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-bg-card shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(255,106,26,0.3)]">
                <Icon className="h-6 w-6 text-accent transition-transform duration-300" />
              </div>

              {/* Step Title with Number */}
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white group-hover:text-accent transition-colors">
                <span className="text-accent mr-1.5">{step.num}</span>
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="mt-2 text-xs text-ink-dim leading-relaxed max-w-[170px]">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
