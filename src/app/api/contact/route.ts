import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, company, phone, email, message, fileUrl, fileName } = parsed.data;

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        company: company || null,
        phone,
        email: email || null,
        message: message || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
    });

    return NextResponse.json({ id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
