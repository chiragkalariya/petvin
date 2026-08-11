import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
    const body = await req.json();

    const dataToUpdate: { name?: string; type?: "CUTTING" | "BENDING" } = {};
    if (body.name) dataToUpdate.name = body.name;
    if (body.type === "CUTTING" || body.type === "BENDING") dataToUpdate.type = body.type;

    const machine = await prisma.machine.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ machine });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update machine error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    await prisma.machine.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete machine error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
