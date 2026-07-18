"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge, Card, SpecRow } from "@/components/ui/Card";
import { MATERIAL_TYPES } from "@/lib/costing";
import { formatCurrency, formatDate } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const THICKNESS_OPTIONS = ["1 mm", "1.5 mm", "2 mm", "2.5 mm", "3 mm", "4 mm", "5 mm", "6 mm", "8 mm", "10 mm", "12 mm"];
const CUTTING_MACHINES = ["Fiber Laser 3KW", "Fiber Laser 6KW", "CO2 Laser 2KW", "Plasma Cutter", "Waterjet"];
const BENDING_MACHINES = ["160 Ton CNC", "100 Ton CNC", "80 Ton CNC", "60 Ton CNC", "Hand Brake"];

// ─── Types ────────────────────────────────────────────────────────────────────

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
  bendingMachine: string;
  bendCount: number;
  bendRatePerBend: number;
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
  title: string;
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
  const cuttingCost = item.cuttingLengthM * item.cuttingRatePerM;
  const bendingCost = item.bendCount * item.bendRatePerBend;
  const cuttingTimeMin = item.cuttingLengthM; // 1 MTR/min
  const bendingTimeMin = item.bendCount * 1.2; // 1.2 min/bend
  return {
    ...item,
    materialCost: round2(materialCost),
    cuttingCost: round2(cuttingCost),
    bendingCost: round2(bendingCost),
    total: round2(materialCost + cuttingCost + bendingCost),
    cuttingTimeMin,
    bendingTimeMin,
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
    materialType: MATERIAL_TYPES[0],
    thicknessMm: 0,
    materialRatePerKg: 0,
    weightKg: 0,
    cuttingMachine: CUTTING_MACHINES[0],
    cuttingLengthM: 0,
    cuttingRatePerM: 0,
    bendingMachine: BENDING_MACHINES[0],
    bendCount: 0,
    bendRatePerBend: 0,
  };
}

// ─── PDF printer ──────────────────────────────────────────────────────────────

