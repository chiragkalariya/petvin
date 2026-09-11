import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { portfolioItemSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const industry = searchParams.get("industry");
    const process = searchParams.get("process");
    const applicationType = searchParams.get("applicationType");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    // For public requests (status not "all" or status "ACTIVE"), only show active items in active categories
    if (status === "all") {
      // Admin requesting all items regardless of status
      if (category && category !== "all") {
        where.OR = [
          { category: { slug: category } },
          { categoryId: category },
        ];
      }
    } else {
      // Default / public behavior: only ACTIVE items and only ACTIVE categories
      where.status = status ? status : "ACTIVE";
      where.category = {
        status: "ACTIVE",
        ...(category && category !== "all"
          ? {
              OR: [{ slug: category }, { id: category }],
            }
          : {}),
      };
    }

    if (industry && industry !== "all") {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    if (process && process !== "all") {
      where.processes = { contains: process, mode: "insensitive" };
    }

    if (applicationType && applicationType !== "all") {
      where.applicationType = applicationType;
    }

    if (featured !== null && featured !== undefined && featured !== "") {
      where.featured = featured === "true";
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { industry: { contains: q, mode: "insensitive" } },
            { processes: { contains: q, mode: "insensitive" } },
            { materials: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
      ];
    }

    const items = await prisma.portfolioItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true, status: true },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("List portfolio items error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();

    const body = await req.json();
    const parsed = portfolioItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    if (!baseSlug) baseSlug = "portfolio-item";

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.portfolioItem.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const item = await prisma.portfolioItem.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        industry: data.industry,
        processes: data.processes,
        materials: data.materials,
        material: data.material || data.materials,
        applicationType: data.applicationType ?? "Job Work",
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        featured: data.featured ?? false,
        status: data.status ?? "ACTIVE",
        displayOrder: data.displayOrder ?? 0,
      },
      include: { category: { select: { id: true, name: true, slug: true, status: true } } },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create portfolio item error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
