import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { portfolioItemSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.portfolioItem.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Get portfolio item error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();

    const body = await req.json();
    const parsed = portfolioItemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let slugUpdate: string | undefined = undefined;
    if (data.slug) {
      slugUpdate = slugify(data.slug);
    } else if (data.name) {
      const baseSlug = slugify(data.name);
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await prisma.portfolioItem.findUnique({ where: { slug } });
        if (!existing || existing.id === params.id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      slugUpdate = slug;
    }

    const item = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(slugUpdate !== undefined && { slug: slugUpdate }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.processes !== undefined && { processes: data.processes }),
        ...(data.materials !== undefined && { materials: data.materials }),
        ...(data.material !== undefined && { material: data.material }),
        ...(data.applicationType !== undefined && { applicationType: data.applicationType }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update portfolio item error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();
    await prisma.portfolioItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete portfolio item error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