function printCostingRecord(record: SavedRecord) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { toast.error("Pop-up blocked – allow pop-ups and try again."); return; }

  const rows = [
    ["Material Cost", formatCurrency(record.materialCost)],
    ["Cutting Cost", formatCurrency(record.cuttingCost)],
    ["Bending Cost", formatCurrency(record.bendingCost)],
    ["Wastage", formatCurrency(record.wastageCost)],
    ["Subtotal", formatCurrency(record.subtotal)],
    [`Margin (${record.marginPercent}%)`, formatCurrency(record.marginAmount)],
    [`GST (${record.gstPercent}%)`, formatCurrency(record.taxAmount)],
  ].map(([k, v]) => `<tr>
    <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#666;font-size:13px;">${k}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;font-size:13px;color:#FF6A1A;">${v}</td>
  </tr>`).join("");

  win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <title>Quote – ${record.title}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #FF6A1A;padding-bottom:20px;margin-bottom:28px}
  .company{font-size:22px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#FF6A1A}
  .company small{display:block;font-size:11px;font-weight:400;color:#666;letter-spacing:2px;margin-top:2px;color:#333}
  .meta{text-align:right;font-size:12px;color:#555;line-height:1.7}
  h1{font-size:18px;font-weight:700;margin-bottom:6px}
  .badge{display:inline-block;background:#fff3ee;border:1px solid #FF6A1A;padding:3px 10px;font-size:11px;border-radius:3px;color:#FF6A1A;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;margin-bottom:4px}
  .total-row td{padding:14px;font-size:17px;font-weight:700;border-top:2px solid #FF6A1A;color:#FF6A1A}
  .footer{margin-top:40px;font-size:11px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:14px}
  @media print{body{padding:20px}}</style></head>
  <body>
  <div class="header"><div><div class="company">Shreeji Enterprise<small>Laser Cutting &amp; Fabrication</small></div></div>
  <div class="meta"><div><strong>Quote Date:</strong> ${formatDate(record.createdAt)}</div>
  ${record.inquiry ? `<div><strong>Client:</strong> ${record.inquiry.name}${record.inquiry.company ? ` · ${record.inquiry.company}` : ""}</div>` : ""}
  <div><strong>Quote ID:</strong> ${record.id.slice(-8).toUpperCase()}</div></div></div>
  <h1>${record.title}</h1><div class="badge">${record.materialType}</div>
  <table><tbody>${rows}
  <tr class="total-row"><td>GRAND TOTAL (incl. GST)</td><td style="text-align:right">${formatCurrency(record.totalCost)}</td></tr>
  </tbody></table>
  <div class="footer">Computer-generated quotation · Valid 30 days · Shreeji Enterprise</div>
  <script>setTimeout(()=>{window.print();window.close()},400)</script></body></html>`);
  win.document.close();
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ record, onClose, onEdit }: { record: SavedRecord; onClose: () => void; onEdit: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg border border-line bg-bg-alt shadow-2xl">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <p className="font-display text-lg font-semibold uppercase tracking-wide text-ink">{record.title}</p>
            <p className="mt-0.5 text-xs text-ink-dimmer">{record.materialType} · {record.thicknessMm} mm · {formatDate(record.createdAt)}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-ink-dimmer hover:text-ink">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line-soft px-5 py-3">
          {[["Weight", `${record.weightKg} kg`], ["Rate/kg", formatCurrency(record.materialRatePerKg)],
            ["Cut Length", `${record.cuttingLengthM} m`], ["Bends", String(record.bendCount)],
            ["Wastage", `${record.wastagePercent}%`], ["Margin", `${record.marginPercent}%`], ["GST", `${record.gstPercent}%`]
          ].map(([k, v]) => (
            <div key={k}><p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">{k}</p>
              <p className="text-sm font-medium text-ink">{v}</p></div>
          ))}
        </div>
        <div className="px-5 py-4">
          <SpecRow k="Material Cost" v={formatCurrency(record.materialCost)} />
          <SpecRow k="Cutting Cost" v={formatCurrency(record.cuttingCost)} />
          <SpecRow k="Bending Cost" v={formatCurrency(record.bendingCost)} />
          <SpecRow k="Wastage" v={formatCurrency(record.wastageCost)} />
          <SpecRow k="Subtotal" v={formatCurrency(record.subtotal)} />
          <SpecRow k="Margin" v={formatCurrency(record.marginAmount)} />
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
        {records.map((r) => (
          <div key={r.id} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-light/40">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{r.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{r.materialType}</Badge>
                {r.thicknessMm > 0 && <span className="font-mono text-[11px] text-ink-dimmer">{r.thicknessMm} mm</span>}
                <span className="text-[11px] text-ink-dimmer">{formatDate(r.createdAt)}</span>
                {r.inquiry && <span className="font-mono text-[11px] text-accent">{r.inquiry.name}</span>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-base font-semibold text-accent">{formatCurrency(r.totalCost)}</p>
              <p className="font-mono text-[10px] text-ink-dimmer">incl. GST</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              {[
                { label: "View", icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z", onClick: () => onView(r) },
                { label: "Edit", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z", onClick: () => onEdit(r) },
                { label: "PDF", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3", onClick: () => printCostingRecord(r) },
              ].map(({ label, icon, onClick }) => (
                <button key={label} onClick={onClick} className="flex items-center gap-1 border border-line px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-dim transition-colors hover:border-accent hover:text-accent">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                  {label}
                </button>
              ))}
              <button onClick={() => onDelete(r.id)} className="flex items-center gap-1 border border-red-900/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-red-500/60 transition-colors hover:border-red-700 hover:text-red-400">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Del
              </button>
            </div>
          </div>
        ))}
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
  options: string[]; className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-line bg-bg text-ink px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors ${className}`}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
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

function AddItemForm({
  draft,
  onChange,
  onAdd,
}: {
  draft: CostingItem;
  onChange: (key: keyof CostingItem, value: string | number) => void;
  onAdd: () => void;
}) {
  const computed = useMemo(() => computeItem(draft), [draft]);

  // Editable Est. Time strings (HH:MM). Auto-suggest from computed, but user can override.
  const [cuttingTimeStr, setCuttingTimeStr] = useState("");
  const [bendingTimeStr, setBendingTimeStr] = useState("");

  // When cutting length changes and user hasn't typed a time yet, auto-suggest
  useEffect(() => {
    if (!cuttingTimeStr || cuttingTimeStr === "00:00") {
      setCuttingTimeStr(computed.cuttingTimeMin > 0 ? formatTime(computed.cuttingTimeMin) : "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.cuttingLengthM]);

  useEffect(() => {
    if (!bendingTimeStr || bendingTimeStr === "00:00") {
      setBendingTimeStr(computed.bendingTimeMin > 0 ? formatTime(computed.bendingTimeMin) : "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.bendCount]);

  function handleAdd() {
    // Inject the manually-entered times (in minutes) before calling onAdd
    // We store them temporarily via onChange so CostingForm can read them on add.
    // Use a wrapper approach: pass time context through a closure captured here.
    _pendingCuttingTimeMin = cuttingTimeStr ? hhmmToMinutes(cuttingTimeStr) : computed.cuttingTimeMin;
    _pendingBendingTimeMin = bendingTimeStr ? hhmmToMinutes(bendingTimeStr) : computed.bendingTimeMin;
    onAdd();
    // Reset time fields
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FLabel>Material</FLabel>
              <FSelect value={draft.materialType} onChange={(v) => onChange("materialType", v)} options={[...MATERIAL_TYPES]} />
            </div>
            <div>
              <FLabel>Thickness</FLabel>
              <FSelect
                value={`${draft.thicknessMm} mm`}
                onChange={(v) => onChange("thicknessMm", parseThickness(v))}
                options={THICKNESS_OPTIONS}
              />
            </div>
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
            <FSelect value={draft.cuttingMachine} onChange={(v) => onChange("cuttingMachine", v)} options={CUTTING_MACHINES} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FLabel>Cutting Length</FLabel>
              <div className="flex items-stretch">
                <FInput type="number" min={0} step={0.1} value={draft.cuttingLengthM}
                  onChange={(v) => onChange("cuttingLengthM", Number(v))} className="flex-1" />
                <span className="flex items-center border border-l-0 border-line bg-bg-light px-2 font-mono text-[11px] text-ink-dimmer">MTR</span>
              </div>
            </div>
            <div>
              <FLabel>Rate (₹/MTR)</FLabel>
              <FInput type="number" min={0} step={0.5} value={draft.cuttingRatePerM}
                onChange={(v) => onChange("cuttingRatePerM", Number(v))} />
            </div>
          </div>
          <div className="mt-3">
            <FLabel>Est. Time (HH:MM)</FLabel>
            <div className="flex items-center border border-line bg-bg">
              <span className="flex shrink-0 items-center pl-3 pr-1.5">
                <svg className="h-3.5 w-3.5 text-ink-dimmer" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={cuttingTimeStr}
                onChange={(e) => setCuttingTimeStr(e.target.value)}
                placeholder="00:00"
                maxLength={5}
                className="w-full bg-transparent py-2 pr-3 font-mono text-sm text-ink placeholder:text-ink-dimmer focus:outline-none"
              />
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
            <FSelect value={draft.bendingMachine} onChange={(v) => onChange("bendingMachine", v)} options={BENDING_MACHINES} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FLabel>No. of Bends</FLabel>
              <FInput type="number" min={0} step={1} value={draft.bendCount}
                onChange={(v) => onChange("bendCount", Number(v))} />
            </div>
            <div>
              <FLabel>Rate (₹/Bend)</FLabel>
              <FInput type="number" min={0} step={0.5} value={draft.bendRatePerBend}
                onChange={(v) => onChange("bendRatePerBend", Number(v))} />
            </div>
          </div>
          <div className="mt-3">
            <FLabel>Est. Time (HH:MM)</FLabel>
            <div className="flex items-center border border-line bg-bg">
              <span className="flex shrink-0 items-center pl-3 pr-1.5">
                <svg className="h-3.5 w-3.5 text-ink-dimmer" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={bendingTimeStr}
                onChange={(e) => setBendingTimeStr(e.target.value)}
                placeholder="00:00"
                maxLength={5}
                className="w-full bg-transparent py-2 pr-3 font-mono text-sm text-ink placeholder:text-ink-dimmer focus:outline-none"
              />
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
              <th colSpan={5} className="border-l border-line px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Cutting Cost</th>
              {/* Bending sub-headers */}
              <th colSpan={5} className="border-l border-line px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-ink-dimmer bg-accent/5">Bending Cost</th>
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
              {["Machine", "Length", "Rate (₹/MTR)", "Time", "Amt (₹)"].map((h) => (
                <th key={h} className={`px-3 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-ink-dimmer ${h === "Machine" ? "border-l border-line" : ""}`}>{h}</th>
              ))}
              {/* Bending */}
              {["Machine", "Bends", "Rate (₹/Bend)", "Time", "Amt (₹)"].map((h) => (
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
                <td className="border-l border-line-soft px-3 py-3 text-ink-dim text-[12px]">{item.cuttingMachine}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.cuttingLengthM} MTR</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.cuttingRatePerM.toFixed(2)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{formatTime(item.cuttingTimeMin)}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-accent">{item.cuttingCost.toFixed(2)}</td>
                {/* Bending */}
                <td className="border-l border-line-soft px-3 py-3 text-ink-dim text-[12px]">{item.bendingMachine}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-dim">{item.bendCount}</td>
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
              <td className="border-l border-line-soft px-3 py-3" colSpan={2}></td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3 font-mono text-sm text-accent">{round2(totals.cuttingCost).toFixed(2)}</td>
              <td className="border-l border-line-soft px-3 py-3" colSpan={2}></td>
              <td className="px-3 py-3 font-mono text-[12px] text-ink">{round2(totals.bendCount)}</td>
              <td className="px-3 py-3"></td>
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

// ─── Quotation Summary ────────────────────────────────────────────────────────

function QuotationSummary({
  items,
  title,
  wastagePercent,
  marginPercent,
  gstPercent,
  onWastageChange,
  onMarginChange,
  onGstChange,
}: {
  items: ComputedItem[];
  title: string;
  wastagePercent: number;
  marginPercent: number;
  gstPercent: number;
  onWastageChange: (v: number) => void;
  onMarginChange: (v: number) => void;
  onGstChange: (v: number) => void;
}) {
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.total, 0), [items]);
  const wastageCost = round2(subtotal * wastagePercent / 100);
  const afterWastage = subtotal + wastageCost;
  const marginAmount = round2(afterWastage * marginPercent / 100);
  const taxableAmount = afterWastage + marginAmount;
  const taxAmount = round2(taxableAmount * gstPercent / 100);
  const grandTotal = round2(taxableAmount + taxAmount);

  return (
    <div className="border border-line bg-bg-alt">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-accent">Quotation Summary</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: Adjustment controls */}
        <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Adjustments</p>

          <div className="space-y-4">
            {/* Quote title */}
            <div>
              <FLabel>Quote Title *</FLabel>
              <p className="border border-line bg-bg px-3 py-2 text-sm text-ink">{title || <span className="text-ink-dimmer italic">Enter title above</span>}</p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <FLabel>Wastage %</FLabel>
                <FInput type="number" min={0} step={0.5} value={wastagePercent}
                  onChange={(v) => onWastageChange(Number(v))} />
              </div>
              <div>
                <FLabel>Margin %</FLabel>
                <FInput type="number" min={0} step={0.5} value={marginPercent}
                  onChange={(v) => onMarginChange(Number(v))} />
              </div>
              <div>
                <FLabel>GST %</FLabel>
                <FInput type="number" min={0} step={0.5} value={gstPercent}
                  onChange={(v) => onGstChange(Number(v))} />
              </div>
            </div>
          </div>

          {/* Per-category breakdown */}
          {items.length > 0 && (
            <div className="mt-5 border-t border-line-soft pt-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Cost Breakdown</p>
              <div className="space-y-0">
                {[
                  ["Material", round2(items.reduce((s, i) => s + i.materialCost, 0))],
                  ["Cutting", round2(items.reduce((s, i) => s + i.cuttingCost, 0))],
                  ["Bending", round2(items.reduce((s, i) => s + i.bendingCost, 0))],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between border-b border-line-soft py-2.5 last:border-none">
                    <span className="text-sm text-ink-dim">{k}</span>
                    <span className="font-mono text-sm text-ink">{formatCurrency(Number(v))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Final computation */}
        <div className="p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Final Calculation</p>
          <div className="space-y-0">
            {[
              { k: "Items Subtotal", v: formatCurrency(round2(subtotal)), muted: false },
              { k: `Wastage (${wastagePercent}%)`, v: `+ ${formatCurrency(wastageCost)}`, muted: true },
              { k: "After Wastage", v: formatCurrency(round2(afterWastage)), muted: false },
              { k: `Margin (${marginPercent}%)`, v: `+ ${formatCurrency(marginAmount)}`, muted: true },
              { k: "Taxable Amount", v: formatCurrency(round2(taxableAmount)), muted: false },
              { k: `GST (${gstPercent}%)`, v: `+ ${formatCurrency(taxAmount)}`, muted: true },
            ].map(({ k, v, muted }) => (
              <div key={k} className="flex items-center justify-between border-b border-line-soft py-2.5 last:border-none">
                <span className={`text-sm ${muted ? "text-ink-dimmer" : "text-ink-dim"}`}>{k}</span>
                <span className={`font-mono text-sm ${muted ? "text-ink-dimmer" : "text-ink"}`}>{v}</span>
              </div>
            ))}
          </div>

          {/* Grand total */}
          <div className="mt-4 flex items-center justify-between border border-accent/30 bg-accent/5 px-4 py-4">
            <span className="font-display text-base uppercase tracking-wide text-ink">Grand Total (incl. GST)</span>
            <span className="font-mono text-2xl font-bold text-accent">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Costing Form (full page) ─────────────────────────────────────────────────

function CostingForm({
  editingId,
  initialTitle,
  onSaved,
  onCancel,
}: {
  editingId: string | null;
  initialTitle: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [items, setItems] = useState<CostingItem[]>([]);
  const [draft, setDraft] = useState<CostingItem>(defaultItem());
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [wastagePercent, setWastagePercent] = useState(5);
  const [marginPercent, setMarginPercent] = useState(15);
  const [gstPercent, setGstPercent] = useState(18);
  const [saving, setSaving] = useState(false);

  const computedItems = useMemo(() => items.map(computeItem), [items]);

  function handleDraftChange(key: keyof CostingItem, value: string | number) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddItem() {
    if (editItemId) {
      // Update existing
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

  function handleDeleteItem(id: string) {
    if (!confirm("Remove this item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editItemId === id) { setEditItemId(null); setDraft(defaultItem()); }
  }

  function resetAll() {
    setTitle("");
    setItems([]);
    setDraft(defaultItem());
    setEditItemId(null);
    setWastagePercent(5);
    setMarginPercent(15);
    setGstPercent(18);
  }

  async function handleSave() {
    if (!title.trim()) { toast.error("Give this quote a title first"); return; }
    if (items.length === 0) { toast.error("Add at least one item"); return; }

    const subtotal = computedItems.reduce((s, i) => s + i.total, 0);
    const wastageCost = round2(subtotal * wastagePercent / 100);
    const afterWastage = subtotal + wastageCost;
    const marginAmount = round2(afterWastage * marginPercent / 100);
    const taxableAmount = afterWastage + marginAmount;
    const taxAmount = round2(taxableAmount * gstPercent / 100);
    const grandTotal = round2(taxableAmount + taxAmount);

    const totalWeightKg = round2(computedItems.reduce((s, i) => s + i.weightKg, 0));
    const totalMaterialCost = round2(computedItems.reduce((s, i) => s + i.materialCost, 0));
    const totalCuttingLengthM = round2(computedItems.reduce((s, i) => s + i.cuttingLengthM, 0));
    const totalCuttingCost = round2(computedItems.reduce((s, i) => s + i.cuttingCost, 0));
    const totalBendCount = computedItems.reduce((s, i) => s + i.bendCount, 0);
    const totalBendingCost = round2(computedItems.reduce((s, i) => s + i.bendingCost, 0));

    const payload = {
      title,
      materialType: items[0]?.materialType ?? MATERIAL_TYPES[0],
      thicknessMm: items[0]?.thicknessMm ?? 0,
      weightKg: totalWeightKg,
      materialRatePerKg: totalWeightKg > 0 ? round2(totalMaterialCost / totalWeightKg) : 0,
      cuttingLengthM: totalCuttingLengthM,
      cuttingRatePerM: totalCuttingLengthM > 0 ? round2(totalCuttingCost / totalCuttingLengthM) : 0,
      bendCount: totalBendCount,
      bendRatePerBend: totalBendCount > 0 ? round2(totalBendingCost / totalBendCount) : 0,
      wastagePercent,
      marginPercent,
      gstPercent,
    };

    setSaving(true);
    try {
      const url = editingId ? `/api/costing/${editingId}` : "/api/costing";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save quote");
      }
      toast.success(editingId ? "Quote updated" : "Quote saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onCancel}
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer transition-colors hover:text-ink">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to list
          </button>
          {editingId && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editing
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Quote title inline */}
          <div className="flex items-center gap-2">
            <FLabel>Quote Title</FLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MS Bracket – Batch 5"
              className="w-56 border border-line bg-bg text-ink px-3 py-2 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-ink-dimmer"
            />
          </div>
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} isLoading={saving} className="gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {editingId ? "Update Quote" : "Save as Draft"}
          </Button>
        </div>
      </div>

      {/* Add Item form */}
      <AddItemForm draft={draft} onChange={handleDraftChange} onAdd={handleAddItem} />

      {/* Items table */}
      <ItemsTable items={computedItems} onEdit={handleEditItem} onDelete={handleDeleteItem} />

      {/* Quotation Summary */}
      <QuotationSummary
        items={computedItems}
        title={title}
        wastagePercent={wastagePercent}
        marginPercent={marginPercent}
        gstPercent={gstPercent}
        onWastageChange={setWastagePercent}
        onMarginChange={setMarginPercent}
        onGstChange={setGstPercent}
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

  async function handleDelete(id: string) {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/costing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Quote deleted");
      await fetchRecords();
    } catch { toast.error("Could not delete quote"); }
  }

  return (
    <>
      {viewRecord && (
        <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} onEdit={() => openEdit(viewRecord)} />
      )}

      {view === "list" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Saved Quotes</p>
            <Button size="sm" onClick={openAdd} className="gap-2">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Costing
            </Button>
          </div>
          <Card className="overflow-hidden">
            <SavedCostingList
              records={records} loading={listLoading}
              onView={setViewRecord} onEdit={openEdit}
              onDelete={handleDelete} onAdd={openAdd} onRefresh={fetchRecords}
            />
          </Card>
        </div>
      ) : (
        <CostingForm
          editingId={editingRecord?.id ?? null}
          initialTitle={editingRecord?.title ?? ""}
          onSaved={handleSaved}
          onCancel={backToList}
        />
      )}
    </>
  );
}
