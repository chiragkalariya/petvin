"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Landmark,
  FileText,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileCheck2,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";

function getDisplayImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("/") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  return `/api/image?url=${encodeURIComponent(trimmed)}`;
}

export interface SiteSettingsState {
  companyName: string;
  tagline: string;
  address: string;
  pincode: string;
  gstNo: string;
  panNo: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankIfsc: string;
  termsAndConditions: string;
  authorisedSignature: string;
  signatureDesignation: string;
  signatureImageUrl: string;
}

const DEFAULT_FORM_STATE: SiteSettingsState = {
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
  signatureImageUrl: "",
};

export function SiteSettingsManager() {
  const [formData, setFormData] = useState<SiteSettingsState>(DEFAULT_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingSig, setIsUploadingSig] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/site-settings");
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.settings) {
          setFormData({
            companyName: data.settings.companyName || DEFAULT_FORM_STATE.companyName,
            tagline: data.settings.tagline || "",
            address: data.settings.address || DEFAULT_FORM_STATE.address,
            pincode: data.settings.pincode || DEFAULT_FORM_STATE.pincode,
            gstNo: data.settings.gstNo || DEFAULT_FORM_STATE.gstNo,
            panNo: data.settings.panNo || DEFAULT_FORM_STATE.panNo,
            phone: data.settings.phone || DEFAULT_FORM_STATE.phone,
            email: data.settings.email || DEFAULT_FORM_STATE.email,
            website: data.settings.website || DEFAULT_FORM_STATE.website,
            bankName: data.settings.bankName || "",
            bankBranch: data.settings.bankBranch || "",
            bankAccountNo: data.settings.bankAccountNo || "",
            bankIfsc: data.settings.bankIfsc || "",
            termsAndConditions: data.settings.termsAndConditions || DEFAULT_FORM_STATE.termsAndConditions,
            authorisedSignature: data.settings.authorisedSignature || DEFAULT_FORM_STATE.authorisedSignature,
            signatureDesignation: data.settings.signatureDesignation || DEFAULT_FORM_STATE.signatureDesignation,
            signatureImageUrl: data.settings.signatureImageUrl || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load site settings:", err);
      toast.error("Failed to load settings. Using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SiteSettingsState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Signature image must be under 5MB");
      e.target.value = "";
      return;
    }

    setIsUploadingSig(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("access", "public");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.url) {
        handleChange("signatureImageUrl", data.url);
        toast.success("Signature uploaded! Click 'Save Changes' to apply.");
      } else {
        toast.error(data?.error || "Upload failed. Please upload a PNG, JPG, or WEBP image under 5MB.");
      }
    } catch (err: any) {
      console.error("Signature upload error:", err);
      toast.error(err?.message || "Failed to upload signature image");
    } finally {
      setIsUploadingSig(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(resData?.error || `Failed to save settings (HTTP ${res.status})`);
      }

      toast.success("Site and billing settings updated successfully!");
    } catch (err: any) {
      console.error("Save settings error:", err);
      toast.error(err?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset form to default company parameters? You can modify and save afterwards.")) {
      setFormData(DEFAULT_FORM_STATE);
      toast.success("Loaded default values. Click Save to persist.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company & Print Settings"
        description="Configure dynamic company profile, bank accounts, GST/PAN numbers, and invoice defaults used across all printable vouchers and invoices."
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Company Profile */}
          <div className="border border-line bg-bg-alt p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Legal Identity & Address
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Company Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Tagline / Business Nature
                </label>
                <input
                  type="text"
                  placeholder="e.g. Laser Cutting & CNC Bending"
                  value={formData.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Pincode <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Registered Address <span className="text-accent">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full border border-line bg-bg p-3 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  GSTIN <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.gstNo}
                  onChange={(e) => handleChange("gstNo", e.target.value.toUpperCase())}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  PAN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. EKIPR1824M"
                  value={formData.panNo}
                  onChange={(e) => handleChange("panNo", e.target.value.toUpperCase())}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bank Account Details */}
          <div className="border border-line bg-bg-alt p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Bank Account Details (Prints on Invoices)
            </h2>
            <p className="text-xs text-ink-dimmer">
              These details are automatically printed inside the bottom bank details box of all Tax Invoices / Labour Bills.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank / State Bank of India"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Branch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Odhav / Kubadthal Branch"
                  value={formData.bankBranch}
                  onChange={(e) => handleChange("bankBranch", e.target.value)}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Account Number (A/C No)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50200012345678"
                  value={formData.bankAccountNo}
                  onChange={(e) => handleChange("bankAccountNo", e.target.value)}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={formData.bankIfsc}
                  onChange={(e) => handleChange("bankIfsc", e.target.value.toUpperCase())}
                  className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Terms & Authorised Signature */}
          <div className="border border-line bg-bg-alt p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <FileCheck2 className="h-4 w-4" />
              Invoice Terms & Authorised Signature
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Default Terms & Conditions (One point per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.termsAndConditions}
                  onChange={(e) => handleChange("termsAndConditions", e.target.value)}
                  className="w-full border border-line bg-bg p-3 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-ink-dimmer">
                  Appears below the bank table on printed invoices unless overridden for a specific sale.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                    Signature Title Header
                  </label>
                  <input
                    type="text"
                    value={formData.authorisedSignature}
                    onChange={(e) => handleChange("authorisedSignature", e.target.value)}
                    placeholder="e.g. For Petvin Febtech"
                    className="w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-ink-dimmer">Printed above the stamp and signing space</p>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer flex items-center justify-between">
                    <span>Authorised Signature Image</span>
                    {formData.signatureImageUrl && (
                      <span className="text-[10px] text-emerald-400 font-sans font-normal">Active on Prints</span>
                    )}
                  </label>

                  {formData.signatureImageUrl ? (
                    <div className="flex items-center gap-3 border border-line bg-bg p-2 rounded">
                      <div className="flex h-12 w-28 items-center justify-center rounded border border-line-soft bg-white p-1">
                        <img
                          src={getDisplayImageUrl(formData.signatureImageUrl)}
                          alt="Authorised Signature"
                          className="max-h-10 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-mono text-ink font-semibold">Signature uploaded</p>
                        <p className="text-[10px] text-ink-dimmer">Prints above signing line</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="cursor-pointer rounded border border-line bg-bg-alt px-2.5 py-1 text-xs text-ink hover:border-accent hover:text-accent transition-colors">
                          Replace
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleSignatureUpload}
                            className="hidden"
                            disabled={isUploadingSig}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleChange("signatureImageUrl", "")}
                          className="flex h-7 w-7 items-center justify-center rounded border border-line bg-bg text-ink-dim hover:border-red-500 hover:text-red-400 transition-colors"
                          title="Remove signature"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-line bg-bg px-4 py-3 cursor-pointer hover:border-accent/60 hover:bg-bg-alt transition-colors group">
                      <div className="flex items-center gap-2 text-ink-dim group-hover:text-accent">
                        <UploadCloud className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {isUploadingSig ? "Uploading signature..." : "Upload Signature Image"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-ink-dimmer">PNG with transparent background, JPG, or SVG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleSignatureUpload}
                        className="hidden"
                        disabled={isUploadingSig}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Communication */}
          <div className="border border-line bg-bg-alt p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Details (Header Bar)
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Contact Phone Numbers
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full border border-line bg-bg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Official Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-line bg-bg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Website URL
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="w-full border border-line bg-bg px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Print Header & Bank Table Preview */}
        <div className="space-y-6">
          <div className="border border-line bg-bg-alt p-6">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Live Print Preview
            </h3>
            <p className="text-xs text-ink-dimmer mb-4">
              Here is how your company identity and bank table will appear on invoices:
            </p>

            {/* Simulated Invoice Header Box */}
            <div className="border border-line bg-white p-4 rounded text-[#1e293b] text-xs space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <img src="/images/petvin_febtech_updated.svg" alt="Logo" className="h-8 w-auto" />
                <div className="text-right">
                  <div className="font-bold text-sm text-[#1e3a8a]">Labour Bill</div>
                  <div className="text-[10px] text-[#475569]">{formData.email}</div>
                  <div className="text-[10px] text-[#475569]">{formData.phone}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-sm text-[#0f172a]">{formData.companyName}</div>
                <div className="text-[11px] text-[#475569] leading-tight">
                  {formData.address} {formData.pincode ? `(${formData.pincode})` : ""}
                </div>
                <div className="mt-1 font-semibold text-[11px] text-[#0f172a]">
                  GSTIN: {formData.gstNo || "—"} {formData.panNo ? `| PAN: ${formData.panNo}` : ""}
                </div>
              </div>

              {/* Simulated Bank Details Table Preview */}
              <div className="pt-2 border-t">
                <div className="text-[10px] font-mono uppercase text-[#64748b] mb-1 font-bold">Bank Table Preview:</div>
                <table className="w-full border-collapse text-[10px] text-center">
                  <thead>
                    <tr className="bg-[#eef4fa] text-[#1e293b] font-bold">
                      <th className="border border-[#dbeafe] p-1">Bank Name</th>
                      <th className="border border-[#dbeafe] p-1">Branch</th>
                      <th className="border border-[#dbeafe] p-1">A/C No</th>
                      <th className="border border-[#dbeafe] p-1">IFSC</th>
                      <th className="border border-[#dbeafe] p-1">Round Off</th>
                      <th className="border border-[#dbeafe] p-1 text-right font-normal">0.00</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white text-[#0f172a]">
                      <td className="border border-[#e2e8f0] p-1 font-medium">{formData.bankName || "—"}</td>
                      <td className="border border-[#e2e8f0] p-1">{formData.bankBranch || "—"}</td>
                      <td className="border border-[#e2e8f0] p-1 font-mono">{formData.bankAccountNo || "—"}</td>
                      <td className="border border-[#e2e8f0] p-1 font-mono">{formData.bankIfsc || "—"}</td>
                      <td className="border border-[#e2e8f0] p-1 font-bold bg-[#f8fafc]">Invoice Value</td>
                      <td className="border border-[#e2e8f0] p-1 text-right font-bold">₹ 6,504.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Simulated Signature */}
              <div className="pt-4 flex justify-end">
                <div className="text-center w-36">
                  <div className="text-[10px] font-bold text-[#0f172a]">{formData.authorisedSignature || "For Petvin Febtech"}</div>
                  {formData.signatureImageUrl ? (
                    <div className="h-10 flex items-center justify-center my-0.5">
                      <img src={getDisplayImageUrl(formData.signatureImageUrl)} alt="Signature Preview" className="max-h-9 max-w-[130px] object-contain" />
                    </div>
                  ) : (
                    <div className="h-8" />
                  )}
                  <div className="border-t border-[#475569] pt-0.5 text-[9px] font-semibold text-[#334155]">
                    {formData.signatureDesignation || "Authorised Signature"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-line">
              <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Site Settings
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
