import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { companyName: "asc" },
    });
    return NextResponse.json({ parties });
  } catch (error) {
    console.error("List parties error:", error);
    return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    if (!companyName && !name) {
      return NextResponse.json(
        { error: "Company name or party name is required" },
        { status: 400 }
      );
    }

    const party = await prisma.party.create({
      data: {
        name: name?.trim() || null,
        companyName: (companyName?.trim() || name?.trim())!,
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

    return NextResponse.json({ party }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create party error:", error);
    return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
  }
}
