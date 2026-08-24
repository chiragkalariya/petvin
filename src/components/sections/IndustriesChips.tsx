import {
  CarFront,
  Armchair,
  Cpu,
  Wind,
  Building2,
  MonitorPlay,
} from "lucide-react";

export function IndustriesChips() {
  const industries = [
    {
      name: "Automotive",
      icon: CarFront,
    },
    {
      name: "Furniture & Interiors",
      icon: Armchair,
    },
    {
      name: "Electrical Enclosures",
      icon: Cpu,
    },
    {
      name: "HVAC",
      icon: Wind,
    },
    {
      name: "Architecture & Railings",
      icon: Building2,
    },
    {
      name: "Signage & Display",
      icon: MonitorPlay,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {industries.map((ind) => {
        const Icon = ind.icon;
        return (
          <div
            key={ind.name}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-bg-card p-6 text-center cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_8px_25px_rgba(255,106,26,0.2)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
              <Icon className="h-6 w-6" />
            </div>
            <span className="font-display text-xs font-bold uppercase tracking-wide text-ink-muted transition-colors group-hover:text-white select-none">
              {ind.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
