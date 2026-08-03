"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioItemData {
  id: string;
  name: string;
  material: string | null;
  imageUrl: string | null;
  category: Category;
}

function SkeletonCard() {
  return (
    <div className="group overflow-hidden rounded-none border border-line bg-bg-alt animate-pulse">
      <div className="aspect-[4/3] bg-bg-light" />
      <div className="px-5 py-4 space-y-2">
        <div className="h-4 w-3/4 bg-bg-light rounded" />
        <div className="h-3 w-1/3 bg-bg-light rounded" />
      </div>
    </div>
  );
}

export function PortfolioGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  useEffect(() => {
    setAnimating(true);
    setLoading(true);
    const url =
      activeSlug === "all"
        ? "/api/portfolio"
        : `/api/portfolio?category=${activeSlug}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setAnimating(false), 50);
      });
  }, [activeSlug]);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-10 flex flex-wrap gap-2">
        {[{ id: "all", name: "All", slug: "all" }, ...categories].map(
          (cat) => {
            const isActive =
              cat.slug === "all"
                ? activeSlug === "all"
                : activeSlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveSlug(cat.slug === "all" ? "all" : cat.slug)
                }
                className={cn(
                  "relative overflow-hidden px-5 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                  isActive
                    ? "bg-accent text-bg font-bold shadow-[0_0_20px_rgb(255,106,26,0.3)]"
                    : "border border-line text-ink-dim hover:border-accent/50 hover:text-ink hover:bg-bg-alt"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-accent to-accent-light opacity-100" />
                )}
                <span className="relative">{cat.name}</span>
              </button>
            );
          }
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-line py-24 text-center">
          <svg
            className="mb-4 h-12 w-12 text-ink-dimmer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-ink-dimmer">
            No work added in this category yet.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
            animating ? "opacity-0" : "opacity-100"
          )}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden border border-line bg-bg-alt transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_8px_32px_rgb(255,106,26,0.12)]"
            >
              {/* Image area */}
              <div className="relative aspect-[4/3] overflow-hidden bg-bg-light">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/image?url=${encodeURIComponent(item.imageUrl)}`}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #2e3339 0px, #2e3339 18px, #262a2f 18px, #262a2f 36px)",
                    }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <svg
                          className="mx-auto mb-2 h-8 w-8 text-ink-dimmer/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-dimmer/50">
                          Photo Pending
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Category pill - always visible */}
                <div className="absolute left-3 top-3">
                  <span className="bg-black/60 backdrop-blur-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 border border-white/10">
                    {item.category.name}
                  </span>
                </div>

                {/* Hover details overlay */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-display text-base uppercase text-white">
                    {item.name}
                  </p>
                  {item.material && (
                    <p className="mt-0.5 font-mono text-xs text-white/60">
                      {item.material}
                    </p>
                  )}
                </div>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-line/50 group-hover:border-accent/20 transition-colors duration-300">
                <div>
                  <h4 className="text-[14px] font-medium text-ink group-hover:text-accent transition-colors duration-300">
                    {item.name}
                  </h4>
                  <span className="font-mono text-[11px] text-ink-dimmer">
                    {item.material || "—"}
                  </span>
                </div>
                <div className="h-8 w-8 flex items-center justify-center border border-line/60 group-hover:border-accent group-hover:bg-accent/10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <svg
                    className="h-3.5 w-3.5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17L17 7M7 7h10v10"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom accent line animation */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-accent to-accent-light transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
