import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { portfolioCategorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = portfolioCategorySchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);
    }

    if (data.status) {
      updateData.status = data.status;
    }

    const category = await prisma.portfolioCategory.update({
      where: { id: params.id },
      data: updateData,
    });

    // When disabling a category, disable all its portfolio items too
    if (data.status === "INACTIVE") {
      await prisma.portfolioItem.updateMany({
        where: { categoryId: params.id },
        data: { status: "INACTIVE" },
      });
    } else if (data.status === "ACTIVE" && body.activateItems) {
      await prisma.portfolioItem.updateMany({
        where: { categoryId: params.id },
        data: { status: "ACTIVE" },
      });
    }

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const itemCount = await prisma.portfolioItem.count({ where: { categoryId: params.id } });
    if (itemCount > 0) {
      return NextResponse.json(
        { error: `Move or delete the ${itemCount} item(s) in this category first` },
        { status: 400 }
      );
    }

    await prisma.portfolioCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
