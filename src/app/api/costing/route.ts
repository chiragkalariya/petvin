import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { costingRecordSchema } from "@/lib/validations";
import { calculateCosting } from "@/lib/costing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();

    const records = await prisma.costingRecord.findMany({
      include: { inquiry: { select: { id: true, name: true, company: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ records });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List costing records error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    // Server recomputes the totals itself -- never trust client-calculated
    // numbers for a saved quote, in case the client and server logic ever drift.
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

    const record = await prisma.costingRecord.create({
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
        createdById: user.id,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create costing record error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

