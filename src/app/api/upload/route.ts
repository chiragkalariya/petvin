import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = [".dxf", ".pdf", ".png", ".jpg", ".jpeg", ".webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be smaller than 15MB" }, { status: 400 });
    }

    const extension = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Allowed file types: DXF, PDF, PNG, JPG, WEBP" },
        { status: 400 }
      );
    }

    // The Vercel Blob store is configured as Private, so we MUST use access: 'private'
    // Determine the folder prefix based on the intended access type (just for organization)
    const isPublicIntent = formData.get("access") === "public";
    const folderPrefix = isPublicIntent ? "portfolio" : "inquiries";
    const uniqueName = `${folderPrefix}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(uniqueName, file, {
      access: 'private',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
