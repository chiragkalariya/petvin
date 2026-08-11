"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge, Card, SpecRow } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProspectCompanyForm } from "@/components/admin/ProspectCompanyForm";
import { MATERIAL_TYPES } from "@/lib/costing";
import { formatCurrency, formatDate } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS_OPTIONS = Array.from({ length: 49 }, (_, i) => i);   // 0 – 48
const MINUTES_OPTIONS = Array.from({ length: 60 }, (_, i) => i); // 0 – 59

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbMaterial {
  id: string;
  name: string;
  ratePerKg: number | null;
  cuttingCostHourly: number | null;
  bendingCostHourly: number | null;
}

interface DbMachine {
  id: string;
  name: string;
  type: "CUTTING" | "BENDING";
}

interface CostingItem {
  id: string;
  partName: string;
  materialType: string;
  thicknessMm: number;
  materialRatePerKg: number;
  weightKg: number;
  cuttingMachine: string;
  cuttingLengthM: number;
  cuttingRatePerM: number;
  cuttingTimeMin: number;
  bendingMachine: string;
  bendCount: number;
  bendRatePerBend: number;
  bendingTimeMin: number;
}

interface ComputedItem extends CostingItem {
  materialCost: number;
  cuttingCost: number;
  bendingCost: number;
  total: number;
  cuttingTimeMin: number;
  bendingTimeMin: number;
}

interface SavedRecord {
  id: string;
  title?: string | null;
  companyName?: string | null;
  deliveryTime?: string | null;
  itemsJson?: string | null;
  materialType: string;
  thicknessMm: number;
  weightKg: number;
  materialRatePerKg: number;
  cuttingLengthM: number;
  cuttingRatePerM: number;
  bendCount: number;
  bendRatePerBend: number;
  wastagePercent: number;
  marginPercent: number;
  gstPercent: number;
  materialCost: number;
  cuttingCost: number;
  bendingCost: number;
  wastageCost: number;
  subtotal: number;
  marginAmount: number;
  taxAmount: number;
  totalCost: number;
  createdAt: string;
  inquiry?: { id: string; name: string; company?: string } | null;
}

type View = "list" | "form";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeItem(item: CostingItem): ComputedItem {
  const materialCost = item.weightKg * item.materialRatePerKg;
  const cuttingCost = (item.cuttingTimeMin / 60) * item.cuttingRatePerM;
  const bendingCost = (item.bendingTimeMin / 60) * item.bendRatePerBend;
  return {
    ...item,
    materialCost: round2(materialCost),
    cuttingCost: round2(cuttingCost),
    bendingCost: round2(bendingCost),
    total: round2(materialCost + cuttingCost + bendingCost),
    cuttingTimeMin: item.cuttingTimeMin,
    bendingTimeMin: item.bendingTimeMin,
  };
}

function round2(v: number) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse "HH:MM" into total minutes. */
function hhmmToMinutes(hhmm: string): number {
  const parts = hhmm.split(":");
  const h = parseInt(parts[0] ?? "0", 10) || 0;
  const m = parseInt(parts[1] ?? "0", 10) || 0;
  return h * 60 + m;
}

function parseThickness(t: string): number {
  return parseFloat(t) || 0;
}

function uid(): string {
  return Math.random().toString(36).slice(2);
}

function defaultItem(): CostingItem {
  return {
    id: uid(),
    partName: "",
    materialType: "",
    thicknessMm: 0,
    materialRatePerKg: 0,
    weightKg: 0,
    cuttingMachine: "",
    cuttingLengthM: 0,
    cuttingRatePerM: 0,
    cuttingTimeMin: 0,
    bendingMachine: "",
    bendCount: 0,
    bendRatePerBend: 0,
    bendingTimeMin: 0,
  };
}

// ─── PDF printer ──────────────────────────────────────────────────────────────

