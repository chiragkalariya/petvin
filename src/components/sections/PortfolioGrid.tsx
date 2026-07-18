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

const PLACEHOLDER_COLORS = ["#3a3f45", "#33383e"];

export function PortfolioGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeSlug === "all" ? "/api/portfolio" : `/api/portfolio?category=${activeSlug}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [activeSlug]);

  return (
    <div>
      <div className="mb-9 flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveSlug("all")}
          className={cn(
            "border px-4 py-2 font-mono text-xs tracking-wide transition-colors",
            activeSlug === "all" ? "border-accent text-accent" : "border-line text-ink-dim hover:border-ink-dim"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveSlug(cat.slug)}
            className={cn(
              "border px-4 py-2 font-mono text-xs tracking-wide transition-colors",
              activeSlug === cat.slug ? "border-accent text-accent" : "border-line text-ink-dim hover:border-ink-dim"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-dimmer">Loading…</p>
      ) : items.length === 0 ? (
        <p className="border border-dashed border-line py-16 text-center text-sm text-ink-dimmer">
          No work added in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="group border border-line bg-bg-alt transition-all hover:-translate-y-1 hover:border-accent-dim"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden [clip-path:polygon(0_0,100%_0,100%_88%,88%_100%,0_100%)]"
                style={
                  item.imageUrl
                    ? undefined
                    : {
                        backgroundImage: `repeating-linear-gradient(45deg, ${
                          PLACEHOLDER_COLORS[i % 2]
                        } 0px, ${PLACEHOLDER_COLORS[i % 2]} 18px, #262a2f 18px, #262a2f 36px)`,
                      }
                }
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="absolute right-2.5 top-2 font-mono text-[9px] uppercase tracking-wide text-white/40">
                    Photo Pending
                  </span>
                )}
                <span className="absolute bottom-2.5 left-2.5 bg-black/45 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-white">
                  {item.category.name}
                </span>
              </div>
              <div className="px-4.5 py-4">
                <h4 className="mb-1 text-[15px] text-ink">{item.name}</h4>
                <span className="font-mono text-[12.5px] text-ink-dimmer">{item.material || "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
