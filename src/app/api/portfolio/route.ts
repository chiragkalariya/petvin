import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { portfolioItemSchema } from "@/lib/validations";

// Public -- powers the "Our Work" page, optionally filtered by ?category=slug
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const categorySlug = req.nextUrl.searchParams.get("category");

    const items = await prisma.portfolioItem.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : undefined,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("List portfolio items error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Any logged-in employee can add a finished job to the portfolio.
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

    const item = await prisma.portfolioItem.create({
      data: {
        name: data.name,
        material: data.material || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
        featured: data.featured ?? false,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
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