function printCostingRecord(record: Partial<SavedRecord>, itemsList?: ComputedItem[]) {
  const titleText = record.companyName ? `Quote for ${record.companyName}` : record.title || "Fabrication Quote";
  const quoteId = record.id ? record.id.slice(-8).toUpperCase() : "DRAFT";
  const dateStr = record.createdAt ? formatDate(record.createdAt) : formatDate(new Date().toISOString());

  // Determine items to render
  let itemList: ComputedItem[] = [];
  if (itemsList && itemsList.length > 0) {
    itemList = itemsList;
  } else if (record.itemsJson) {
    try {
      const parsed = JSON.parse(record.itemsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        itemList = parsed.map((it) => computeItem(it));
      }
    } catch (e) {}
  }

  if (itemList.length === 0) {
    itemList = [
      {
        id: record.id ?? "1",
        partName: record.title || titleText,
        materialType: record.materialType ?? "",
        thicknessMm: record.thicknessMm ?? 0,
        materialRatePerKg: record.materialRatePerKg ?? 0,
        weightKg: record.weightKg ?? 0,
        cuttingMachine: "",
        cuttingLengthM: record.cuttingLengthM ?? 0,
        cuttingRatePerM: record.cuttingRatePerM ?? 0,
        cuttingTimeMin: Math.round((record.cuttingLengthM ?? 0) * 60),
        bendingMachine: "",
        bendCount: record.bendCount ?? 0,
        bendRatePerBend: record.bendRatePerBend ?? 0,
        bendingTimeMin: Math.round((record.bendCount ?? 0) * 60),
        materialCost: record.materialCost ?? 0,
        cuttingCost: record.cuttingCost ?? 0,
        bendingCost: record.bendingCost ?? 0,
        total: (record.materialCost ?? 0) + (record.cuttingCost ?? 0) + (record.bendingCost ?? 0),
      },
    ];
  }

  const totalItemsCount = itemList.length;
  const totalWeightKg = round2(itemList.reduce((s, i) => s + (i.weightKg || 0), 0));
  const totalMaterialCost = round2(itemList.reduce((s, i) => s + (i.materialCost || 0), 0));
  const totalCuttingCost = round2(itemList.reduce((s, i) => s + (i.cuttingCost || 0), 0));
  const totalBendingCost = round2(itemList.reduce((s, i) => s + (i.bendingCost || 0), 0));
  const subtotal = round2(itemList.reduce((s, i) => s + (i.total || (i.materialCost + i.cuttingCost + i.bendingCost)), 0));
  const gstPercent = record.gstPercent ?? 18;
  const taxAmount = round2((subtotal * gstPercent) / 100);
  const grandTotal = round2(subtotal + taxAmount);

  // Badge text
  const badgeText = totalItemsCount > 1
    ? `${totalItemsCount} ITEMS`
    : `${itemList[0]?.materialType ?? "QUOTE"}${itemList[0]?.thicknessMm ? ` · ${itemList[0].thicknessMm}MM` : ""}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${titleText} - ${quoteId}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background: #fff; color: #1f2937; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    
    .page-container { position: relative; border: 1px solid #e5e7eb; padding: 32px 36px; min-height: 960px; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }
    
    /* Corner Tick Marks */
    .corner { position: absolute; width: 14px; height: 14px; border-color: #FF6A1A; border-style: solid; }
    .corner-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
    .corner-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
    .corner-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
    .corner-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #FF6A1A; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 38px; height: 38px; border: 1.5px solid #111; display: flex; align-items: center; justify-content: center; border-radius: 2px; }
    .brand-logo svg { width: 22px; height: 22px; stroke: #111; }
    .brand-text { display: flex; flex-direction: column; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; line-height: 1; text-transform: uppercase; }
    .brand-title .dark { color: #111; }
    .brand-title .orange { color: #FF6A1A; }
    .brand-sub { font-size: 9px; font-family: monospace; letter-spacing: 1.5px; color: #6b7280; font-weight: 600; margin-top: 5px; text-transform: uppercase; }

    .meta { text-align: right; font-size: 11px; font-family: monospace; color: #6b7280; line-height: 1.6; text-transform: uppercase; }
    .meta strong { color: #111; font-weight: 700; }

    /* Title Row */
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .title-row h1 { font-size: 22px; font-weight: 800; color: #111; }
    .pill-badge { border: 1px solid #ffd8cc; background: #fff5f0; color: #FF6A1A; font-family: monospace; font-size: 11px; padding: 5px 14px; border-radius: 2px; font-weight: 700; text-transform: uppercase; }

    /* Table */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table thead th { background: #1B1E22; color: #ffffff; font-family: monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left; }
    .items-table thead th.text-right { text-align: right; }
    .items-table tbody td { background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 12px; font-size: 12px; color: #111; }
    .items-table tbody td.text-right { text-align: right; }
    .sub-info { font-size: 10px; font-family: monospace; color: #6b7280; margin-top: 3px; }
    .items-table tfoot td { background: #fff; border-top: 1px solid #111; padding: 12px; font-weight: 700; font-size: 12px; font-family: monospace; }
    .items-table tfoot td.text-right { text-align: right; }

    /* Summary Table */
    .summary-wrap { display: flex; justify-content: flex-end; margin-top: 20px; }
    .summary-box { width: 330px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #4b5563; font-family: monospace; }
    .summary-row.subtotal { border-top: 1px solid #e5e7eb; padding-top: 8px; font-weight: 600; color: #111; }
    .summary-row.gst { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .summary-row .val { text-align: right; color: #111; font-weight: 600; }

    /* Grand Total Hero Box */
    .hero-gt { border: 1.5px solid #111; position: relative; padding: 14px 18px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; background: #fff; }
    .hero-gt .gt-left { font-family: monospace; }
    .hero-gt .gt-left .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #111; display: block; }
    .hero-gt .gt-left .sub { font-size: 9px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px; }
    .hero-gt .gt-amount { font-family: monospace; font-size: 24px; font-weight: 800; color: #FF6A1A; }
    .hero-gt .corner-accent { position: absolute; right: -3px; bottom: -3px; width: 6px; height: 6px; border-right: 2px solid #FF6A1A; border-bottom: 2px solid #FF6A1A; }

    /* Footer */
    .footer { margin-top: auto; padding-top: 16px; border-top: 1px dashed #d1d5db; display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-family: monospace; color: #9ca3af; }
    .footer-left { display: flex; align-items: center; gap: 6px; }

    @media print {
      body { padding: 0; }
      .page-container { border: none; padding: 16px; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div>
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>

      <!-- Header -->
      <div class="header">
        <div class="brand">
          <img src="/images/petvin_febtech_updated.svg" alt="Petvin Febtech Logo" style="height: 46px; width: auto; display: block;" />
        </div>
        <div class="meta">
          <div>QUOTE DATE <strong>${dateStr}</strong></div>
          <div>CLIENT / COMPANY <strong>${record.companyName || "XYZ"}</strong></div>
          <div>DELIVERY TIME <strong>${record.deliveryTime || "—"}</strong></div>
          <div>QUOTE ID <strong>${quoteId}</strong></div>
        </div>
      </div>

      <!-- Title & Badge -->
      <div class="title-row">
        <h1>${titleText}</h1>
        <div class="pill-badge">${badgeText}</div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 32px; text-align: center;">#</th>
            <th>ITEM / PART</th>
            <th class="text-right">MATERIAL</th>
            <th class="text-right">CUTTING</th>
            <th class="text-right">BENDING</th>
            <th class="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemList
            .map((it, idx) => {
              const cutH = Math.floor(it.cuttingTimeMin / 60);
              const cutM = Math.round(it.cuttingTimeMin % 60);
              const cutTime = it.cuttingTimeMin > 0 ? `${cutH}h ${String(cutM).padStart(2, "0")}m` : "—";
              const cutMach = it.cuttingMachine ? `${it.cuttingMachine} · ` : "";

              const bendH = Math.floor(it.bendingTimeMin / 60);
              const bendM = Math.round(it.bendingTimeMin % 60);
              const bendTime = it.bendingTimeMin > 0 ? `${bendH}h ${String(bendM).padStart(2, "0")}m` : "—";
              const bendMach = it.bendingMachine ? `${it.bendingMachine} · ` : "";

              const itemTotal = it.total || (it.materialCost + it.cuttingCost + it.bendingCost);

              return `
            <tr>
              <td style="text-align: center; font-family: monospace; font-weight: 700; color: #6b7280;">${idx + 1}</td>
              <td>
                <strong>${it.partName || titleText}</strong>
                <div class="sub-info">${it.materialType ? `${it.materialType} · ` : ""}${it.thicknessMm ? `${it.thicknessMm}MM thk` : ""}</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(it.materialCost)}</strong>
                <div class="sub-info">${it.weightKg} KG @ ₹${it.materialRatePerKg}/KG</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(it.cuttingCost)}</strong>
                <div class="sub-info">${cutTime}${it.cuttingRatePerM > 0 ? ` @ ₹${it.cuttingRatePerM}/hr` : ""}</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(it.bendingCost)}</strong>
                <div class="sub-info">${bendTime}${it.bendRatePerBend > 0 ? ` @ ₹${it.bendRatePerBend}/hr` : ""}</div>
              </td>
              <td class="text-right font-mono">
                <strong>${formatCurrency(itemTotal)}</strong>
              </td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total — ${totalItemsCount} ${totalItemsCount === 1 ? "item" : "items"}${totalWeightKg > 0 ? ` · ${totalWeightKg} KG` : ""}</td>
            <td class="text-right">${formatCurrency(totalMaterialCost)}</td>
            <td class="text-right">${formatCurrency(totalCuttingCost)}</td>
            <td class="text-right">${formatCurrency(totalBendingCost)}</td>
            <td class="text-right" style="color: #FF6A1A; font-weight: 800;">${formatCurrency(subtotal)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Financial Summary -->
      <div class="summary-wrap">
        <div class="summary-box">
          <div class="summary-row">
            <span>Material Cost</span>
            <span class="val">${formatCurrency(totalMaterialCost)}</span>
          </div>
          <div class="summary-row">
            <span>Cutting Cost</span>
            <span class="val">${formatCurrency(totalCuttingCost)}</span>
          </div>
          <div class="summary-row">
            <span>Bending Cost</span>
            <span class="val">${formatCurrency(totalBendingCost)}</span>
          </div>
          <div class="summary-row subtotal">
            <span>Items Subtotal</span>
            <span class="val">${formatCurrency(subtotal)}</span>
          </div>
          <div class="summary-row gst">
            <span>GST (${gstPercent}%)</span>
            <span class="val">${formatCurrency(taxAmount)}</span>
          </div>

          <!-- Grand Total Hero Box -->
          <div class="hero-gt">
            <div class="corner-accent"></div>
            <div class="gt-left">
              <span class="label">GRAND TOTAL</span>
              <span class="sub">INCLUDES GST</span>
            </div>
            <div class="gt-amount">${formatCurrency(grandTotal)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <img src="/images/petvin_febtech_updated.svg" alt="Petvin Logo" style="height: 14px; width: auto; display: inline-block; vertical-align: middle;" />
        <span>Computer generated quotation - Valid 30 days · Petvin Febtech</span>
      </div>
      <div>Page 1 of 1</div>
    </div>
  </div>
</body>
</html>`;

  // Print directly in the current browser window using a hidden iframe
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
    toast.error("Could not generate print document.");
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
  }, 300);
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ record, onClose, onEdit }: { record: SavedRecord; onClose: () => void; onEdit: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const displayTitle = record.companyName ? `${record.companyName}${record.title ? ` – ${record.title}` : ""}` : record.title || "Fabrication Quote";

  return (
    <div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg border border-line bg-bg-alt shadow-2xl">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <p className="font-display text-lg font-semibold uppercase tracking-wide text-ink">{displayTitle}</p>
            <p className="mt-0.5 text-xs text-ink-dimmer">{record.materialType} · {record.thicknessMm} mm · {formatDate(record.createdAt)}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-ink-dimmer hover:text-ink">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line-soft px-5 py-3">
          {[
            ["Weight", `${record.weightKg} kg`],
            ["Rate/kg", formatCurrency(record.materialRatePerKg)],
            ["Delivery", record.deliveryTime || "—"],
            ["GST", `${record.gstPercent}%`]
          ].map(([k, v]) => (
            <div key={k}><p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">{k}</p>
              <p className="text-sm font-medium text-ink">{v}</p></div>
          ))}
        </div>
        <div className="px-5 py-4">
          <SpecRow k="Material Cost" v={formatCurrency(record.materialCost)} />
          <SpecRow k="Cutting Cost" v={formatCurrency(record.cuttingCost)} />
          <SpecRow k="Bending Cost" v={formatCurrency(record.bendingCost)} />
          <SpecRow k="Subtotal" v={formatCurrency(record.subtotal)} />
          <SpecRow k="GST" v={formatCurrency(record.taxAmount)} />
          <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
            <span className="font-display uppercase tracking-wide text-ink">Total</span>
            <span className="font-mono text-xl text-accent">{formatCurrency(record.totalCost)}</span>
          </div>
        </div>
        <div className="flex gap-3 border-t border-line px-5 py-4">
          <Button variant="outline" size="sm" onClick={() => printCostingRecord(record)} className="flex-1 gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </Button>
          <Button size="sm" onClick={onEdit} className="flex-1">Edit Costing</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function CostingEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center border border-line bg-bg-light">
        <svg className="h-7 w-7 text-ink-dimmer" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="font-display text-lg uppercase tracking-wide text-ink-dim">No saved quotes yet</p>
      <p className="mt-2 max-w-xs text-sm text-ink-dimmer">Create your first costing quote to calculate material, cutting and bending costs.</p>
      <button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 border border-accent bg-accent/10 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/20">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Costing
      </button>
    </div>
  );
}

// ─── Saved List ───────────────────────────────────────────────────────────────

function SavedCostingList({ records, loading, onView, onEdit, onDelete, onAdd, onRefresh }: {
  records: SavedRecord[]; loading: boolean;
  onView: (r: SavedRecord) => void; onEdit: (r: SavedRecord) => void;
  onDelete: (id: string) => void; onAdd: () => void; onRefresh: () => void;
}) {
  if (loading) return (
    <div className="flex items-center justify-center py-16 text-ink-dimmer">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <span className="ml-3 text-sm">Loading saved quotes…</span>
    </div>
  );

  if (records.length === 0) return <CostingEmptyState onAdd={onAdd} />;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
          {records.length} {records.length === 1 ? "quote" : "quotes"}
        </p>
        <button onClick={onRefresh} className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer transition-colors hover:text-accent">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="divide-y divide-line-soft">
        {records.map((r) => {
          const titleLine = r.companyName ? `${r.companyName}${r.title ? ` – ${r.title}` : ""}` : r.title || "Fabrication Quote";
          return (
            <div key={r.id} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-light/40">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{titleLine}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{r.materialType}</Badge>
                  {r.thicknessMm > 0 && <span className="font-mono text-[11px] text-ink-dimmer">{r.thicknessMm} mm</span>}
                  {r.deliveryTime && <span className="font-mono text-[11px] text-accent">Delivery: {r.deliveryTime}</span>}
                  <span className="text-[11px] text-ink-dimmer">{formatDate(r.createdAt)}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-base font-semibold text-accent">{formatCurrency(r.totalCost)}</p>
                <p className="font-mono text-[10px] text-ink-dimmer">incl. GST</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => onView(r)}
                  className="text-ink-dim hover:text-accent transition-colors"
                  title="View Quote"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => onEdit(r)}
                  className="text-ink-dim hover:text-accent transition-colors"
                  title="Edit Quote"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
                <button
                  onClick={() => printCostingRecord(r)}
                  className="text-ink-dim hover:text-accent transition-colors"
                  title="Download PDF"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-ink-dim hover:text-red-400 transition-colors"
                  title="Delete Quote"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Field components (inline, theme-consistent) ──────────────────────────────

function FLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">{children}</p>;
}

function FInput({ value, onChange, type = "text", placeholder, step, min, className = "" }: {
  value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; step?: number; min?: number; className?: string;
}) {
  // For number inputs, show blank instead of 0 so fields start empty
  const displayValue = type === "number" && (value === 0 || value === "") ? "" : value;
  return (
    <input
      type={type}
      value={displayValue}
      step={step}
      min={min}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-line bg-bg text-ink px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-ink-dimmer ${className}`}
    />
  );
}

