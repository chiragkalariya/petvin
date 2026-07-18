import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { noteSchema } from "@/lib/validations";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        content: parsed.data.content,
        inquiryId: params.id,
        authorId: user.id,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Add note error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
