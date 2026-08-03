import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
    
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      select: { fileUrl: true, fileName: true },
    });

    if (!inquiry || !inquiry.fileUrl) {
      return new NextResponse("Not found", { status: 404 });
    }

    const res = await fetch(inquiry.fileUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch file from storage", { status: res.status });
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${inquiry.fileName || "attachment"}"`,
      },
    });
  } catch (error) {
    console.error("Attachment error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
