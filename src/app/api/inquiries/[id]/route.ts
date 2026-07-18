import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { inquiryStatusSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
        costingRecords: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get inquiry error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    const body = await req.json();
    const parsed = inquiryStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        assignedToId: parsed.data.assignedToId || null,
      },
    });

    return NextResponse.json({ inquiry });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update inquiry error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
