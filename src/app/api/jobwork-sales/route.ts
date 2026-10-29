import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { jobworkSaleSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/** Round to 2 decimal places */
function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/** Helper to generate next sequential invoice number series like PF/26-27/0001 */
async function generateInvoiceNumber(invoiceDate: Date = new Date()): Promise<string> {
  const month = invoiceDate.getMonth(); // 0-indexed, April is 3
  const fullYear = invoiceDate.getFullYear();
  const startYear = month >= 3 ? fullYear : fullYear - 1;
  const endYear = startYear + 1;
  const fyCode = `${String(startYear % 100).padStart(2, "0")}-${String(endYear % 100).padStart(2, "0")}`;
  const prefix = `PF/${fyCode}/`;

  const salesWithPrefix = await prisma.jobworkSale.findMany({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    select: {
      invoiceNumber: true,
    },
  });

  let maxSeq = 0;
  for (const s of salesWithPrefix) {
    if (s.invoiceNumber) {
      const parts = s.invoiceNumber.split("/");
      const lastPart = parts[parts.length - 1];
      const seq = parseInt(lastPart ?? "0", 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    await requireUser();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const paymentStatus = searchParams.get("paymentStatus");
    const jobStatus = searchParams.get("jobStatus");

    // Build Prisma where filter
    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customerGst: { contains: search, mode: "insensitive" } },
        { challanNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (paymentStatus && ["PENDING", "PARTIAL", "PAID"].includes(paymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    if (
      jobStatus &&
      ["PENDING", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"].includes(jobStatus)
    ) {
      where.jobStatus = jobStatus;
    }

    const [sales, allSalesForMetrics] = await Promise.all([
      prisma.jobworkSale.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      // Metric aggregate across all sales (unfiltered)
      prisma.jobworkSale.findMany({
        select: {
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
          paymentStatus: true,
          jobStatus: true,
        },
      }),
    ]);

    const totalRevenue = round2(allSalesForMetrics.reduce((sum, s) => sum + s.totalAmount, 0));
    const totalPaid = round2(allSalesForMetrics.reduce((sum, s) => sum + s.paidAmount, 0));
    const totalPending = round2(allSalesForMetrics.reduce((sum, s) => sum + s.balanceAmount, 0));
    const pendingJobsCount = allSalesForMetrics.filter(
      (s) => s.jobStatus === "PENDING" || s.jobStatus === "IN_PROGRESS"
    ).length;
    const completedJobsCount = allSalesForMetrics.filter(
      (s) => s.jobStatus === "COMPLETED" || s.jobStatus === "DELIVERED"
    ).length;

    const nextInvoiceNumber = await generateInvoiceNumber();

    return NextResponse.json({
      sales,
      nextInvoiceNumber,
      metrics: {
        totalRevenue,
        totalPaid,
        totalPending,
        totalInvoices: allSalesForMetrics.length,
        pendingJobsCount,
        completedJobsCount,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List jobwork sales error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = jobworkSaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Server recalculates all financial totals to guarantee integrity
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

    // Auto-generate invoice number if empty or not provided
    let invoiceNumber = data.invoiceNumber?.trim();
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber();
    } else {
      // Check for collision
      const existing = await prisma.jobworkSale.findUnique({
        where: { invoiceNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Invoice number "${invoiceNumber}" is already in use. Please choose another.` },
          { status: 400 }
        );
      }
    }

    const record = await prisma.jobworkSale.create({
      data: {
        invoiceNumber,
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
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ sale: record }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create jobwork sale error:", error);
    return NextResponse.json({ error: "Failed to create jobwork sale" }, { status: 500 });
  }
}
