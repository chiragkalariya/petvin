import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { costingRecordSchema } from "@/lib/validations";
import { calculateCosting } from "@/lib/costing";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();
    const record = await prisma.costingRecord.findUnique({
      where: { id: params.id },
      include: { inquiry: { select: { id: true, name: true, company: true } } },
    });
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get costing record error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = costingRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Server always recomputes totals to avoid client/server drift
    const result = calculateCosting({
      weightKg: data.weightKg,
      materialRatePerKg: data.materialRatePerKg,
      cuttingLengthM: data.cuttingLengthM,
      cuttingRatePerM: data.cuttingRatePerM,
      bendCount: data.bendCount,
      bendRatePerBend: data.bendRatePerBend,
      wastagePercent: data.wastagePercent,
      marginPercent: data.marginPercent,
      gstPercent: data.gstPercent,
    });

    const existing = await prisma.costingRecord.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only admin or creator can edit
    if (existing.createdById && existing.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const record = await prisma.costingRecord.update({
      where: { id: params.id },
      data: {
        title: data.title,
        materialType: data.materialType,
        thicknessMm: data.thicknessMm,
        weightKg: data.weightKg,
        materialRatePerKg: data.materialRatePerKg,
        cuttingLengthM: data.cuttingLengthM,
        cuttingRatePerM: data.cuttingRatePerM,
        bendCount: data.bendCount,
        bendRatePerBend: data.bendRatePerBend,
        wastagePercent: data.wastagePercent,
        marginPercent: data.marginPercent,
        gstPercent: data.gstPercent,
        materialCost: result.materialCost,
        cuttingCost: result.cuttingCost,
        bendingCost: result.bendingCost,
        wastageCost: result.wastageCost,
        subtotal: result.subtotal,
        marginAmount: result.marginAmount,
        taxAmount: result.taxAmount,
        totalCost: result.totalCost,
        inquiryId: data.inquiryId || null,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update costing record error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();

    const existing = await prisma.costingRecord.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.createdById && existing.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.costingRecord.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete costing record error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
