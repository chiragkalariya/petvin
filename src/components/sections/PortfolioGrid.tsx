"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { cn, slugify } from "@/lib/utils";
import {
  ArrowRight,
  Layers,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Filter,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioItemData {
  id: string;
  name: string;
  slug?: string | null;
  material: string | null;
  materials?: string | null;
  industry?: string | null;
  processes?: string | null;
  applicationType?: string | null;
  description?: string | null;
  imageUrl: string | null;
  featured?: boolean;
  category: Category;
}

function getImageSrc(url: string | null) {
  if (!url) return "/images/about_metal_part.jpg";
  if (
    url.startsWith("/") ||
    (url.startsWith("http") && !url.includes("blob.vercel-storage.com"))
  ) {
    return url;
  }
  return `/api/image?url=${encodeURIComponent(url)}`;
}

export function PortfolioGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeIndustry, setActiveIndustry] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and items concurrently
    Promise.all([
      fetch("/api/portfolio/categories").then((r) => r.json()),
      fetch("/api/portfolio?status=ACTIVE").then((r) => r.json()),
    ])
      .then(([catData, itemData]) => {
        if (catData.categories && catData.categories.length > 0) {
          setCategories(catData.categories);
        }
        if (itemData.items && itemData.items.length > 0) {
          setItems(itemData.items);
        }
      })
      .catch((err) => {
        console.error("Error loading portfolio:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute available industries from items
  const availableIndustries = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.industry) {
        item.industry.split(",").forEach((ind) => {
          const trimmed = ind.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [items]);

  // Filter items by category and industry
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category check
      if (activeCategory !== "all") {
        if (
          item.category?.slug !== activeCategory &&
          item.category?.id !== activeCategory
        ) {
          return false;
        }
      }

      // Industry check
      if (activeIndustry !== "all") {
        if (
          !item.industry ||
          !item.industry.toLowerCase().includes(activeIndustry.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeCategory, activeIndustry]);

  return (
    <div className="w-full">
      {/* Drawing to Delivery Quick Banner */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 via-bg-card to-bg-card p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Job Work & OEM Fabrication</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
              Send us your drawing. We cut it, bend it & manufacture it.
            </h2>
            <p className="mt-2 text-sm text-ink-dim leading-relaxed">
              We accept DXF, DWG, PDF drawings, CAD models, or physical samples.
              Powered by our 3 kW Fiber Laser & 160 Ton CNC Press Brake in Ahmedabad.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,26,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(255,106,26,0.5)]"
            >
              <FileText className="h-4 w-4" />
              <span>Send Drawing for Quote</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="space-y-4 mb-10">
        <div className="flex flex-wrap items-center gap-2">
          {[{ id: "all", name: "All Work", slug: "all" }, ...categories].map(
            (cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.slug);
                  }}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-accent text-white shadow-[0_0_20px_rgba(255,106,26,0.35)]"
                      : "border border-line bg-bg-card text-ink-dim hover:border-accent/60 hover:bg-bg-light hover:text-white"
                  )}
                >
                  <span>{cat.name}</span>
                </button>
              );
            }
          )}
        </div>

        {/* Secondary Industry Filter Strip */}
        {availableIndustries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/40">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3 text-accent" /> Industry:
            </span>
            <button
              onClick={() => setActiveIndustry("all")}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-[11px] transition-colors",
                activeIndustry === "all"
                  ? "bg-white/10 text-white font-semibold border border-white/20"
                  : "text-ink-dim hover:text-white"
              )}
            >
              All Industries
            </button>
            {availableIndustries.map((ind) => {
              const isActive = activeIndustry === ind;
              return (
                <button
                  key={ind}
                  onClick={() => setActiveIndustry(ind)}
                  className={cn(
                    "rounded-md px-3 py-1 font-mono text-[11px] transition-colors",
                    isActive
                      ? "bg-accent/20 text-accent font-semibold border border-accent/40"
                      : "text-ink-dim hover:text-white"
                  )}
                >
                  {ind}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid of Portfolio Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-line bg-bg-card animate-pulse"
            >
              <div className="aspect-[4/3] bg-bg-light/60" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-3/4 bg-bg-light rounded" />
                <div className="h-4 w-1/2 bg-bg-light rounded" />
                <div className="h-10 bg-bg-light rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-card/40 py-24 text-center">
          <Layers className="h-12 w-12 text-ink-dimmer mb-3" />
          <h3 className="font-display text-lg font-bold uppercase text-white">
            No manufactured items in this filter
          </h3>
          <p className="mt-1 text-sm text-ink-dim max-w-sm">
            We manufacture a wide range of custom components. Send us your CAD or PDF drawing for an immediate job-work quote.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                setActiveCategory("all");
                setActiveIndustry("all");
              }}
              className="border border-line bg-bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:text-white transition-colors rounded"
            >
              Reset Filters
            </button>
            <Link
              href="/contact"
              className="border border-accent/60 bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors rounded hover:bg-accent-hover"
            >
              Request Custom Job Work
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const itemSlug = item.slug || slugify(item.name);
            const imgSrc = getImageSrc(item.imageUrl);
            const appType = item.applicationType || "Job Work";
            const isJobWork = appType === "Job Work";

            return (
              <Link
                key={item.id}
                href={`/our-work/${itemSlug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-bg-card transition-all duration-300 hover:-translate-y-2 hover:border-accent/60 hover:shadow-[0_12px_35px_rgba(255,106,26,0.18)]"
              >
                {/* Top Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-alt">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />

                  {/* Top-left Category Badge */}
                  <div className="absolute left-3 top-3 z-10">
                    <span className="rounded-md border border-white/10 bg-bg/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-dim backdrop-blur-md">
                      {item.category?.name || "Manufacturing"}
                    </span>
                  </div>

                  {/* Top-right Application Type Badge (Highlighted for Job Work) */}
                  <div className="absolute right-3 top-3 z-10">
                    <span
                      className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                        isJobWork
                          ? "bg-accent/90 text-white border-accent shadow-[0_0_12px_rgba(255,106,26,0.4)]"
                          : "bg-bg/90 text-white border-white/20"
                      }`}
                    >
                      {appType}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {/* Industry */}
                    {item.industry && (
                      <span className="font-mono text-[11px] uppercase tracking-wider text-accent block">
                        {item.industry}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-white transition-colors group-hover:text-accent line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Process & Material Specs */}
                    <div className="mt-3 space-y-1.5 border-t border-line/50 pt-3">
                      {item.processes && (
                        <div className="flex items-center gap-2 text-xs text-ink-dim">
                          <span className="font-mono text-[10px] uppercase text-ink-dimmer shrink-0">
                            Process:
                          </span>
                          <span className="font-medium text-white truncate">
                            {item.processes}
                          </span>
                        </div>
                      )}

                      {(item.materials || item.material) && (
                        <div className="flex items-center gap-2 text-xs text-ink-dim">
                          <span className="font-mono text-[10px] uppercase text-ink-dimmer shrink-0">
                            Material:
                          </span>
                          <span className="font-medium text-ink-dim truncate">
                            {item.materials || item.material}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="mt-3 text-xs text-ink-dimmer line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom CTA Link */}
                  <div className="mt-5 flex items-center justify-between border-t border-line/40 pt-4">
                    <span className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-accent transition-transform group-hover:translate-x-1">
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-bg-light/40 text-ink-dim transition-all duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>

                {/* Animated Bottom Glow Line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
