import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { portfolioCategorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

// Public -- the "Our Work" page needs this with no login required.
export async function GET() {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = portfolioCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const slug = slugify(parsed.data.name);

    const existing = await prisma.portfolioCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 400 });
    }

    const category = await prisma.portfolioCategory.create({
      data: { name: parsed.data.name, slug },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
