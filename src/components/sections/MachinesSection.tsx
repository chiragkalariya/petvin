"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Layers, Clock, Scale, Ruler, Crosshair } from "lucide-react";

export function MachinesSection() {
  const machines = [
    {
      id: "laser",
      title: "3 KW FIBER LASER CUTTER",
      image: "/images/machine_fiber_laser.jpg",
      specs: [
        { icon: Zap, label: "3 KW Power" },
        { icon: Layers, label: "MS / SS / AL" },
        { icon: Clock, label: "Up to 16mm" },
      ],
    },
    {
      id: "press-brake",
      title: "160 TON CNC PRESS BRAKE",
      image: "/images/machine_press_brake.jpg",
      specs: [
        { icon: Scale, label: "160 Ton" },
        { icon: Ruler, label: "2500mm" },
        { icon: Crosshair, label: "High Accuracy" },
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? machines.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === machines.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="machines" className="relative w-full py-24 bg-bg border-t border-line/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header with Left Heading */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end mb-12">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              OUR MACHINES
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.05]">
              Powerful Machines.<br />
              Precise Results.
            </h2>
            {/* View all machines button - commented out as shop has two core machines
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-line-bright bg-bg-card px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:border-accent hover:text-accent"
              >
                <span>VIEW ALL MACHINES</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            */}
          </div>

          {/* Carousel Arrows - commented out as shop has two core machines
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous Machine"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-bg-card text-ink-dim transition-all hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Machine"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/60 bg-bg-card text-accent transition-all hover:bg-accent hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          */}
        </div>

        {/* Machine Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="group overflow-hidden rounded-xl border border-line bg-bg-card transition-all duration-300 hover:border-accent/60 hover:shadow-[0_8px_30px_rgba(255,106,26,0.15)]"
            >
              {/* Machine Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-bg-alt">
                <img
                  src={machine.image}
                  alt={machine.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />
              </div>

              {/* Machine Info */}
              <div className="p-6">
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors">
                  {machine.title}
                </h3>

                {/* Specs row */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line/60 pt-4">
                  {machine.specs.map((spec, i) => {
                    const SpecIcon = spec.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md bg-bg-light/60 px-3 py-1.5 text-xs text-ink-dim"
                      >
                        <SpecIcon className="h-3.5 w-3.5 text-accent" />
                        <span>{spec.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
