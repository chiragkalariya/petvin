import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CtaBanner } from "@/components/sections/CtaBanner";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  FileCode2,
  PhoneCall,
  MessageSquare,
  Share2,
  Award,
} from "lucide-react";

interface Props {
  params: {
    slug: string;
  };
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

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await prisma.portfolioItem.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      status: "ACTIVE",
      category: { status: "ACTIVE" },
    },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  if (!item) {
    return {
      title: "Manufacturing Portfolio | Petvin Febtech",
    };
  }

  const categoryName = item.category?.name || "Manufacturing";
  const materials = item.materials || item.material || "MS, SS, Aluminium";
  const processes = item.processes || "Laser Cutting & CNC Bending";

  const title = `${item.name} Manufacturing | Petvin Febtech Ahmedabad`;
  const description = `${item.name} custom sheet metal fabrication, ${processes}, and precision job-work in ${materials}. Manufactured at Petvin Febtech facility in Ahmedabad, Gujarat.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://petvinfebtech.com/our-work/${item.slug || params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://petvinfebtech.com/our-work/${item.slug || params.slug}`,
      images: [
        {
          url: item.imageUrl || "/images/about_metal_part.jpg",
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ],
    },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const item = await prisma.portfolioItem.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      status: "ACTIVE",
      category: { status: "ACTIVE" },
    },
    include: {
      category: true,
    },
  });

  if (!item) {
    notFound();
  }

  // Fetch related items from the same category
  const relatedItems = await prisma.portfolioItem.findMany({
    where: {
      categoryId: item.categoryId,
      id: { not: item.id },
      status: "ACTIVE",
    },
    take: 3,
    include: { category: true },
    orderBy: { displayOrder: "asc" },
  });

  const imgSrc = getImageSrc(item.imageUrl);


  // Structured Data Schema for Search Engines (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: item.name,
    image: item.imageUrl || "https://petvinfebtech.com/images/about_metal_part.jpg",
    description:
      item.description ||
      `Precision ${item.name} manufactured using 3kW Fiber Laser Cutting and 160 Ton CNC Press Brake at Petvin Febtech Ahmedabad.`,
    brand: {
      "@type": "Brand",
      name: "Petvin Febtech",
    },
    category: item.category.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: "100",
      highPrice: "500000",
      offerCount: "1",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Petvin Febtech",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          addressCountry: "IN",
        },
      },
    },
  };

  return (
    <>
      {/* JSON-LD Script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-bg text-ink min-h-screen">
        {/* Breadcrumb Navigation & Top Bar */}
        <section className="border-b border-line/50 bg-bg-alt/40 py-4">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs font-mono text-ink-dimmer">
              <Link href="/" className="hover:text-accent transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/our-work" className="hover:text-accent transition-colors">
                Our Work
              </Link>
              <span>/</span>
              <span className="text-ink-dim">{item.category.name}</span>
              <span>/</span>
              <span className="text-accent font-semibold truncate max-w-[200px]">
                {item.name}
              </span>
            </nav>

            <Link
              href="/our-work"
              className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-ink-dim hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Work</span>
            </Link>
          </div>
        </section>

        {/* Main Product Showcase Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left Column: Product Image Showcase */}
              <div className="lg:col-span-7 space-y-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-bg-card shadow-2xl">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    className="h-full w-full object-contain p-4 sm:p-6"
                  />

                  {/* Corner Badges */}
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                    <span className="rounded-md border border-white/15 bg-bg/90 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent backdrop-blur-md">
                      {item.category.name}
                    </span>
                  </div>


                </div>

                {/* Machine Capabilities Highlight Strip */}
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-bg-card/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-display text-xs font-bold text-white block">
                        3 kW Fiber Laser
                      </span>
                      <span className="font-mono text-[10px] text-ink-dimmer">
                        ±0.05 mm Cut
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-x border-line px-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-display text-xs font-bold text-white block">
                        160 Ton CNC
                      </span>
                      <span className="font-mono text-[10px] text-ink-dimmer">
                        Press Brake
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-display text-xs font-bold text-white block">
                        100% Inspected
                      </span>
                      <span className="font-mono text-[10px] text-ink-dimmer">
                        ISO Grade
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Specifications & Job Work Request */}
              <div className="lg:col-span-5 space-y-6">
                {/* Title & Industry */}
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                    {item.category.name}
                  </span>
                  <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                    {item.name}
                  </h1>
                </div>

                {/* Description */}
                <div className="rounded-xl border border-line bg-bg-card p-5">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer mb-2">
                    Manufacturing Overview
                  </h3>
                  <p className="text-sm text-ink-dim leading-relaxed">
                    {item.description ||
                      "Manufactured to precise engineering CAD drawings utilizing 3 kW high-speed fiber laser cutting and multi-stage 160-ton CNC press brake bending at Petvin Febtech Ahmedabad facility."}
                  </p>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="rounded-xl border border-line bg-bg-card divide-y divide-line/60">
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-mono text-xs uppercase text-ink-dimmer">
                      Material Specification
                    </span>
                    <span className="font-display text-xs font-bold text-accent">
                      {item.materials || item.material || "MS / SS / Aluminium / GI"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-mono text-xs uppercase text-ink-dimmer">
                      Standard Tolerance
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ±0.05 mm (Laser) / ±0.2 mm (Bending)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-mono text-xs uppercase text-ink-dimmer">
                      Accepted Files
                    </span>
                    <span className="font-mono text-xs font-medium text-ink-dim">
                      DXF, DWG, PDF, STEP, CAD, Sample
                    </span>
                  </div>
                </div>

                {/* Job Work Conversion Callout Box */}
                <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/15 via-bg-card to-bg-card p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase text-white">
                      Need a similar component?
                    </h3>
                    <p className="mt-1 text-xs text-ink-dim leading-relaxed">
                      Send your CAD drawing (DXF/DWG/PDF) or physical sample. We provide fast quotes, precision laser cutting, CNC bending, and on-time delivery across Gujarat & India.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Link
                      href={`/contact?subject=Job Work Quote for ${encodeURIComponent(item.name)}`}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,26,0.35)] transition-all hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(255,106,26,0.5)]"
                    >
                      <span>Request Quote for This Part</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <a
                      href="https://wa.me/919624889080?text=Hello%20Petvin%20Febtech,%20I%20am%20interested%20in%20job%20work%20for%20"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-bg-light/60 px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:border-emerald-500/60 hover:text-emerald-400 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Category Projects Section */}
        {relatedItems.length > 0 && (
          <section className="border-t border-line/60 py-16 bg-bg-alt/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                    RELATED WORK
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-white">
                    More in {item.category.name}
                  </h2>
                </div>

                <Link
                  href={`/our-work?category=${item.category.slug}`}
                  className="font-display text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1"
                >
                  <span>View All in {item.category.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {relatedItems.map((rel) => {
                  const relSlug = rel.slug || rel.id;
                  const relImg = getImageSrc(rel.imageUrl);

                  return (
                    <Link
                      key={rel.id}
                      href={`/our-work/${relSlug}`}
                      className="group overflow-hidden rounded-xl border border-line bg-bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_8px_25px_rgba(255,106,26,0.15)]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-bg-alt">
                        <img
                          src={relImg}
                          alt={rel.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-base font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1">
                          {rel.name}
                        </h3>
                        {(rel.materials || rel.material) && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-dim">
                            <Layers className="h-3 w-3 text-accent shrink-0" />
                            <span className="font-medium truncate">
                              {rel.materials || rel.material}
                            </span>
                          </div>
                        )}
                        {rel.description && (
                          <p className="mt-2 text-xs text-ink-dimmer line-clamp-2">
                            {rel.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Global Conversion CTA Banner */}
        <CtaBanner />
      </div>
    </>
  );
}
