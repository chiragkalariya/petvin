import { INDUSTRIES } from "@/lib/site-content";
import { CarFront, Armchair, Cpu, MonitorPlay, Wind, Building2, LayoutGrid } from "lucide-react";

const getIconForIndustry = (industry: string) => {
  switch (industry) {
    case "Automotive":
      return <CarFront className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
    case "Furniture & Interiors":
      return <Armchair className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
    case "Electrical Enclosures":
      return <Cpu className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
    case "Signage & Display":
      return <MonitorPlay className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
    case "HVAC & Ducting":
      return <Wind className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
    case "Architecture & Railings":
      return <Building2 className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
    default:
      return <LayoutGrid className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />;
  }
};

export function IndustriesChips() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
      {INDUSTRIES.map((industry) => (
        <div
          key={industry}
          className="group flex flex-col items-center gap-3 border border-line bg-bg-alt px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-bg-light hover:shadow-[0_4px_20px_rgb(255,106,26,0.1)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg border border-line transition-colors duration-300 group-hover:border-accent/30">
            {getIconForIndustry(industry)}
          </div>
          <span className="text-sm font-medium tracking-wide text-ink-dim transition-colors duration-300 group-hover:text-ink">
            {industry}
          </span>
        </div>
      ))}
    </div>
  );
}
