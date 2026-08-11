import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
    const body = await req.json();

    const dataToUpdate: {
      ratePerKg?: number;
      cuttingCostHourly?: number;
      bendingCostHourly?: number;
      name?: string;
    } = {};
    if (typeof body.ratePerKg === "number") dataToUpdate.ratePerKg = body.ratePerKg;
    if (typeof body.cuttingCostHourly === "number") dataToUpdate.cuttingCostHourly = body.cuttingCostHourly;
    if (typeof body.bendingCostHourly === "number") dataToUpdate.bendingCostHourly = body.bendingCostHourly;
    if (body.name) dataToUpdate.name = body.name;

    const material = await prisma.material.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ material });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update material error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    await prisma.material.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete material error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
