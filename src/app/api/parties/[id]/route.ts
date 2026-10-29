import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();

    const body = await req.json();
    const {
      name,
      companyName,
      phone,
      email,
      address,
      city,
      state,
      stateCode,
      pincode,
      gstin,
      pan,
      notes,
    } = body;

    const party = await prisma.party.update({
      where: { id: params.id },
      data: {
        name: name?.trim() || null,
        companyName: companyName?.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || "Gujarat",
        stateCode: stateCode?.trim() || "24",
        pincode: pincode?.trim() || null,
        gstin: gstin?.trim() ? gstin.trim().toUpperCase() : null,
        pan: pan?.trim() ? pan.trim().toUpperCase() : null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ party });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update party error:", error);
    return NextResponse.json({ error: "Failed to update party" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();

    await prisma.party.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete party error:", error);
    return NextResponse.json({ error: "Failed to delete party" }, { status: 500 });
  }
}
