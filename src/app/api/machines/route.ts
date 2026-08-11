import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { machineSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ machines });
  } catch (error) {
    console.error("List machines error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();

    const body = await req.json();
    const parsed = machineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, type } = parsed.data;

    const machine = await prisma.machine.upsert({
      where: { name },
      update: { type },
      create: { name, type },
    });

    return NextResponse.json({ machine }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create machine error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
