import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { prospectCompanySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireUser();

    const status = req.nextUrl.searchParams.get("status");
    const priority = req.nextUrl.searchParams.get("priority");
    const search = req.nextUrl.searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ];
    }

    const prospects = await prisma.prospectCompany.findMany({
      where,
      include: {
        _count: { select: { visits: true } },
        visits: {
          orderBy: { visitDate: "desc" },
          take: 1,
          select: { visitDate: true, status: true },
        },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ prospects });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List prospects error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = prospectCompanySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const prospect = await prisma.prospectCompany.create({
      data: {
        companyName: data.companyName,
        location: data.location || null,
        address: data.address || null,
        industry: data.industry || null,
        contactPerson: data.contactPerson || null,
        contactPhone: data.contactPhone || null,
        contactEmail: data.contactEmail || null,
        potentialParts: data.potentialParts || null,
        priority: data.priority,
        remarks: data.remarks || null,
        createdById: user.id,
      },
    });

    return NextResponse.json({ prospect }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create prospect error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
