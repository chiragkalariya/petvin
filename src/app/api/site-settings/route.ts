import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema } from "@/lib/validations";

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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = siteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

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
        signatureImageUrl: data.signatureImageUrl || null,
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
        signatureImageUrl: data.signatureImageUrl || null,
      },
    });

    return NextResponse.json({ settings, message: "Site settings updated successfully!" });
  } catch (err: any) {
    console.error("PUT /api/site-settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update site settings" },
      { status: 500 }
    );
  }
}
