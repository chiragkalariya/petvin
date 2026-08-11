import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { materialSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ materials });
  } catch (error) {
    console.error("List materials error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();

    const body = await req.json();
    const parsed = materialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, ratePerKg, cuttingCostHourly, bendingCostHourly } = parsed.data;

    const material = await prisma.material.upsert({
      where: { name },
      update: {
        ratePerKg: ratePerKg ?? 0,
        cuttingCostHourly: cuttingCostHourly ?? 0,
        bendingCostHourly: bendingCostHourly ?? 0,
      },
      create: {
        name,
        ratePerKg: ratePerKg ?? 0,
        cuttingCostHourly: cuttingCostHourly ?? 0,
        bendingCostHourly: bendingCostHourly ?? 0,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create material error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
