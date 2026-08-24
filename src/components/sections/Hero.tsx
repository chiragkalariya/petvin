"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";

interface Slide {
  id: string;
  num: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  headlineHighlight: string;
  subtitle: string;
  image: string;
  spec1: string;
  spec2: string;
}

const SLIDES: Slide[] = [
  {
    id: "slide-1",
    num: "01",
    eyebrow: "PRECISION IN MOTION",
    headlineLine1: "PRECISION",
    headlineLine2: "CUT.",
    headlineLine3: "PRECISELY",
    headlineHighlight: "BENT.",
    subtitle:
      "Laser Cutting, CNC Bending & Sheet Metal Fabrication with unmatched accuracy and quality.",
    image: "/images/hero_laser_cutting.jpg",
    spec1: "3 KW FIBER LASER",
    spec2: "160 TON CNC PRESS BRAKE",
  },
  {
    id: "slide-2",
    num: "02",
    eyebrow: "FIBER LASER CUTTING",
    headlineLine1: "MICRON",
    headlineLine2: "LEVEL.",
    headlineLine3: "CLEAN",
    headlineHighlight: "EDGES.",
    subtitle:
      "High-speed 3 kW fiber laser cutting for MS, SS, Aluminium and Brass with zero slag.",
    image: "/images/cap_laser_cutting.jpg",
    spec1: "±0.05 MM ACCURACY",
    spec2: "UP TO 16MM THICKNESS",
  },
  {
    id: "slide-3",
    num: "03",
    eyebrow: "CNC PRESS BRAKE",
    headlineLine1: "ACCURATE",
    headlineLine2: "BENDS.",
    headlineLine3: "REPEATABLE",
    headlineHighlight: "FORMING.",
    subtitle:
      "160-ton multi-axis press brake for complex forming of brackets, enclosures, and structural panels.",
    image: "/images/cap_cnc_bending.jpg",
    spec1: "160 TON TONNAGE",
    spec2: "2500MM BEND LENGTH",
  },
  {
    id: "slide-4",
    num: "04",
    eyebrow: "MASS FABRICATION",
    headlineLine1: "PROTOTYPE",
    headlineLine2: "TO",
    headlineLine3: "VOLUME",
    headlineHighlight: "PRODUCTION.",
    subtitle:
      "From a single custom bracket to scheduled production runs of thousands — on-time, every time.",
    image: "/images/cap_prototype_bulk.jpg",
    spec1: "100% QUALITY INSPECTED",
    spec2: "FAST TURNAROUND",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-bg flex items-center">
      {/* Background Images with smooth Cross-Fade Transition */}
      {SLIDES.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <img
            src={s.image}
            alt={s.eyebrow}
            className="h-full w-full object-cover object-center brightness-[0.45] contrast-125 transition-transform duration-7000 ease-out scale-100"
          />
        </div>
      ))}

      {/* Gradients to blend into background and keep text crisp */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-bg via-bg/85 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-bg via-transparent to-bg/60 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Main Left Content */}
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent font-semibold">
                {slide.eyebrow}
              </span>
            </div>

            {/* Massive Bold Headline */}
            <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[76px] leading-[0.95] min-h-[240px] sm:min-h-[280px] lg:min-h-[300px]">
              {slide.headlineLine1}<br />
              {slide.headlineLine2}<br />
              {slide.headlineLine3}<br />
              <span className="text-accent text-glow">{slide.headlineHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-base text-ink-muted leading-relaxed sm:text-lg min-h-[56px]">
              {slide.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-accent px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(255,106,26,0.45)]"
              >
                <span>GET A QUOTE</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#capabilities"
                className="inline-flex items-center gap-2.5 border border-line-bright bg-bg-alt/70 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-white"
              >
                <span>EXPLORE CAPABILITIES</span>
                <ArrowDown className="h-3.5 w-3.5 text-accent" />
              </Link>
            </div>
          </div>

          {/* Right Side Interactive Slide Indicators & Machine Specs */}
          <div className="flex flex-col justify-between self-stretch lg:items-end py-4">
            {/* Interactive Step Slide Indicator */}
            <div className="hidden lg:flex flex-col gap-3 font-mono text-xs font-bold">
              {SLIDES.map((s, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`flex items-center gap-2 text-left transition-all duration-300 ${isActive
                        ? "text-accent font-bold scale-105"
                        : "text-ink-dimmer hover:text-ink pl-2.5"
                      }`}
                  >
                    {isActive && <span className="h-4 w-0.5 bg-accent" />}
                    <span>{s.num}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Right Specs Plate */}
            <div className="mt-8 lg:mt-0 flex flex-col gap-1 lg:text-right border-l-2 lg:border-l-0 lg:border-r-2 border-accent pl-4 lg:pl-0 lg:pr-4 min-h-[48px] justify-center">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                {slide.spec1}
              </span>
              <span className="font-display text-sm font-bold uppercase tracking-wider text-ink-dim">
                {slide.spec2}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
