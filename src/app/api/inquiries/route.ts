import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    await requireUser();

    const status = req.nextUrl.searchParams.get("status");

    const inquiries = await prisma.inquiry.findMany({
      where: status ? { status: status as "NEW" | "IN_PROGRESS" | "CLOSED" } : undefined,
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List inquiries error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
