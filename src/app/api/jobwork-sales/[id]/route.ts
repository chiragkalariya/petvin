import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { jobworkSaleSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();

    const sale = await prisma.jobworkSale.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Jobwork sale not found" }, { status: 404 });
    }

    return NextResponse.json({ sale });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get jobwork sale error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();

    const existing = await prisma.jobworkSale.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Jobwork sale not found" }, { status: 404 });
    }

    const body = await req.json();

    // Support quick payment update or full edit
    if (body.quickPaymentUpdate) {
      const paidAmount = Math.max(0, round2(parseFloat(body.paidAmount) || 0));
      const totalAmount = existing.totalAmount;
      const balanceAmount = round2(Math.max(0, totalAmount - paidAmount));
      let paymentStatus = existing.paymentStatus;

      if (paidAmount >= totalAmount && totalAmount > 0) {
        paymentStatus = "PAID";
      } else if (paidAmount > 0 && paidAmount < totalAmount) {
        paymentStatus = "PARTIAL";
      } else {
        paymentStatus = "PENDING";
      }

      const updated = await prisma.jobworkSale.update({
        where: { id: params.id },
        data: {
          paidAmount,
          balanceAmount,
          paymentStatus,
          paymentMethod: body.paymentMethod || existing.paymentMethod,
          jobStatus: body.jobStatus || existing.jobStatus,
          notes: body.notes !== undefined ? body.notes : existing.notes,
        },
      });

      return NextResponse.json({ sale: updated });
    }

    // Full form update
    const parsed = jobworkSaleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check invoice number uniqueness if changed
    if (data.invoiceNumber && data.invoiceNumber !== existing.invoiceNumber) {
      const collision = await prisma.jobworkSale.findUnique({
        where: { invoiceNumber: data.invoiceNumber },
      });
      if (collision) {
        return NextResponse.json(
          { error: `Invoice number "${data.invoiceNumber}" is already in use.` },
          { status: 400 }
        );
      }
    }

    const items = data.items.map((it) => ({
      ...it,
      unitPrice: round2(it.unitPrice),
      quantity: round2(it.quantity),
      total: round2(it.quantity * it.unitPrice),
    }));

    const subtotal = round2(items.reduce((s, it) => s + it.total, 0));
    const discountAmount = Math.max(0, round2(data.discountAmount || 0));
    const afterDiscount = Math.max(0, subtotal - discountAmount);

    const taxRatePercent = Math.max(0, round2(data.taxRatePercent ?? 18));
    const taxAmount = round2((afterDiscount * taxRatePercent) / 100);
    const totalAmount = round2(afterDiscount + taxAmount);

    const paidAmount = Math.max(0, round2(data.paidAmount || 0));
    const balanceAmount = round2(Math.max(0, totalAmount - paidAmount));

    let paymentStatus = data.paymentStatus;
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = "PARTIAL";
    } else if (paidAmount === 0) {
      paymentStatus = "PENDING";
    }

    const updated = await prisma.jobworkSale.update({
      where: { id: params.id },
      data: {
        invoiceNumber: data.invoiceNumber || existing.invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone?.trim() || null,
        customerEmail: data.customerEmail?.trim() || null,
        customerGst: data.customerGst?.trim().toUpperCase() || null,
        customerAddress: data.customerAddress?.trim() || null,
        placeOfSupply: data.placeOfSupply?.trim() || null,
        shipToName: data.shipToName?.trim() || null,
        shipToAddress: data.shipToAddress?.trim() || null,
        shipToPhone: data.shipToPhone?.trim() || null,
        shipToGst: data.shipToGst?.trim().toUpperCase() || null,
        challanNumber: data.challanNumber?.trim() || null,
        jobDescription: data.jobDescription?.trim() || null,
        itemsJson: JSON.stringify(items),
        subtotal,
        discountAmount,
        taxRatePercent,
        taxAmount,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus,
        paymentMethod: data.paymentMethod?.trim() || null,
        jobStatus: data.jobStatus,
        notes: data.notes?.trim() || null,
        terms: data.terms?.trim() || null,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ sale: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update jobwork sale error:", error);
    return NextResponse.json({ error: "Failed to update jobwork sale" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser();

    const existing = await prisma.jobworkSale.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Jobwork sale not found" }, { status: 404 });
    }

    await prisma.jobworkSale.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete jobwork sale error:", error);
    return NextResponse.json({ error: "Failed to delete jobwork sale" }, { status: 500 });
  }
}
