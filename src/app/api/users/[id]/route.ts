import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAdmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            visits: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Prevent deleting own account
    if (
      currentUser.id === targetUser.id ||
      currentUser.email?.toLowerCase() === targetUser.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Reassign visits to current admin if any exist so company visit history remains intact
    if (targetUser._count.visits > 0) {
      await prisma.companyVisit.updateMany({
        where: { employeeId: targetUser.id },
        data: { employeeId: currentUser.id },
      });
    }

    // Disassociate optional foreign keys
    await prisma.inquiry.updateMany({
      where: { assignedToId: targetUser.id },
      data: { assignedToId: null },
    });

    await prisma.prospectCompany.updateMany({
      where: { createdById: targetUser.id },
      data: { createdById: null },
    });

    await prisma.costingRecord.updateMany({
      where: { createdById: targetUser.id },
      data: { createdById: null },
    });

    await prisma.note.updateMany({
      where: { authorId: targetUser.id },
      data: { authorId: null },
    });

    // Delete user from database
    await prisma.user.delete({
      where: { id: targetUser.id },
    });

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