function FSelect({ value, onChange, options, className = "" }: {
  value: string; onChange: (v: string) => void;
  options: (string | { value: string; label: string })[]; className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-line bg-bg text-ink px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors ${className}`}>
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  );
}

function CostBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-3">
      <FLabel>{label}</FLabel>
      <div className="border border-accent/30 bg-accent/5 px-3 py-2">
        <span className="font-mono text-sm font-semibold text-accent">{formatCurrency(value)}</span>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
        {num}
      </span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-dim">{title}</span>
    </div>
  );
}

// ─── Add Item Form ────────────────────────────────────────────────────────────

let _pendingCuttingTimeMin = 0;
let _pendingBendingTimeMin = 0;

function AddItemForm({
  draft,
  dbMaterials,
  dbMachines,
  onChange,
  onAdd,
}: {
  draft: CostingItem;
  dbMaterials: DbMaterial[];
  dbMachines: DbMachine[];
  onChange: (key: keyof CostingItem, value: string | number) => void;
  onAdd: () => void;
}) {
  const computed = useMemo(() => computeItem(draft), [draft]);

  const materialTypeOptions = useMemo(() => {
    const list = dbMaterials.map((m) => m.name);
    return [
      { value: "", label: list.length > 0 ? "-- Select Material --" : "-- No materials added --" },
      ...list.map((name) => ({ value: name, label: name })),
    ];
  }, [dbMaterials]);

  const cuttingMachineOptions = useMemo(() => {
    const list = dbMachines.filter((m) => m.type === "CUTTING").map((m) => m.name);
    return [
      { value: "", label: list.length > 0 ? "-- Select Machine --" : "-- No machines added --" },
      ...list.map((name) => ({ value: name, label: name })),
    ];
  }, [dbMachines]);

  const bendingMachineOptions = useMemo(() => {
    const list = dbMachines.filter((m) => m.type === "BENDING").map((m) => m.name);
    return [
      { value: "", label: list.length > 0 ? "-- Select Machine --" : "-- No machines added --" },
      ...list.map((name) => ({ value: name, label: name })),
    ];
  }, [dbMachines]);

  // Pre-select first available machine from Machine Master if present
  useEffect(() => {
    if (!dbMachines.length) return;

    if (!draft.cuttingMachine) {
      const firstCutting = dbMachines.find((m) => m.type === "CUTTING");
      if (firstCutting) {
        onChange("cuttingMachine", firstCutting.name);
      }
    }

    if (!draft.bendingMachine) {
      const firstBending = dbMachines.find((m) => m.type === "BENDING");
      if (firstBending) {
        onChange("bendingMachine", firstBending.name);
      }
    }
  }, [dbMachines, draft.cuttingMachine, draft.bendingMachine, onChange]);

  // Auto-populate material rate, cutting cost, and bending cost from material master
  useEffect(() => {
    if (!draft.materialType || !dbMaterials.length) return;
    const match = dbMaterials.find((m) => m.name === draft.materialType);
    if (match) {
      if (typeof match.ratePerKg === "number" && match.ratePerKg > 0) {
        onChange("materialRatePerKg", match.ratePerKg);
      }
      if (typeof match.cuttingCostHourly === "number" && match.cuttingCostHourly > 0) {
        onChange("cuttingRatePerM", match.cuttingCostHourly);
      }
      if (typeof match.bendingCostHourly === "number" && match.bendingCostHourly > 0) {
        onChange("bendRatePerBend", match.bendingCostHourly);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.materialType, dbMaterials]);

  // Editable Est. Time strings (HH:MM).
  const [cuttingTimeStr, setCuttingTimeStr] = useState("");
  const [bendingTimeStr, setBendingTimeStr] = useState("");

  useEffect(() => {
    setCuttingTimeStr(draft.cuttingTimeMin > 0 ? formatTime(draft.cuttingTimeMin) : "");
    setBendingTimeStr(draft.bendingTimeMin > 0 ? formatTime(draft.bendingTimeMin) : "");
  }, [draft.cuttingTimeMin, draft.bendingTimeMin, draft.id]);

  function handleCuttingTimeChange(val: string) {
    setCuttingTimeStr(val);
    const mins = hhmmToMinutes(val);
    onChange("cuttingTimeMin", mins);
  }

  function handleBendingTimeChange(val: string) {
    setBendingTimeStr(val);
    const mins = hhmmToMinutes(val);
    onChange("bendingTimeMin", mins);
  }

  function handleAdd() {
    onAdd();
    setCuttingTimeStr("");
    setBendingTimeStr("");
  }

  return (
    <div className="border border-line bg-bg-alt">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <div className="flex h-5 w-5 items-center justify-center bg-accent">
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-accent">Add Item</span>
      </div>

      {/* 4-column form */}
      <div className="grid grid-cols-1 gap-0 divide-y divide-line lg:grid-cols-[1fr_auto_1.4fr_auto_1.4fr_auto_1.4fr_auto_0.7fr] lg:divide-x lg:divide-y-0 p-0">

        {/* ① Item Name */}
        <div className="p-4">
          <SectionHeader num={1} title="Item Name" />
          <FLabel>Item / Part Name</FLabel>
          <FInput value={draft.partName} onChange={(v) => onChange("partName", v)} placeholder="Enter item name" />
        </div>

        {/* arrow */}
        <div className="hidden lg:flex items-center justify-center px-1 text-line">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>

        {/* ② Material Cost */}
        <div className="p-4">
          <SectionHeader num={2} title="Material Cost" />
          <div>
            <FLabel>Material</FLabel>
            <FSelect value={draft.materialType} onChange={(v) => onChange("materialType", v)} options={materialTypeOptions} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FLabel>Rate (₹/KG)</FLabel>
              <FInput type="number" min={0} step={0.5} value={draft.materialRatePerKg}
                onChange={(v) => onChange("materialRatePerKg", Number(v))} />
            </div>
            <div>
              <FLabel>Weight</FLabel>
              <div className="flex items-stretch gap-0">
                <FInput type="number" min={0} step={0.01} value={draft.weightKg}
                  onChange={(v) => onChange("weightKg", Number(v))} className="flex-1" />
                <span className="flex items-center border border-l-0 border-line bg-bg-light px-2 font-mono text-[11px] text-ink-dimmer">KG</span>
              </div>
            </div>
          </div>
          <CostBadge label="Material Cost" value={computed.materialCost} />
        </div>

        {/* arrow */}
        <div className="hidden lg:flex items-center justify-center px-1 text-line">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>

        {/* ③ Cutting Cost */}
        <div className="p-4">
          <SectionHeader num={3} title="Cutting Cost" />
          <div>
            <FLabel>Machine</FLabel>
            <FSelect value={draft.cuttingMachine} onChange={(v) => onChange("cuttingMachine", v)} options={cuttingMachineOptions} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FLabel>Rate (₹/Hr)</FLabel>
              <FInput type="number" min={0} step={0.5} value={draft.cuttingRatePerM}
                onChange={(v) => onChange("cuttingRatePerM", Number(v))} />
            </div>
            <div>
              <FLabel>Est. Time</FLabel>
              <div className="flex items-center gap-1">
                <select
                  value={Math.floor(draft.cuttingTimeMin / 60)}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    const m = draft.cuttingTimeMin % 60;
                    const hh = String(h).padStart(2, "0");
                    const mm = String(m).padStart(2, "0");
                    handleCuttingTimeChange(`${hh}:${mm}`);
                  }}
                  className="w-full border border-line bg-bg text-ink px-2 py-2 text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  {HOURS_OPTIONS.map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                  ))}
                </select>
                <span className="text-ink-dimmer font-mono text-sm font-bold">:</span>
                <select
                  value={draft.cuttingTimeMin % 60}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const h = Math.floor(draft.cuttingTimeMin / 60);
                    const hh = String(h).padStart(2, "0");
                    const mm = String(m).padStart(2, "0");
                    handleCuttingTimeChange(`${hh}:${mm}`);
                  }}
                  className="w-full border border-line bg-bg text-ink px-2 py-2 text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  {MINUTES_OPTIONS.map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <CostBadge label="Cutting Cost" value={computed.cuttingCost} />
        </div>

        {/* arrow */}
        <div className="hidden lg:flex items-center justify-center px-1 text-line">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>

        {/* ④ Bending Cost */}
        <div className="p-4">
          <SectionHeader num={4} title="Bending Cost" />
          <div>
            <FLabel>Machine</FLabel>
            <FSelect value={draft.bendingMachine} onChange={(v) => onChange("bendingMachine", v)} options={bendingMachineOptions} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FLabel>Rate (₹/Hr)</FLabel>
              <FInput type="number" min={0} step={0.5} value={draft.bendRatePerBend}
                onChange={(v) => onChange("bendRatePerBend", Number(v))} />
            </div>
            <div>
              <FLabel>Est. Time</FLabel>
              <div className="flex items-center gap-1">
                <select
                  value={Math.floor(draft.bendingTimeMin / 60)}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    const m = draft.bendingTimeMin % 60;
                    const hh = String(h).padStart(2, "0");
                    const mm = String(m).padStart(2, "0");
                    handleBendingTimeChange(`${hh}:${mm}`);
                  }}
                  className="w-full border border-line bg-bg text-ink px-2 py-2 text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  {HOURS_OPTIONS.map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                  ))}
                </select>
                <span className="text-ink-dimmer font-mono text-sm font-bold">:</span>
                <select
                  value={draft.bendingTimeMin % 60}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const h = Math.floor(draft.bendingTimeMin / 60);
                    const hh = String(h).padStart(2, "0");
                    const mm = String(m).padStart(2, "0");
                    handleBendingTimeChange(`${hh}:${mm}`);
                  }}
                  className="w-full border border-line bg-bg text-ink px-2 py-2 text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  {MINUTES_OPTIONS.map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <CostBadge label="Bending Cost" value={computed.bendingCost} />
        </div>

        {/* arrow */}
        <div className="hidden lg:flex items-center justify-center px-1 text-line">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>

        {/* Add button */}
        <div className="flex items-center justify-center p-4">
          <button
            onClick={handleAdd}
            className="flex flex-col items-center gap-2 border-2 border-dashed border-accent/40 px-6 py-8 transition-colors hover:border-accent hover:bg-accent/5 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent/50 text-accent group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Items Table ──────────────────────────────────────────────────────────────

function ItemsTable({
  items,
  onEdit,
  onDelete,
}: {
  items: ComputedItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const totals = useMemo(() => ({
    weightKg: items.reduce((s, i) => s + i.weightKg, 0),
    materialCost: items.reduce((s, i) => s + i.materialCost, 0),
    cuttingLengthM: items.reduce((s, i) => s + i.cuttingLengthM, 0),
    cuttingCost: items.reduce((s, i) => s + i.cuttingCost, 0),
    bendCount: items.reduce((s, i) => s + i.bendCount, 0),
    bendingCost: items.reduce((s, i) => s + i.bendingCost, 0),
    total: items.reduce((s, i) => s + i.total, 0),
  }), [items]);

  if (items.length === 0) return null;

  return (
    <div className="border border-line bg-bg-alt">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M4.875 14.25H3.375m0 0A1.125 1.125 0 012.25 13.125v-1.5a1.125 1.125 0 011.125-1.125M4.875 14.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" />
        </svg>
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
          Items List ({items.length})
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg">
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-dimmer w-8">#</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Item / Part Name</th>
              {/* Material sub-headers */}
              <th colSpan={5} className="border-l border-line px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dimmer bg-accent/5">Material Cost</th>
              {/* Cutting sub-headers */}
              <th colSpan={4} className="border-l border-line px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Cutting Cost</th>
              {/* Bending sub-headers */}
              <th colSpan={4} className="border-l border-line px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dimmer bg-accent/5">Bending Cost</th>
              <th className="border-l border-line px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Total (₹)</th>
              <th className="border-l border-line px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Actions</th>
            </tr>
            <tr className="border-b border-line-soft bg-bg-light/50">
              <th className="px-3 py-1.5"></th>
              <th className="px-3 py-1.5"></th>
              {/* Material */}
              {["Material", "Thk.", "Weight", "Rate (₹/KG)", "Amt (₹)"].map((h) => (
                <th key={h} className={`px-3 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-ink-dimmer ${h === "Material" ? "border-l border-line" : ""}`}>{h}</th>
              ))}
              {/* Cutting */}
              {["Machine", "Rate (₹/Hr)", "Est. Time", "Amt (₹)"].map((h) => (
                <th key={h} className={`px-3 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-ink-dimmer ${h === "Machine" ? "border-l border-line" : ""}`}>{h}</th>
              ))}
              {/* Bending */}
              {["Machine", "Rate (₹/Hr)", "Est. Time", "Amt (₹)"].map((h) => (
                <th key={h} className={`px-3 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-ink-dimmer ${h === "Machine" ? "border-l border-line" : ""}`}>{h}</th>
              ))}
              <th className="border-l border-line px-3 py-1.5"></th>
              <th className="border-l border-line px-3 py-1.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {items.map((item, idx) => (
              <tr key={item.id} className="group hover:bg-bg-light/30 transition-colors">
                <td className="px-3 py-3 font-mono text-[11px] text-ink-dimmer">{idx + 1}</td>
                <td className="px-3 py-3 font-medium text-ink">{item.partName || <span className="text-ink-dimmer italic">—</span>}</td>
                {/* Material */}
                <td className="border-l border-line-soft px-3 py-3 text-ink-dim text-[12px]">{item.materialType}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.thicknessMm} mm</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.weightKg} KG</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.materialRatePerKg.toFixed(2)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-accent">{item.materialCost.toFixed(2)}</td>
                {/* Cutting */}
                <td className="border-l border-line-soft px-3 py-3 text-ink-dim text-[12px]">{item.cuttingMachine || "—"}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.cuttingRatePerM.toFixed(2)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{formatTime(item.cuttingTimeMin)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-accent">{item.cuttingCost.toFixed(2)}</td>
                {/* Bending */}
                <td className="border-l border-line-soft px-3 py-3 text-ink-dim text-[12px]">{item.bendingMachine || "—"}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.bendRatePerBend.toFixed(2)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{formatTime(item.bendingTimeMin)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-accent">{item.bendingCost.toFixed(2)}</td>
                {/* Total */}
                <td className="border-l border-line-soft px-3 py-3 text-right font-mono text-sm font-semibold text-ink">{item.total.toFixed(2)}</td>
                {/* Actions */}
                <td className="border-l border-line-soft px-3 py-3">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item.id)} className="text-ink-dimmer hover:text-accent transition-colors" title="Edit">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button onClick={() => onDelete(item.id)} className="text-ink-dimmer hover:text-red-400 transition-colors" title="Delete">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Totals row */}
          <tfoot>
            <tr className="border-t-2 border-line bg-bg font-semibold">
              <td className="px-3 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer" colSpan={2}>
                Total ({items.length} {items.length === 1 ? "item" : "items"})
              </td>
              <td className="border-l border-line-soft px-3 py-3" colSpan={2}></td>
              <td className="px-3 py-3 font-mono text-[12px] text-ink">{round2(totals.weightKg)} KG</td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3 font-mono text-sm text-accent">{round2(totals.materialCost).toFixed(2)}</td>
              <td className="border-l border-line-soft px-3 py-3" colSpan={3}></td>
              <td className="px-3 py-3 font-mono text-sm text-accent">{round2(totals.cuttingCost).toFixed(2)}</td>
              <td className="border-l border-line-soft px-3 py-3" colSpan={3}></td>
              <td className="px-3 py-3 font-mono text-sm text-accent">{round2(totals.bendingCost).toFixed(2)}</td>
              <td className="border-l border-line-soft px-3 py-3 text-right font-mono text-sm text-accent">{round2(totals.total).toFixed(2)}</td>
              <td className="border-l border-line-soft px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Grand Total bar */}
      <div className="flex items-center justify-between border-t-2 border-accent/40 bg-bg px-5 py-4">
        <span className="font-display text-base uppercase tracking-widest text-ink-dim">Grand Total (₹)</span>
        <span className="font-mono text-2xl font-bold text-accent">{formatCurrency(round2(totals.total))}</span>
      </div>
    </div>
  );
}

// ─── Save Quote Modal ─────────────────────────────────────────────────────────

interface ProspectOption {
  id: string;
  companyName: string;
  location?: string | null;
  industry?: string | null;
}

function SaveQuoteModal({
  isOpen,
  companyName,
  deliveryTime,
  saving,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  companyName: string;
  deliveryTime: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: (data: { companyName: string; deliveryTime: string }) => void;
}) {
  const [compName, setCompName] = useState(companyName);
  const [delDate, setDelDate] = useState(deliveryTime);
  const [prospects, setProspects] = useState<ProspectOption[]>([]);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProspects = useCallback(() => {
    setLoadingProspects(true);
    fetch("/api/prospects")
      .then((res) => res.json())
      .then((data) => setProspects(data.prospects ?? []))
      .catch(() => { })
      .finally(() => setLoadingProspects(false));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCompName(companyName);
      const today = new Date().toISOString().split("T")[0];
      setDelDate(deliveryTime || today);
      fetchProspects();
    }
  }, [companyName, deliveryTime, isOpen, fetchProspects]);

  // Outside click listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredProspects = prospects.filter((p) =>
    p.companyName.toLowerCase().includes(compName.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(compName.toLowerCase())) ||
    (p.industry && p.industry.toLowerCase().includes(compName.toLowerCase()))
  );

  function handleSelectProspect(p: ProspectOption) {
    setCompName(p.companyName);
    setShowDropdown(false);
  }

  function handleCreateCompanySuccess(createdProspect?: any) {
    fetchProspects();
    if (createdProspect?.companyName) {
      setCompName(createdProspect.companyName);
    }
    setShowAddModal(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!compName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!delDate.trim()) {
      toast.error("Delivery date is required");
      return;
    }
    onConfirm({ companyName: compName.trim(), deliveryTime: delDate.trim() });
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md border border-line bg-bg-alt p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/15 text-accent border border-accent/20">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <h3 className="font-display text-base font-semibold uppercase tracking-wide text-ink">
                Save Quote
              </h3>
            </div>
            <button onClick={onClose} className="text-ink-dimmer hover:text-ink transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Searchable Company Name Combobox */}
            <div className="relative" ref={dropdownRef}>
              <FLabel>Company Name *</FLabel>
              <div className="relative">
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => {
                    setCompName(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Select or search prospect company..."
                  className="w-full border border-line bg-bg text-ink px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-dimmer hover:text-ink"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown List */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto border border-line bg-bg shadow-xl">
                  {loadingProspects ? (
                    <div className="px-3 py-2.5 text-xs text-ink-dimmer">Loading companies...</div>
                  ) : filteredProspects.length > 0 ? (
                    <div className="divide-y divide-line-soft">
                      {filteredProspects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProspect(p)}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-bg-light transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-ink">{p.companyName}</span>
                            {p.location && <span className="ml-1.5 text-[10px] text-ink-dimmer">({p.location})</span>}
                          </div>
                          {p.industry && <span className="text-[10px] text-accent font-mono">{p.industry}</span>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-xs text-ink-dimmer">No matching company found</div>
                  )}

                  {/* Create New Company Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowAddModal(true);
                    }}
                    className="w-full border-t border-line px-3 py-2.5 text-left font-mono text-xs uppercase text-accent hover:bg-accent/10 transition-colors flex items-center gap-1.5 font-bold bg-bg-alt"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    + Create "{compName.trim() || "New Company"}"
                  </button>
                </div>
              )}
            </div>

            <div>
              <FLabel>Delivery Date *</FLabel>
              <input
                type="date"
                value={delDate}
                onChange={(e) => setDelDate(e.target.value)}
                className="w-full border border-line bg-bg text-ink px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={saving}>
                Save Quote
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Prospect Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8">
          <div
            className="relative w-full max-w-2xl border border-line bg-bg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 border-b border-line pb-3">
              <h2 className="font-display text-xl uppercase text-ink">Add Prospect Company</h2>
              <button onClick={() => setShowAddModal(false)} className="text-ink-dimmer hover:text-ink">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ProspectCompanyForm
              initialValues={{ companyName: compName }}
              onSuccess={handleCreateCompanySuccess}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Quotation Summary ────────────────────────────────────────────────────────

function QuotationSummary({
  items,
  gstPercent,
  onGstChange,
}: {
  items: ComputedItem[];
  gstPercent: number;
  onGstChange: (v: number) => void;
}) {
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.total, 0), [items]);
  const materialSubtotal = useMemo(() => items.reduce((s, i) => s + i.materialCost, 0), [items]);
  const cuttingSubtotal = useMemo(() => items.reduce((s, i) => s + i.cuttingCost, 0), [items]);
  const bendingSubtotal = useMemo(() => items.reduce((s, i) => s + i.bendingCost, 0), [items]);

  const taxAmount = round2(subtotal * gstPercent / 100);
  const grandTotal = round2(subtotal + taxAmount);

  return (
    <div className="border border-line bg-gradient-to-b from-bg-alt to-bg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-bg-light/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/15 text-accent border border-accent/20">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-2.25-3.75 2.25-3.75-2.25-3.75 2.25V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">Quotation Summary</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{items.length} {items.length === 1 ? "Item" : "Items"}</Badge>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: Cost Breakdown & Tax Config */}
        <div className="border-b border-line p-5 lg:border-b-0 lg:border-r space-y-5">
          {/* Per-category breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-dim">Cost Breakdown</p>
              <span className="font-mono text-[10px] text-ink-dimmer">Material + Cut + Bend</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-line bg-bg/60 p-3">
                <p className="font-mono text-[10px] uppercase text-ink-dimmer">Material</p>
                <p className="font-mono text-sm font-semibold text-ink mt-1">{formatCurrency(materialSubtotal)}</p>
              </div>
              <div className="border border-line bg-bg/60 p-3">
                <p className="font-mono text-[10px] uppercase text-ink-dimmer">Cutting</p>
                <p className="font-mono text-sm font-semibold text-ink mt-1">{formatCurrency(cuttingSubtotal)}</p>
              </div>
              <div className="border border-line bg-bg/60 p-3">
                <p className="font-mono text-[10px] uppercase text-ink-dimmer">Bending</p>
                <p className="font-mono text-sm font-semibold text-ink mt-1">{formatCurrency(bendingSubtotal)}</p>
              </div>
            </div>
          </div>

          {/* Tax Setting */}
          <div className="border-t border-line-soft pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink">GST Tax Percentage</p>
              <p className="text-[11px] text-ink-dimmer">Applied on items subtotal</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={gstPercent}
                onChange={(e) => onGstChange(Number(e.target.value))}
                className="w-20 border border-line bg-bg px-2.5 py-1.5 font-mono text-sm text-right text-ink focus:border-accent focus:outline-none"
              />
              <span className="font-mono text-xs font-semibold text-accent">%</span>
            </div>
          </div>
        </div>

        {/* Right: Final Financial Calculation */}
        <div className="p-5 flex flex-col justify-between bg-bg/30">
          <div>
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-dim">Final Calculation</p>
            <div className="space-y-2 border-b border-line pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-dim">Items Subtotal</span>
                <span className="font-mono font-medium text-ink">{formatCurrency(round2(subtotal))}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-dimmer">GST ({gstPercent}%)</span>
                <span className="font-mono text-accent">+ {formatCurrency(taxAmount)}</span>
              </div>
            </div>
          </div>

          {/* Grand total hero block */}
          <div className="mt-4 border border-accent/40 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="font-display text-sm uppercase tracking-wider text-ink font-bold block">Grand Total</span>
              <span className="text-[10px] font-mono text-ink-dimmer uppercase tracking-widest">Includes GST</span>
            </div>
            <span className="font-mono text-2xl font-bold text-accent drop-shadow">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Costing Form (full page) ─────────────────────────────────────────────────

function CostingForm({
  editingRecord,
  onSaved,
  onCancel,
}: {
  editingRecord: SavedRecord | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const editingId = editingRecord?.id ?? null;
  const [companyName, setCompanyName] = useState(editingRecord?.companyName ?? "");
  const [deliveryTime, setDeliveryTime] = useState(editingRecord?.deliveryTime ?? "");

  const [items, setItems] = useState<CostingItem[]>([]);
  const [draft, setDraft] = useState<CostingItem>(defaultItem());
  const [dbMaterials, setDbMaterials] = useState<DbMaterial[]>([]);
  const [dbMachines, setDbMachines] = useState<DbMachine[]>([]);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [gstPercent, setGstPercent] = useState(editingRecord?.gstPercent ?? 18);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/materials").then((r) => r.json()),
      fetch("/api/machines").then((r) => r.json()),
    ])
      .then(([matData, macData]) => {
        setDbMaterials(matData.materials ?? []);
        setDbMachines(macData.machines ?? []);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (editingRecord) {
      setCompanyName(editingRecord.companyName ?? "");
      setDeliveryTime(editingRecord.deliveryTime ?? "");
      setGstPercent(editingRecord.gstPercent ?? 18);

      if (editingRecord.itemsJson) {
        try {
          const parsed = JSON.parse(editingRecord.itemsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            return;
          }
        } catch (e) {}
      }

      const initialItem: CostingItem = {
        id: uid(),
        partName: editingRecord.title ?? "Item 1",
        materialType: editingRecord.materialType || MATERIAL_TYPES[0],
        thicknessMm: editingRecord.thicknessMm || 0,
        materialRatePerKg: editingRecord.materialRatePerKg || 0,
        weightKg: editingRecord.weightKg || 0,
        cuttingMachine: "",
        cuttingLengthM: editingRecord.cuttingLengthM || 0,
        cuttingRatePerM: editingRecord.cuttingRatePerM || 0,
        cuttingTimeMin: Math.round((editingRecord.cuttingLengthM || 0) * 60),
        bendingMachine: "",
        bendCount: editingRecord.bendCount || 0,
        bendRatePerBend: editingRecord.bendRatePerBend || 0,
        bendingTimeMin: Math.round((editingRecord.bendCount || 0) * 60),
      };
      setItems([initialItem]);
    } else {
      setCompanyName("");
      setDeliveryTime("");
      setItems([]);
    }
  }, [editingRecord]);

  const computedItems = useMemo(() => items.map(computeItem), [items]);

  function handleDraftChange(key: keyof CostingItem, value: string | number) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddItem() {
    if (editItemId) {
      setItems((prev) => prev.map((it) => it.id === editItemId ? { ...draft, id: editItemId } : it));
      setEditItemId(null);
    } else {
      if (!draft.partName.trim()) { toast.error("Enter a part name first"); return; }
      setItems((prev) => [...prev, { ...draft, id: uid() }]);
    }
    setDraft(defaultItem());
    toast.success(editItemId ? "Item updated" : "Item added");
  }

  function handleEditItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setDraft({ ...item });
    setEditItemId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  function handleDeleteItem(id: string) {
    setDeletingItemId(id);
  }

  function confirmRemoveItem() {
    if (!deletingItemId) return;
    setItems((prev) => prev.filter((i) => i.id !== deletingItemId));
    if (editItemId === deletingItemId) { setEditItemId(null); setDraft(defaultItem()); }
    setDeletingItemId(null);
  }

  function resetAll() {
    setCompanyName("");
    setDeliveryTime("");
    setItems([]);
    setDraft(defaultItem());
    setEditItemId(null);
    setGstPercent(18);
  }

  function handleOpenSaveModal() {
    if (items.length === 0) { toast.error("Add at least one item first"); return; }
    setShowSaveModal(true);
  }

  async function handleConfirmSaveModal(data: { companyName: string; deliveryTime: string }) {
    setCompanyName(data.companyName);
    setDeliveryTime(data.deliveryTime);

    const totalWeightKg = round2(computedItems.reduce((s, i) => s + i.weightKg, 0));
    const totalMaterialCost = round2(computedItems.reduce((s, i) => s + i.materialCost, 0));
    const totalCuttingTimeHours = round2(computedItems.reduce((s, i) => s + (i.cuttingTimeMin / 60), 0));
    const totalCuttingCost = round2(computedItems.reduce((s, i) => s + i.cuttingCost, 0));
    const totalBendingTimeHours = round2(computedItems.reduce((s, i) => s + (i.bendingTimeMin / 60), 0));
    const totalBendingCost = round2(computedItems.reduce((s, i) => s + i.bendingCost, 0));

    const payload = {
      title: `Quote for ${data.companyName}`,
      companyName: data.companyName,
      deliveryTime: data.deliveryTime,
      itemsJson: computedItems,
      materialType: items[0]?.materialType ?? MATERIAL_TYPES[0],
      thicknessMm: items[0]?.thicknessMm ?? 0,
      weightKg: totalWeightKg,
      materialRatePerKg: totalWeightKg > 0 ? round2(totalMaterialCost / totalWeightKg) : 0,
      cuttingLengthM: totalCuttingTimeHours,
      cuttingRatePerM: totalCuttingTimeHours > 0 ? round2(totalCuttingCost / totalCuttingTimeHours) : 0,
      bendCount: totalBendingTimeHours,
      bendRatePerBend: totalBendingTimeHours > 0 ? round2(totalBendingCost / totalBendingTimeHours) : 0,
      wastagePercent: 0,
      marginPercent: 0,
      gstPercent,
    };

    setSaving(true);
    try {
      const url = editingId ? `/api/costing/${editingId}` : "/api/costing";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.error ?? "Failed to save quote");
      }
      toast.success(editingId ? "Quote updated" : "Quote saved");
      setShowSaveModal(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handlePrintDraft() {
    if (computedItems.length === 0) {
      toast.error("Add at least one item first");
      return;
    }
    printCostingRecord(
      {
        companyName: companyName || "Client",
        deliveryTime: deliveryTime,
        gstPercent: gstPercent,
      },
      computedItems
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {editingId && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editing Quote
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrintDraft} className="gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-19.126 0C1.068 7.441.3 8.375.3 9.456v6.294A2.25 2.25 0 002.55 18h1.091" />
            </svg>
            Print PDF
          </Button>
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset
          </Button>
          <Button size="sm" onClick={handleOpenSaveModal} isLoading={saving} className="gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {editingId ? "Update Quote" : "Save as Draft"}
          </Button>
        </div>
      </div>

      {/* Add Item form */}
      <AddItemForm draft={draft} dbMaterials={dbMaterials} dbMachines={dbMachines} onChange={handleDraftChange} onAdd={handleAddItem} />

      {/* Items table */}
      <ItemsTable items={computedItems} onEdit={handleEditItem} onDelete={handleDeleteItem} />

      {/* Quotation Summary */}
      <QuotationSummary
        items={computedItems}
        gstPercent={gstPercent}
        onGstChange={setGstPercent}
      />

      <SaveQuoteModal
        isOpen={showSaveModal}
        companyName={companyName}
        deliveryTime={deliveryTime}
        saving={saving}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSaveModal}
      />

      <ConfirmModal
        isOpen={!!deletingItemId}
        title="Remove Item"
        message="Are you sure you want to remove this item from the quote?"
        onConfirm={confirmRemoveItem}
        onClose={() => setDeletingItemId(null)}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CostingCalculator() {
  const [view, setView] = useState<View>("list");
  const [editingRecord, setEditingRecord] = useState<SavedRecord | null>(null);
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [viewRecord, setViewRecord] = useState<SavedRecord | null>(null);

  const fetchRecords = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/costing");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch { toast.error("Could not load saved quotes"); }
    finally { setListLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  function openAdd() { setEditingRecord(null); setView("form"); }
  function openEdit(r: SavedRecord) { setEditingRecord(r); setViewRecord(null); setView("form"); }
  function backToList() { setView("list"); setEditingRecord(null); }
  async function handleSaved() { await fetchRecords(); backToList(); }

  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [isDeletingQuote, setIsDeletingQuote] = useState(false);

  function handleDelete(id: string) {
    setDeletingQuoteId(id);
  }

  async function handleConfirmDeleteQuote() {
    if (!deletingQuoteId) return;
    setIsDeletingQuote(true);
    try {
      const res = await fetch(`/api/costing/${deletingQuoteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Quote deleted");
      await fetchRecords();
    } catch { toast.error("Could not delete quote"); }
    finally {
      setIsDeletingQuote(false);
      setDeletingQuoteId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Costing Calculator"
        description="View saved quotes or create a new costing with material, cutting, bending, and GST."
        action={
          view === "list" ? (
            <Button size="sm" onClick={openAdd}>
              + Add Costing
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={backToList} className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </Button>
          )
        }
      />

      {viewRecord && (
        <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} onEdit={() => openEdit(viewRecord)} />
      )}

      {view === "list" ? (
        <Card className="overflow-hidden">
          <SavedCostingList
            records={records} loading={listLoading}
            onView={setViewRecord} onEdit={openEdit}
            onDelete={handleDelete} onAdd={openAdd} onRefresh={fetchRecords}
          />
        </Card>
      ) : (
        <CostingForm
          editingRecord={editingRecord}
          onSaved={handleSaved}
          onCancel={backToList}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingQuoteId}
        title="Delete Quote"
        message="Are you sure you want to delete this quote? This cannot be undone."
        isLoading={isDeletingQuote}
        onConfirm={handleConfirmDeleteQuote}
        onClose={() => setDeletingQuoteId(null)}
      />
    </div>
  );
}
