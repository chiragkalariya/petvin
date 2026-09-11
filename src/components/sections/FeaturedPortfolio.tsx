import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { slugify } from "@/lib/utils";

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

export async function FeaturedPortfolio() {
  const featuredItems = await prisma.portfolioItem.findMany({
    where: {
      featured: true,
      status: "ACTIVE",
      category: { status: "ACTIVE" },
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: 10,
  });

  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-24 bg-bg border-t border-line/50 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real Manufacturing Output</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              Featured Job Work & Parts
            </h2>
            <p className="mt-3 text-base text-ink-dim leading-relaxed">
              From precision control enclosures to heavy structural brackets — manufactured with 3 kW fiber laser cutting and 160 Ton CNC bending.
            </p>
          </div>

          <Link
            href="/our-work"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/60 bg-accent/10 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-accent transition-all hover:bg-accent hover:text-white hover:shadow-[0_0_20px_rgba(255,106,26,0.4)]"
          >
            <span>View All 60+ Items</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredItems.map((item) => {
            const itemSlug = item.slug || slugify(item.name);
            const imgSrc = getImageSrc(item.imageUrl);
            const appType = item.applicationType || "Job Work";
            const isJobWork = appType === "Job Work";

            return (
              <Link
                key={item.id}
                href={`/our-work/${itemSlug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_8px_30px_rgba(255,106,26,0.15)]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-alt">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />

                  <div className="absolute left-2.5 top-2.5 z-10">
                    <span className="rounded bg-bg/85 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-dim border border-white/10 backdrop-blur-md">
                      {item.category.name}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:text-accent line-clamp-1">
                      {item.name}
                    </h3>

                    {(item.materials || item.material) && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-dim">
                        <Layers className="h-3 w-3 text-accent shrink-0" />
                        <span className="font-medium truncate">
                          {item.materials || item.material}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Accent line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
