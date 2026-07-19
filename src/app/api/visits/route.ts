import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { companyVisitSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireUser();

    const status = req.nextUrl.searchParams.get("status");

    const visits = await prisma.companyVisit.findMany({
      where: status ? { status: status as "INTERESTED" | "NOT_INTERESTED" | "CONVERTED" | "ON_HOLD" } : undefined,
      include: {
        employee: { select: { id: true, name: true } },
        prospect: { select: { id: true, companyName: true, location: true, industry: true } },
      },
      orderBy: { visitDate: "desc" },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List visits error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = companyVisitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let prospectId = data.prospectId || null;

    // If creating a new prospect inline
    if (data.newProspect && !prospectId) {
      const np = data.newProspect;
      const newProspect = await prisma.prospectCompany.create({
        data: {
          companyName: np.companyName,
          location: np.location || null,
          address: np.address || null,
          industry: np.industry || null,
          contactPerson: np.contactPerson || null,
          contactPhone: np.contactPhone || null,
          contactEmail: np.contactEmail || null,
          potentialParts: np.potentialParts || null,
          priority: np.priority,
          remarks: np.remarks || null,
          createdById: user.id,
        },
      });
      prospectId = newProspect.id;
    }

    const visit = await prisma.companyVisit.create({
      data: {
        companyName: data.companyName,
        address: data.address || null,
        contactPerson: data.contactPerson || null,
        contactPhone: data.contactPhone || null,
        contactEmail: data.contactEmail || null,
        visitDate: new Date(data.visitDate),
        purpose: data.purpose || null,
        requirement: data.requirement || null,
        notes: data.notes || null,
        status: data.status,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        photoUrl: data.photoUrl || null,
        prospectId,
        employeeId: user.id,
      },
    });

    // Update prospect status if linked
    if (prospectId) {
      const visitStatus = data.status;
      let prospectStatus: "IN_PROGRESS" | "VISITED" | "CONVERTED" | "NOT_INTERESTED" = "IN_PROGRESS";
      if (visitStatus === "CONVERTED") prospectStatus = "CONVERTED";
      else if (visitStatus === "NOT_INTERESTED") prospectStatus = "NOT_INTERESTED";
      else prospectStatus = "VISITED";

      await prisma.prospectCompany.update({
        where: { id: prospectId },
        data: { status: prospectStatus },
      });
    }

    return NextResponse.json({ visit }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create visit error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
