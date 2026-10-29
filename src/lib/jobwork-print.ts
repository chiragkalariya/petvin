export interface JobworkLineItemData {
  id: string;
  partName: string;
  processType: string;
  material?: string;
  thicknessMm?: number;
  hsnSac: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface JobworkSalePrintData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  dueDate?: string | Date | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerGst?: string | null;
  customerAddress?: string | null;
  placeOfSupply?: string | null;
  shipToName?: string | null;
  shipToAddress?: string | null;
  shipToPhone?: string | null;
  shipToGst?: string | null;
  challanNumber?: string | null;
  jobDescription?: string | null;
  itemsJson: string;
  subtotal: number;
  discountAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  jobStatus: string;
  notes?: string | null;
  terms?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
}

export interface CompanySettingsData {
  companyName?: string | null;
  tagline?: string | null;
  address?: string | null;
  pincode?: string | null;
  gstNo?: string | null;
  panNo?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  termsAndConditions?: string | null;
  authorisedSignature?: string | null;
  signatureDesignation?: string | null;
  signatureImageUrl?: string | null;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettingsData = {
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

/** Format currency with space after symbol like "₹ 5,512.00" matching given PDF */
export function formatInr(val: number): string {
  const rounded = Math.round((val + Number.EPSILON) * 100) / 100;
  return `₹ ${rounded.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format date as DD-MM-YY or DD-MM-YYYY */
export function formatDmy(dateInput: Date | string): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function parseItems(jsonStr: string): JobworkLineItemData[] {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function printHtmlViaIframe(htmlContent: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    alert("Could not generate print document.");
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 350);
}

/**
 * Generates the Tax Invoice HTML matching the user's provided PDF format.
 * @param sale Invoice details
 * @param isPadPrint If true, hides the pre-printed company logo/header for printing on physical letterhead pad.
 * @param companySettings Dynamic site/company settings (falls back to DEFAULT_COMPANY_SETTINGS)
 */
export function generateJobworkInvoiceHtml(
  sale: JobworkSalePrintData,
  isPadPrint: boolean = false,
  companySettings?: CompanySettingsData | null
): string {
  const settings = companySettings || DEFAULT_COMPANY_SETTINGS;
  const companyName = settings.companyName?.trim() || "Petvin Febtech";
  const companyAddress = settings.address?.trim() || "239, Vivekanand industrial park, Kubadthal Road, opp. Arya industrial estate, Kubadthal, Ahmedabad, Gujarat";
  const companyPincode = settings.pincode?.trim() || "382433";
  const companyFullAddress = companyPincode && !companyAddress.includes(companyPincode)
    ? `${companyAddress} ${companyPincode}`
    : companyAddress;
  const companyGst = settings.gstNo?.trim().toUpperCase() || "24EKIPR1824M1ZS";
  const companyPan = settings.panNo?.trim().toUpperCase() || (companyGst.length >= 12 ? companyGst.slice(2, 12) : "");
  const companyPhone = settings.phone?.trim() || "+91 7600652814 / +91 9624889080";
  const companyEmail = settings.email?.trim() || "petvinfebtech@gmail.com";
  const companyWebsite = settings.website?.trim() || "www.petvinfebtech.com";

  const bankName = sale.bankName || settings.bankName || "";
  const bankBranch = sale.bankBranch || settings.bankBranch || "";
  const bankAccountNo = sale.bankAccountNo || settings.bankAccountNo || "";
  const bankIfsc = sale.bankIfsc || settings.bankIfsc || "";

  const rawTerms = sale.terms?.trim() || settings.termsAndConditions?.trim() || "";
  const termsLines = rawTerms
    ? rawTerms.split("\n").filter((l) => l.trim().length > 0)
    : [
      "1. Goods once sold or processed will not be taken back.",
      "2. Payment is due within agreed period from date of invoice.",
      "3. All disputes are subject to Ahmedabad jurisdiction only.",
    ];

  const authorisedSigHeader = settings.authorisedSignature?.trim() || `For ${companyName}`;
  const authorisedSigDesignation = settings.signatureDesignation?.trim() || "Authorised Signature";

  const rawSigUrl = settings.signatureImageUrl?.trim() || "";
  const signatureImgUrl = rawSigUrl
    ? (rawSigUrl.startsWith("http") && rawSigUrl.includes("blob.vercel-storage.com")
      ? `/api/image?url=${encodeURIComponent(rawSigUrl)}`
      : rawSigUrl)
    : "";

  const items = parseItems(sale.itemsJson);
  const invoiceDateStr = formatDmy(sale.invoiceDate);
  const placeOfSupply = sale.placeOfSupply?.trim() || "—";

  // Bill To details
  const billName = sale.customerName || "—";
  const billAddress = sale.customerAddress || "—";
  const billPhone = sale.customerPhone || "—";
  const billGst = sale.customerGst || "—";

  // Ship To details (falls back to Bill To if not specified)
  const shipName = sale.shipToName?.trim() || billName;
  const shipAddress = sale.shipToAddress?.trim() || billAddress;
  const shipPhone = sale.shipToPhone?.trim() || billPhone;
  const shipGst = sale.shipToGst?.trim() || billGst;

  // Tax calculations: CGST & SGST (9% each for 18% standard job work)
  const taxRate = sale.taxRatePercent ?? 18;
  const halfRate = taxRate / 2;
  const taxableAmount = Math.max(0, sale.subtotal - (sale.discountAmount || 0));
  const halfTaxAmount = Math.round(((taxableAmount * halfRate) / 100 + Number.EPSILON) * 100) / 100;
  const totalTaxAmount = Math.round((halfTaxAmount * 2 + Number.EPSILON) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + totalTaxAmount + Number.EPSILON) * 100) / 100;

  // Aggregate HSN items for the HSN/SAC table
  const hsnGroups: Record<
    string,
    { hsn: string; taxable: number; taxRate: number; cgst: number; sgst: number; totalTax: number }
  > = {};

  if (items.length > 0) {
    items.forEach((it) => {
      const code = it.hsnSac || "—";
      if (!hsnGroups[code]) {
        hsnGroups[code] = {
          hsn: code,
          taxable: 0,
          taxRate,
          cgst: 0,
          sgst: 0,
          totalTax: 0,
        };
      }
      hsnGroups[code]!.taxable += it.total;
    });

    Object.keys(hsnGroups).forEach((k) => {
      const g = hsnGroups[k]!;
      g.cgst = Math.round(((g.taxable * halfRate) / 100 + Number.EPSILON) * 100) / 100;
      g.sgst = g.cgst;
      g.totalTax = g.cgst + g.sgst;
    });
  } else {
    hsnGroups["9988"] = {
      hsn: "9988",
      taxable: taxableAmount,
      taxRate,
      cgst: halfTaxAmount,
      sgst: halfTaxAmount,
      totalTax: totalTaxAmount,
    };
  }

  // Calculate round-off & final invoice value (matching the provided commercial template)
  const rawTotal = grandTotal;
  const roundedInvoiceVal = Math.round(rawTotal);
  const roundOffDiff = Math.round((roundedInvoiceVal - rawTotal + Number.EPSILON) * 1000) / 1000;
  let roundOffFormatted = "0.00";
  if (Math.abs(roundOffDiff) > 0.0001) {
    const decPart = Math.abs(roundOffDiff).toFixed(3).split(".")[1] || "";
    const precision = decPart.endsWith("0") ? 2 : 3;
    roundOffFormatted = (roundOffDiff > 0 ? "+" : "") + roundOffDiff.toFixed(precision);
  }
  const invoiceValueFormatted = formatInr(roundedInvoiceVal > 0 ? roundedInvoiceVal : rawTotal);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Labour Bill - ${sale.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 4mm 6mm 4mm 6mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      height: 100%;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 11.5px;
      line-height: 1.4;
    }

    .invoice-wrapper {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: calc(297mm - 10mm);
      box-sizing: border-box;
    }

    .content-top {
      flex: 1 0 auto;
    }

    .bottom-section {
      margin-top: auto;
      page-break-inside: avoid;
    }

    /* ─── Top Header (Petvin Febtech + Tax Invoice) ─── */
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 10px;
    }
    .brand-logo-area {
      display: flex;
      align-items: center;
      align-self: center;
      gap: 10px;
    }
    .brand-logo-img {
      height: 46px;
      max-height: 50px;
      width: auto;
      display: block;
      object-fit: contain;
    }

    .header-right {
      text-align: right;
    }
    .doc-title {
      font-size: 19px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .header-contact {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.4;
    }

    /* Spacer for Pad Print (Letterhead mode) - compact reduced margin */
    .pad-print-spacer {
      height: 25mm;
      width: 100%;
    }

    /* ─── Company & Invoice Meta Box ─── */
    .info-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 14px;
    }
    .company-address-col {
      flex: 1;
      font-size: 12px;
      color: #334155;
      line-height: 1.5;
    }
    .company-address-col .company-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .company-address-col .gstin-row {
      margin-top: 5px;
      font-weight: 700;
      color: #0f172a;
    }

    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 14px;
      min-width: 270px;
    }
    .meta-card table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .meta-card td {
      padding: 3px 2px;
    }
    .meta-card .label {
      color: #334155;
      font-weight: 600;
      width: 115px;
    }
    .meta-card .colon {
      width: 10px;
      text-align: center;
      color: #334155;
    }
    .meta-card .val {
      text-align: right;
      color: #0f172a;
      font-weight: 600;
    }

    /* ─── Bill To / Ship To Cards ─── */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .party-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 11.5px;
      color: #334155;
      line-height: 1.4;
    }
    .party-box-title {
      font-size: 12px;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 5px;
    }
    .party-name {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .party-detail {
      margin-top: 2px;
    }

    /* ─── Products Table ─── */
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .products-table thead th {
      background: #eef4fa;
      color: #1e293b;
      font-weight: 700;
      font-size: 11.5px;
      padding: 6px 8px;
      border: 1px solid #dbeafe;
      text-align: left;
    }
    .products-table thead th.text-center { text-align: center; }
    .products-table thead th.text-right { text-align: right; }

    .products-table tbody td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      font-size: 11.5px;
      color: #0f172a;
      vertical-align: middle;
    }
    .products-table tbody td.text-center { text-align: center; }
    .products-table tbody td.text-right { text-align: right; }

    /* ─── Summary Totals Box ─── */
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .summary-box {
      width: 310px;
      font-size: 11.5px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 6px;
      color: #334155;
      font-weight: 500;
    }
    .sum-row .val {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 6px;
      margin-top: 3px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      font-weight: 700;
      font-size: 12.5px;
      color: #0f172a;
    }
    .grand-total-row .val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    /* ─── HSN/SAC Tax Summary Table ─── */
    .hsn-table-wrap {
      margin-bottom: 12px;
    }
    .hsn-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .hsn-table thead th {
      background: #eef4fa;
      color: #1e293b;
      font-weight: 700;
      padding: 4px 6px;
      border: 1px solid #dbeafe;
      text-align: center;
    }
    .hsn-table tbody td {
      border: 1px solid #e2e8f0;
      padding: 4px 6px;
      text-align: center;
      color: #0f172a;
    }
    .hsn-table tbody td.text-right { text-align: right; }
    .hsn-table tfoot td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      font-weight: 700;
      text-align: center;
      background: #f8fafc;
      color: #0f172a;
    }
    .hsn-table tfoot td.text-right { text-align: right; }

    /* ─── Bank Details & Round-Off / Invoice Value Table ─── */
    .bank-roundoff-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .bank-roundoff-table thead th {
      background: #eef4fa;
      color: #1e293b;
      font-weight: 700;
      padding: 5px 6px;
      border: 1px solid #dbeafe;
      text-align: center;
      font-size: 11px;
    }
    .bank-roundoff-table tbody td {
      border: 1px solid #e2e8f0;
      padding: 5px 6px;
      font-size: 11px;
      color: #0f172a;
      text-align: center;
      vertical-align: middle;
    }
    .bank-roundoff-table .th-roundoff {
      background: #eef4fa;
      color: #1e293b;
      font-weight: normal;
      border: 1px solid #dbeafe;
    }
    .bank-roundoff-table .th-roundoff-val {
      text-align: right;
      padding-right: 8px;
      font-weight: normal;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #0f172a;
    }
    .bank-roundoff-table .td-invoice-val-label {
      background: #f8fafc;
      font-weight: 700;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }
    .bank-roundoff-table .td-invoice-val-num {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
      padding-right: 8px;
      border: 1px solid #e2e8f0;
      font-size: 11.5px;
    }
    .bank-roundoff-table .data-row td {
      height: 25px;
    }

    /* ─── Terms & Conditions ─── */
    .terms-section {
      margin-top: 6px;
      margin-bottom: 8px;
      font-size: 10px;
      line-height: 1.45;
      color: #334155;
    }
    .terms-title {
      font-weight: 700;
      font-size: 10px;
      color: #0f172a;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .terms-content {
      color: #475569;
    }
    .terms-content div {
      margin-bottom: 1px;
    }

    /* ─── Signatures ─── */
    .signatures-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 6px;
      margin-top: 6px;
      margin-bottom: 6px;
    }
    .receiver-sign-col {
      text-align: center;
      width: 170px;
    }
    .sign-rule {
      border-top: 1px solid #475569;
      margin-bottom: 4px;
      width: 100%;
    }
    .sign-caption {
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }

    .company-sign-col {
      text-align: center;
      width: 190px;
    }
    .company-sign-header {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .company-signature-img-wrap {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }
    .company-signature-img {
      max-height: 48px;
      max-width: 160px;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }
    .signature-space {
      height: 52px;
      margin-bottom: 4px;
    }

    /* ─── Page Footer ─── */
    .page-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
      margin-top: 8px;
    }

    @media print {
      html, body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .invoice-wrapper {
        min-height: calc(297mm - 10mm) !important;
        height: calc(297mm - 10mm) !important;
        max-height: calc(297mm - 10mm) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        overflow: hidden;
      }
      .bottom-section {
        margin-top: auto !important;
        page-break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="content-top">
      ${isPadPrint
      ? `<!-- Pad Print Header Spacer for pre-printed letterhead pad -->
      <div class="pad-print-spacer"></div>`
      : `<!-- Full Header with Petvin Febtech logo & contact -->
      <div class="header-top">
        <div class="brand-logo-area">
          <img src="/images/petvin_febtech_updated.svg" alt="${companyName}" class="brand-logo-img" />
        </div>
        <div class="header-right">
          <div class="doc-title">Labour Bill</div>
          <div class="header-contact">Email: ${companyEmail}</div>
          <div class="header-contact">Phone: ${companyPhone}</div>
          <div class="header-contact">Website: ${companyWebsite}</div>
        </div>
      </div>`
    }

      <!-- Company Details & Invoice Meta -->
      <div class="info-meta-row">
        <div class="company-address-col" ${isPadPrint ? 'style="visibility: hidden;"' : ""}>
          <div class="company-name">${companyName}</div>
          <div style="max-width: 320px; line-height: 1.45;">${companyFullAddress}</div>
          <div class="gstin-row">
            GSTIN: <strong>${companyGst}</strong>${companyPan ? ` | PAN: <strong>${companyPan}</strong>` : ""}
          </div>
        </div>

        <div class="meta-card">
          <table>
            <tr>
              <td class="label">Invoice No.</td>
              <td class="colon">:</td>
              <td class="val">${sale.invoiceNumber}</td>
            </tr>
            <tr>
              <td class="label">Invoice Date</td>
              <td class="colon">:</td>
              <td class="val">${invoiceDateStr}</td>
            </tr>
            <tr>
              <td class="label">Place of Supply</td>
              <td class="colon">:</td>
              <td class="val">${placeOfSupply}</td>
            </tr>
            ${sale.challanNumber
      ? `<tr>
              <td class="label">Challan No.</td>
              <td class="colon">:</td>
              <td class="val">${sale.challanNumber}</td>
            </tr>`
      : ""
    }
          </table>
        </div>
      </div>

      <!-- Bill To & Ship To Cards -->
      <div class="parties-grid">
        <div class="party-box">
          <div class="party-box-title">Bill To</div>
          <div class="party-name">${billName}</div>
          <div class="party-detail">${billAddress}</div>
          <div class="party-detail">Phone: ${billPhone}</div>
          <div class="party-detail">GSTIN: <strong>${billGst}</strong></div>
        </div>

        <div class="party-box">
          <div class="party-box-title">Ship To</div>
          <div class="party-name">${shipName}</div>
          <div class="party-detail">${shipAddress}</div>
          <div class="party-detail">Phone: ${shipPhone}</div>
          <div class="party-detail">GSTIN: <strong>${shipGst}</strong></div>
        </div>
      </div>

      <!-- Products Table -->
      <table class="products-table">
        <thead>
          <tr>
            <th>Products</th>
            <th class="text-center" style="width: 85px;">HSN</th>
            <th class="text-center" style="width: 95px;">Qty</th>
            <th class="text-right" style="width: 105px;">Price</th>
            <th class="text-right" style="width: 125px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items
      .map(
        (item) => `
            <tr>
              <td>
                <strong>${item.partName}</strong>
              </td>
              <td class="text-center">${item.hsnSac || "—"}</td>
              <td class="text-center font-medium">${item.quantity} ${item.unit || "Nos"}</td>
              <td class="text-right">${formatInr(item.unitPrice)}</td>
              <td class="text-right font-medium">${formatInr(item.total)}</td>
            </tr>
          `
      )
      .join("")}
        </tbody>
      </table>

      <!-- Subtotal and GST Breakdown -->
      <div class="summary-section">
        <div class="summary-box">
          <div class="sum-row">
            <span>Total Items Subtotal</span>
            <span class="val">${formatInr(taxableAmount)}</span>
          </div>
          ${sale.discountAmount > 0
      ? `<div class="sum-row">
            <span>Discount</span>
            <span class="val" style="color: #16a34a;">-${formatInr(sale.discountAmount)}</span>
          </div>`
      : ""
    }
          <div class="sum-row">
            <span>CGST (${halfRate}%)</span>
            <span class="val">${formatInr(halfTaxAmount)}</span>
          </div>
          <div class="sum-row">
            <span>SGST (${halfRate}%)</span>
            <span class="val">${formatInr(halfTaxAmount)}</span>
          </div>
          <div class="grand-total-row">
            <span>Grand Total</span>
            <span class="val">${formatInr(grandTotal)}</span>
          </div>
        </div>
      </div>

      <!-- HSN/SAC Tax Breakdown Table -->
      <div class="hsn-table-wrap">
        <table class="hsn-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 110px;">HSN/SAC</th>
              <th rowspan="2" style="width: 140px;">Taxable Amount</th>
              <th colspan="2">CGST</th>
              <th colspan="2">SGST</th>
              <th rowspan="2" style="width: 140px;">Total Tax Amount</th>
            </tr>
            <tr>
              <th style="width: 65px;">Rate</th>
              <th style="width: 95px;">Amount</th>
              <th style="width: 65px;">Rate</th>
              <th style="width: 95px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.values(hsnGroups)
      .map(
        (g) => `
              <tr>
                <td>${g.hsn}</td>
                <td class="text-right">${formatInr(g.taxable)}</td>
                <td>${halfRate}%</td>
                <td class="text-right">${formatInr(g.cgst)}</td>
                <td>${halfRate}%</td>
                <td class="text-right">${formatInr(g.sgst)}</td>
                <td class="text-right">${formatInr(g.totalTax)}</td>
              </tr>
            `
      )
      .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td class="text-right">${formatInr(taxableAmount)}</td>
              <td></td>
              <td class="text-right">${formatInr(halfTaxAmount)}</td>
              <td></td>
              <td class="text-right">${formatInr(halfTaxAmount)}</td>
              <td class="text-right">${formatInr(totalTaxAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Bank Details & Round Off / Invoice Value Table -->
      <table class="bank-roundoff-table">
        <thead>
          <tr>
            <th style="width: 20%;">Bank Name</th>
            <th style="width: 16%;">Branch</th>
            <th style="width: 20%;">A/C No</th>
            <th style="width: 16%;">IFSC Code</th>
            <th style="width: 14%;">Round Off</th>
            <th class="th-roundoff-val" style="width: 14%;">${roundOffFormatted}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="data-row">
            <td>${bankName || "&nbsp;"}</td>
            <td>${bankBranch || "&nbsp;"}</td>
            <td>${bankAccountNo || "&nbsp;"}</td>
            <td>${bankIfsc || "&nbsp;"}</td>
            <td class="td-invoice-val-label">Invoice Value</td>
            <td class="td-invoice-val-num">${invoiceValueFormatted}</td>
          </tr>
        </tbody>
      </table>

      <!-- Terms and Conditions -->
      <div class="terms-section">
        <div class="terms-title">Terms & Conditions:</div>
        <div class="terms-content">
          ${termsLines.map((line) => `<div>${line}</div>`).join("")}
        </div>
      </div>
    </div>

    <!-- Signatures and Footer (always pinned to the last of the page) -->
    <div class="bottom-section">
      <div class="signatures-row">
        <div class="receiver-sign-col">
          
        </div>

        <div class="company-sign-col">
          <div class="company-sign-header">${authorisedSigHeader}</div>
          ${signatureImgUrl
      ? `<div class="company-signature-img-wrap"><img src="${signatureImgUrl}" alt="Signature" class="company-signature-img" /></div>`
      : `<div class="signature-space"></div>`
    }
          <div class="sign-rule"></div>
          <div class="sign-caption">${authorisedSigDesignation}</div>
        </div>
      </div>

      <div class="page-footer">
        <span>Labour Bill - ${companyName}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/** Print Jobwork Tax Invoice (Full with Logo & Header) */
export function printJobworkInvoice(sale: JobworkSalePrintData, settings?: CompanySettingsData | null) {
  const html = generateJobworkInvoiceHtml(sale, false, settings);
  printHtmlViaIframe(html);
}

/**
 * Print on pre-printed Pad / Letterhead:
 * Hides the top logo and company address to print onto company's physical letter pad.
 */
export function printJobworkPadInvoice(sale: JobworkSalePrintData, settings?: CompanySettingsData | null) {
  const html = generateJobworkInvoiceHtml(sale, true, settings);
  printHtmlViaIframe(html);
}

/** Print Jobwork Delivery Challan (DC) */
export function printJobworkChallan(sale: JobworkSalePrintData, companySettings?: CompanySettingsData | null) {
  const settings = companySettings || DEFAULT_COMPANY_SETTINGS;
  const companyName = settings.companyName?.trim() || "Petvin Febtech";
  const companyAddress = settings.address?.trim() || "239, Vivekanand industrial park, Kubadthal, Ahmedabad, Gujarat";
  const companyPincode = settings.pincode?.trim() || "382433";
  const companyFullAddress = companyPincode && !companyAddress.includes(companyPincode)
    ? `${companyAddress} ${companyPincode}`
    : companyAddress;
  const companyGst = settings.gstNo?.trim().toUpperCase() || "24EKIPR1824M1ZS";
  const companyPan = settings.panNo?.trim().toUpperCase() || (companyGst.length >= 12 ? companyGst.slice(2, 12) : "");
  const companyPhone = settings.phone?.trim() || "+91 7600652814 / +91 9624889080";
  const authorisedSigHeader = settings.authorisedSignature?.trim() || `For ${companyName}`;
  const authorisedSigDesignation = settings.signatureDesignation?.trim() || "Authorised Signature";

  const rawSigUrl = settings.signatureImageUrl?.trim() || "";
  const signatureImgUrl = rawSigUrl
    ? (rawSigUrl.startsWith("http") && rawSigUrl.includes("blob.vercel-storage.com")
      ? `/api/image?url=${encodeURIComponent(rawSigUrl)}`
      : rawSigUrl)
    : "";

  const items = parseItems(sale.itemsJson);
  const challanDateStr = formatDmy(sale.invoiceDate);
  const dcNumber = sale.challanNumber || `DC-${sale.invoiceNumber.replace(/^PF\//, "").replace(/\//g, "-")}`;

  const billName = sale.customerName || "—";
  const shipName = sale.shipToName?.trim() || billName;
  const shipAddress = sale.shipToAddress?.trim() || sale.customerAddress || "—";
  const shipPhone = sale.shipToPhone?.trim() || sale.customerPhone || "—";
  const shipGst = sale.shipToGst?.trim() || sale.customerGst || "—";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Delivery Challan - ${dcNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 4mm 6mm 4mm 6mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; background: #fff; font-size: 11.5px; }
    .dc-wrapper { width: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; min-height: auto; justify-content: space-between; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; }
    .brand-logo { height: 42px; width: auto; }
    .dc-title { font-size: 19px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin-bottom: 2px; text-align: right; }
    .badge { display: inline-block; background: #FF6A1A; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; text-transform: uppercase; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; display: flex; justify-content: space-between; font-size: 11px; }
    .party-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; margin-bottom: 10px; font-size: 11.5px; }
    .party-title { font-size: 12px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .items-table th { background: #eef4fa; border: 1px solid #dbeafe; padding: 6px 8px; text-align: left; font-size: 11.5px; }
    .items-table td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11.5px; }
    .signs { display: flex; justify-content: space-between; margin-top: 25px; margin-bottom: 8px; }
    .sign-col { text-align: center; width: 170px; }
    .sign-line { border-top: 1px solid #475569; margin-bottom: 4px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
  </style>
</head>
<body>
  <div class="dc-wrapper">
    <div>
      <div class="header">
        <div>
          <img src="/images/petvin_febtech_updated.svg" alt="${companyName}" class="brand-logo" />
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            ${companyFullAddress}<br/>
            GSTIN: <strong>${companyGst}</strong>${companyPan ? ` | PAN: <strong>${companyPan}</strong>` : ""} | Phone: ${companyPhone}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="dc-title">DELIVERY CHALLAN</div>
          <div class="badge">Job Work Outward</div>
        </div>
      </div>

      <div class="meta-box">
        <div><strong>Challan No:</strong> ${dcNumber}</div>
        <div><strong>Challan Date:</strong> ${challanDateStr}</div>
        <div><strong>Ref Invoice:</strong> ${sale.invoiceNumber}</div>
        <div><strong>Place of Supply:</strong> ${sale.placeOfSupply || "—"}</div>
      </div>

      <div class="party-card">
        <div class="party-title">Consignee / Deliver To</div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${shipName}</div>
        <div>${shipAddress}</div>
        <div>Phone: ${shipPhone} | GSTIN: <strong>${shipGst}</strong></div>
      </div>

      <div style="background: #fff8f5; border: 1px dashed #fed7aa; padding: 8px 12px; font-size: 11px; color: #9a3412; margin-bottom: 14px;">
        <strong>Goods Description:</strong> Material processed under Job Work (Laser Cutting / CNC Bending) under SAC 9988. Dispatched for delivery. Not for commercial sale.
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 36px; text-align: center;">#</th>
            <th>Item / Product Description</th>
            <th style="width: 130px;">Process Done</th>
            <th style="width: 80px; text-align: center;">SAC</th>
            <th style="width: 100px; text-align: right;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${items
      .map(
        (item, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td>
                <strong>${item.partName}</strong>
              </td>
              <td>${item.processType || "Job Work"}</td>
              <td style="text-align: center;">${item.hsnSac || "—"}</td>
              <td style="text-align: right; font-weight: 700;">${item.quantity} ${item.unit || "Nos"}</td>
            </tr>
          `
      )
      .join("")}
        </tbody>
      </table>

      ${sale.notes
      ? `<div style="font-size: 11.5px; color: #475569; margin-top: 10px;">
        <strong>Notes:</strong> ${sale.notes}
      </div>`
      : ""
    }
    </div>

    <div>
      <div class="signs">
        <div class="sign-col">
         
        </div>
        <div class="sign-col">
          <div style="font-weight: 700; margin-bottom: 4px;">${authorisedSigHeader}</div>
          ${signatureImgUrl
      ? `<div style="height: 38px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;"><img src="${signatureImgUrl}" alt="Signature" style="max-height: 36px; max-width: 140px; object-fit: contain;" /></div>`
      : `<div style="height: 38px;"></div>`
    }
          <div class="sign-line"></div>
          <div>${authorisedSigDesignation}</div>
        </div>
      </div>
      <div class="footer">
        <span>Delivery Challan - Petvin Febtech</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  printHtmlViaIframe(html);
}
