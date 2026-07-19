import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { prospectCompanySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    const prospect = await prisma.prospectCompany.findUnique({
      where: { id: params.id },
      include: {
        visits: {
          include: { employee: { select: { id: true, name: true } } },
          orderBy: { visitDate: "desc" },
        },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { visits: true } },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    return NextResponse.json({ prospect });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get prospect error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    const body = await req.json();
    const parsed = prospectCompanySchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const prospect = await prisma.prospectCompany.update({
      where: { id: params.id },
      data: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.industry !== undefined && { industry: data.industry || null }),
        ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson || null }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone || null }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail || null }),
        ...(data.potentialParts !== undefined && { potentialParts: data.potentialParts || null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.remarks !== undefined && { remarks: data.remarks || null }),
      },
    });

    return NextResponse.json({ prospect });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update prospect error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();

    // Check if prospect has visits
    const visitCount = await prisma.companyVisit.count({
      where: { prospectId: params.id },
    });

    if (visitCount > 0) {
      // Unlink visits instead of preventing deletion
      await prisma.companyVisit.updateMany({
        where: { prospectId: params.id },
        data: { prospectId: null },
      });
    }

    await prisma.prospectCompany.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete prospect error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
