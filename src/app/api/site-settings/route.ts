import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { siteSettingsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const DEFAULT_SITE_SETTINGS = {
  id: "default",
  companyName: "Petvin Febtech",
  tagline: "Laser Cutting & CNC Bending",
  address: "239, Vivekanand industrial park, Kubadthal Road, opp. Arya industrial estate, Kubadthal, Ahmedabad, Gujarat",
  pincode: "382433",
  gstNo: "24EKIPR1824M1ZS",
  panNo: "EKIPR1824M",
  phone: "+91 7600652814 / +91 9624889080",
  email: "petvinfebtech@gmail.com",
  website: "www.petvinfebtech.com",
  bankName: "",
  bankBranch: "",
  bankAccountNo: "",
  bankIfsc: "",
  termsAndConditions: `1. Goods once sold or processed will not be taken back.
2. Payment is due within agreed period from date of invoice.
3. All disputes are subject to Ahmedabad jurisdiction only.`,
  authorisedSignature: "For Petvin Febtech",
  signatureDesignation: "Authorised Signature",
  signatureImageUrl: null,
};

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Create initial default settings record
      settings = await prisma.siteSettings.create({
        data: DEFAULT_SITE_SETTINGS,
      });
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error("GET /api/site-settings error:", err);
    // Fallback to default in-memory settings if db connection issues occur
    return NextResponse.json({ settings: DEFAULT_SITE_SETTINGS });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireUser();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const parsed = siteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: errorMsg, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cleanSigUrl = data.signatureImageUrl?.trim() || null;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        companyName: data.companyName.trim(),
        tagline: data.tagline?.trim() || null,
        address: data.address.trim(),
        pincode: data.pincode.trim(),
        gstNo: data.gstNo.trim().toUpperCase(),
        panNo: data.panNo?.trim().toUpperCase() || null,
        phone: data.phone?.trim() || "+91 7600652814 / +91 9624889080",
        email: data.email?.trim() || "petvinfebtech@gmail.com",
        website: data.website?.trim() || "www.petvinfebtech.com",
        bankName: data.bankName?.trim() || "",
        bankBranch: data.bankBranch?.trim() || "",
        bankAccountNo: data.bankAccountNo?.trim() || "",
        bankIfsc: data.bankIfsc?.trim().toUpperCase() || "",
        termsAndConditions: data.termsAndConditions?.trim() || null,
        authorisedSignature: data.authorisedSignature?.trim() || "For Petvin Febtech",
        signatureDesignation: data.signatureDesignation?.trim() || "Authorised Signature",
        signatureImageUrl: cleanSigUrl,
      },
      create: {
        id: "default",
        companyName: data.companyName.trim(),
        tagline: data.tagline?.trim() || null,
        address: data.address.trim(),
        pincode: data.pincode.trim(),
        gstNo: data.gstNo.trim().toUpperCase(),
        panNo: data.panNo?.trim().toUpperCase() || null,
        phone: data.phone?.trim() || "+91 7600652814 / +91 9624889080",
        email: data.email?.trim() || "petvinfebtech@gmail.com",
        website: data.website?.trim() || "www.petvinfebtech.com",
        bankName: data.bankName?.trim() || "",
        bankBranch: data.bankBranch?.trim() || "",
        bankAccountNo: data.bankAccountNo?.trim() || "",
        bankIfsc: data.bankIfsc?.trim().toUpperCase() || "",
        termsAndConditions: data.termsAndConditions?.trim() || null,
        authorisedSignature: data.authorisedSignature?.trim() || "For Petvin Febtech",
        signatureDesignation: data.signatureDesignation?.trim() || "Authorised Signature",
        signatureImageUrl: cleanSigUrl,
      },
    });

    return NextResponse.json({ settings, message: "Site settings updated successfully!" });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }
    console.error("PUT /api/site-settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update site settings" },
      { status: 500 }
    );
  }
}
