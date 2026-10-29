"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Printer,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { Badge, EmptyState } from "@/components/ui/Card";
import { TrashIcon, PencilIcon } from "@/components/ui/Icons";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  printJobworkInvoice,
  type JobworkLineItemData,
  type JobworkSalePrintData,
  type CompanySettingsData,
} from "@/lib/jobwork-print";
import { type PartyRecord } from "./PartyManager";

// ─── Constants & Types ─────────────────────────────────────────────────────────

const PROCESS_OPTIONS = [
  "Laser Cutting",
  "CNC Bending",
  "Sheet Fabrication",
  "Welding & Assembly",
  "Powder Coating",
  "Drilling & Tapping",
  "Job Work Service",
  "Other Job Work",
];

const UNIT_OPTIONS = ["Nos", "Pcs", "Mtr", "Kg", "Hr", "Lot", "Set"];
const GST_RATES = [0, 5, 12, 18, 28];

interface JobworkSaleRecord extends JobworkSalePrintData {
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string } | null;
}


function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Calculate next sequential series-wise invoice number (e.g. PF/26-27/0001) */
function computeNextInvoiceNumber(existingSales: { invoiceNumber: string }[], dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = d.getMonth(); // 0 is Jan, 3 is April
  const fullYear = d.getFullYear();
  const startYear = month >= 3 ? fullYear : fullYear - 1;
  const endYear = startYear + 1;
  const fyCode = `${String(startYear % 100).padStart(2, "0")}-${String(endYear % 100).padStart(2, "0")}`;
  const prefix = `PF/${fyCode}/`;

  let maxSeq = 0;
  for (const s of existingSales) {
    if (s.invoiceNumber && s.invoiceNumber.startsWith(prefix)) {
      const parts = s.invoiceNumber.split("/");
      const lastPart = parts[parts.length - 1];
      const seq = parseInt(lastPart ?? "0", 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}

function defaultLineItem(): JobworkLineItemData {
  return {
    id: uid(),
    partName: "",
    processType: "Laser Cutting",
    material: "",
    thicknessMm: 0,
    hsnSac: "",
    quantity: 0,
    unit: "Nos",
    unitPrice: 0,
    total: 0,
  };
}

export function JobworkSalesManager() {
  const [sales, setSales] = useState<JobworkSaleRecord[]>([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<CompanySettingsData | null>(null);

  // View state: 'list' | 'form'
  const [view, setView] = useState<"list" | "form">("list");
  const [editingSale, setEditingSale] = useState<JobworkSaleRecord | null>(null);

  // Form Fields - Bill To
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]!);
  const [dueDate, setDueDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");

  // Parties List & Selected Party
  const [parties, setParties] = useState<PartyRecord[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");

  // Form Fields - Ship To
  const [sameAsBillTo, setSameAsBillTo] = useState(true);
  const [shipToName, setShipToName] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [shipToPhone, setShipToPhone] = useState("");
  const [shipToGst, setShipToGst] = useState("");

  const [items, setItems] = useState<JobworkLineItemData[]>([defaultLineItem()]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(18);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Data ─────────────────────────────────────────────────────────────

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/jobwork-sales");
      if (!res.ok) throw new Error("Failed to load jobwork sales");
      const data = await res.json();
      setSales(data.sales || []);
      if (data.nextInvoiceNumber) {
        setNextInvoiceNumber(data.nextInvoiceNumber);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch jobwork sales");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await fetch("/api/parties");
      if (res.ok) {
        const data = await res.json();
        setParties(data.parties || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchSales();
    fetchParties();
  }, []);

  const handleSelectParty = (partyId: string) => {
    setSelectedPartyId(partyId);
    if (!partyId) {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerGst("");
      setCustomerAddress("");
      setPlaceOfSupply("");
      return;
    }
    const found = parties.find((p) => p.id === partyId);
    if (found) {
      setCustomerName(found.companyName || found.name || "");
      setCustomerPhone(found.phone || "");
      setCustomerEmail(found.email || "");
      setCustomerGst(found.gstin || "");
      setCustomerAddress(found.address || "");
      setPlaceOfSupply(found.city || "");
    }
  };

  // Fetch Site Settings for print and defaults
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setCompanySettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load company settings:", err);
      }
    };
    fetchCompanySettings();
  }, []);

  // ─── Form Calculations ──────────────────────────────────────────────────────

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (taxRatePercent || 0)) / 100;
  }, [subtotal, taxRatePercent]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const balanceAmount = useMemo(() => {
    return Math.max(0, grandTotal - (paidAmount || 0));
  }, [grandTotal, paidAmount]);

  const autoPaymentStatus = useMemo(() => {
    if (paidAmount >= grandTotal && grandTotal > 0) return "PAID";
    if (paidAmount > 0 && paidAmount < grandTotal) return "PARTIAL";
    return "PENDING";
  }, [paidAmount, grandTotal]);

  const partyOptions = useMemo(() => {
    return parties.map((p) => ({
      value: p.id,
      label: `${p.companyName || p.name}${p.gstin ? ` (${p.gstin})` : ""}`,
    }));
  }, [parties]);

  const processOptions = useMemo(() => {
    return PROCESS_OPTIONS.map((opt) => ({ value: opt, label: opt }));
  }, []);

  const unitOptions = useMemo(() => {
    return UNIT_OPTIONS.map((u) => ({ value: u, label: u }));
  }, []);

  // ─── Form Handlers ──────────────────────────────────────────────────────────

  const handleOpenCreateForm = () => {
    setEditingSale(null);
    const today = new Date().toISOString().split("T")[0]!;
    const nextInv = nextInvoiceNumber || computeNextInvoiceNumber(sales, today);
    setInvoiceNumber(nextInv);
    setInvoiceDate(today);
    setDueDate("");
    setSelectedPartyId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerGst("");
    setCustomerAddress("");
    setPlaceOfSupply("");
    setSameAsBillTo(true);
    setShipToName("");
    setShipToAddress("");
    setShipToPhone("");
    setShipToGst("");
    setItems([defaultLineItem()]);
    setDiscountAmount(0);
    setTaxRatePercent(18);
    setPaidAmount(0);
    setPaymentMethod("Bank Transfer");
    setNotes("");
    setTerms(companySettings?.termsAndConditions || "");
    setView("form");
  };

  const handleOpenEditForm = (sale: JobworkSaleRecord) => {
    setEditingSale(sale);
    setInvoiceNumber(sale.invoiceNumber);
    setInvoiceDate(new Date(sale.invoiceDate).toISOString().split("T")[0]!);
    setDueDate(sale.dueDate ? new Date(sale.dueDate).toISOString().split("T")[0]! : "");
    setCustomerName(sale.customerName);
    setCustomerPhone(sale.customerPhone || "");
    setCustomerEmail(sale.customerEmail || "");
    setCustomerGst(sale.customerGst || "");
    setCustomerAddress(sale.customerAddress || "");
    setPlaceOfSupply(sale.placeOfSupply || "");

    const matchedParty = parties.find(
      (p) => p.companyName.toLowerCase() === sale.customerName?.toLowerCase()
    );
    setSelectedPartyId(matchedParty ? matchedParty.id : "");

    const hasCustomShip = Boolean(sale.shipToName && sale.shipToName !== sale.customerName);
    setSameAsBillTo(!hasCustomShip);
    setShipToName(sale.shipToName || "");
    setShipToAddress(sale.shipToAddress || "");
    setShipToPhone(sale.shipToPhone || "");
    setShipToGst(sale.shipToGst || "");

    try {
      const parsedItems = JSON.parse(sale.itemsJson);
      setItems(Array.isArray(parsedItems) && parsedItems.length > 0 ? parsedItems : [defaultLineItem()]);
    } catch {
      setItems([defaultLineItem()]);
    }

    setDiscountAmount(sale.discountAmount || 0);
    setTaxRatePercent(sale.taxRatePercent ?? 18);
    setPaidAmount(sale.paidAmount || 0);
    setPaymentMethod(sale.paymentMethod || "Bank Transfer");
    setNotes(sale.notes || "");
    setTerms(sale.terms || "");
    setView("form");
  };

  const updateLineItem = (index: number, key: keyof JobworkLineItemData, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index]!, [key]: value };

      if (key === "quantity" || key === "unitPrice") {
        const qty = key === "quantity" ? Number(value) : target.quantity;
        const rate = key === "unitPrice" ? Number(value) : target.unitPrice;
        target.total = Math.round(((qty || 0) * (rate || 0) + Number.EPSILON) * 100) / 100;
      }

      copy[index] = target;
      return copy;
    });
  };

  const addLineItem = () => {
    setItems((prev) => [...prev, defaultLineItem()]);
  };

  const removeLineItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("At least one line item is required");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSale = async (e: React.FormEvent, printMode: "none" | "invoice" | "pad" = "none") => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Please enter customer or company name");
      return;
    }

    if (items.some((it) => !it.partName.trim())) {
      toast.error("Please provide part name or description for all line items");
      return;
    }

    if (items.some((it) => !it.quantity || it.quantity <= 0)) {
      toast.error("Please enter a valid quantity for all line items");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        invoiceNumber: invoiceNumber.trim() || undefined,
        invoiceDate,
        dueDate: dueDate || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerGst: customerGst.trim().toUpperCase() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        placeOfSupply: placeOfSupply.trim() || undefined,
        shipToName: sameAsBillTo ? customerName.trim() : (shipToName.trim() || undefined),
        shipToAddress: sameAsBillTo ? customerAddress.trim() : (shipToAddress.trim() || undefined),
        shipToPhone: sameAsBillTo ? customerPhone.trim() : (shipToPhone.trim() || undefined),
        shipToGst: sameAsBillTo ? customerGst.trim().toUpperCase() : (shipToGst.trim().toUpperCase() || undefined),
        items: items.map((it) => ({
          ...it,
          hsnSac: it.hsnSac?.trim() || "",
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          total: (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
        })),
        subtotal,
        discountAmount: Number(discountAmount) || 0,
        taxRatePercent: Number(taxRatePercent) || 0,
        taxAmount,
        totalAmount: grandTotal,
        paidAmount: Number(paidAmount) || 0,
        balanceAmount,
        paymentStatus: autoPaymentStatus,
        paymentMethod: paymentMethod || undefined,
        jobStatus: "COMPLETED",
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
      };

      let res;
      if (editingSale) {
        res = await fetch(`/api/jobwork-sales/${editingSale.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/jobwork-sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save sale");
      }

      const resData = await res.json();
      toast.success(editingSale ? "Invoice updated successfully" : "Jobwork invoice created successfully!");

      if (printMode === "invoice" && resData.sale) {
        printJobworkInvoice(resData.sale, companySettings || undefined);
      }

      setView("list");
      fetchSales();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete Sale ────────────────────────────────────────────────────────────

  const handleDeleteSale = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobwork-sales/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete invoice");
      toast.success("Invoice deleted");
      setDeleteId(null);
      fetchSales();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render Form View ───────────────────────────────────────────────────────

  const renderForm = () => (
    <div className="space-y-6 pb-16">
      {/* Top bar matching Costing Calculator */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {editingSale ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editing Invoice: {invoiceNumber || editingSale.invoiceNumber}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
              New Invoice: <span className="text-accent font-bold font-mono">{invoiceNumber || "Draft"}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => handleSaveSale(e, "invoice")}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Save & Print
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={(e) => handleSaveSale(e, "none")}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {editingSale ? "Update Invoice" : "Save Invoice"}
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSaveSale(e, "none")} className="space-y-4">
        {/* Invoice & Party Information (Unified fields layout) */}
        <div className="border border-line bg-bg-alt p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">
                Party / Client Name <span className="text-accent">*</span>
              </label>
              <Select
                value={selectedPartyId}
                onChange={(val) => handleSelectParty(val)}
                options={partyOptions}
                placeholder="-- Select Party / Client --"
                isSearchable
                isClearable
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">
                Place of Supply
              </label>
              <input
                type="text"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                className="w-full h-[38px] border border-line bg-bg px-2.5 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">
                  Invoice Number <span className="text-accent">*</span>
                </label>
                {!editingSale && (
                  <button
                    type="button"
                    onClick={() => setInvoiceNumber(computeNextInvoiceNumber(sales, invoiceDate))}
                    className="text-[10px] font-mono text-accent hover:underline cursor-pointer"
                    title="Generate series invoice number"
                  >
                    Auto
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. PF/26-27/001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full h-[38px] border border-line bg-bg px-2.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">
                Invoice Date <span className="text-accent">*</span>
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setInvoiceDate(newDate);
                  if (!editingSale) {
                    setInvoiceNumber(computeNextInvoiceNumber(sales, newDate));
                  }
                }}
                className="w-full h-[38px] border border-line bg-bg px-2.5 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Compact details strip if party selected */}
          {customerName && (
            <div className="pt-2 border-t border-line flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-dim">
              <div>
                <span className="text-ink-dimmer font-mono text-[10px] uppercase">Party: </span>
                <span className="font-semibold text-ink">{customerName}</span>
              </div>
              {customerGst && (
                <div>
                  <span className="text-ink-dimmer font-mono text-[10px] uppercase">GSTIN: </span>
                  <span className="font-mono text-accent">{customerGst}</span>
                </div>
              )}
              {customerPhone && (
                <div>
                  <span className="text-ink-dimmer font-mono text-[10px] uppercase">Phone: </span>
                  <span>{customerPhone}</span>
                </div>
              )}
              {customerAddress && (
                <div className="w-full truncate text-[11px] text-ink-dimmer">
                  <span className="font-mono text-[10px] uppercase">Address: </span>
                  {customerAddress}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products / Job Work Operations (Seamless table with zero field padding) */}
        <div className="border border-line bg-bg-alt p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
              Products / Job Work Operations
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product / Item
            </Button>
          </div>

          <div className="overflow-x-auto border border-line bg-bg">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-bg font-mono text-[10px] uppercase text-ink-dimmer">
                  <th className="py-2 px-2.5 border-r border-line min-w-[240px]">Product / Description *</th>
                  <th className="py-2 px-2.5 border-r border-line w-44">Process</th>
                  <th className="py-2 px-2.5 border-r border-line w-28">HSN / SAC</th>
                  <th className="py-2 px-2.5 border-r border-line w-24 text-right">Qty *</th>
                  <th className="py-2 px-2.5 border-r border-line w-28">Unit</th>
                  <th className="py-2 px-2.5 border-r border-line w-28 text-right">Price (₹) *</th>
                  <th className="py-2 px-2.5 border-r border-line w-32 text-right">Total (₹)</th>
                  <th className="py-2 px-1 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-bg-alt/30">
                    <td className="p-0 border-r border-line">
                      <input
                        type="text"
                        required
                        value={item.partName}
                        onChange={(e) => updateLineItem(idx, "partName", e.target.value)}
                        className="w-full h-9 bg-transparent px-2.5 text-xs text-ink focus:bg-bg-alt focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent border-0 rounded-none"
                      />
                    </td>
                    <td className="p-0 border-r border-line">
                      <Select
                        variant="table"
                        size="sm"
                        value={item.processType}
                        onChange={(val) => updateLineItem(idx, "processType", val)}
                        options={processOptions}
                        isSearchable={false}
                      />
                    </td>
                    <td className="p-0 border-r border-line">
                      <input
                        type="text"
                        value={item.hsnSac || ""}
                        onChange={(e) => updateLineItem(idx, "hsnSac", e.target.value)}
                        className="w-full h-9 bg-transparent px-2.5 font-mono text-xs text-ink focus:bg-bg-alt focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent border-0 rounded-none"
                      />
                    </td>
                    <td className="p-0 border-r border-line">
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateLineItem(
                            idx,
                            "quantity",
                            e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full h-9 bg-transparent px-2.5 text-right font-mono text-xs text-ink focus:bg-bg-alt focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent border-0 rounded-none"
                      />
                    </td>
                    <td className="p-0 border-r border-line">
                      <Select
                        variant="table"
                        size="sm"
                        value={item.unit || "Nos"}
                        onChange={(val) => updateLineItem(idx, "unit", val)}
                        options={unitOptions}
                        isSearchable={false}
                      />
                    </td>
                    <td className="p-0 border-r border-line">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={item.unitPrice || ""}
                        onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full h-9 bg-transparent px-2.5 text-right font-mono text-xs text-ink focus:bg-bg-alt focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent border-0 rounded-none"
                      />
                    </td>
                    <td className="p-0 border-r border-line bg-bg/40">
                      <div className="h-9 px-2.5 flex items-center justify-end font-mono text-xs font-bold text-accent">
                        ₹{item.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-0 text-center">
                      <div className="h-9 w-10 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="text-ink-dim hover:text-red-400 p-1.5 transition-colors"
                          title="Delete item"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-ink-dimmer font-mono">
            {items.length} {items.length === 1 ? "product / operation item" : "product / operation items"}
          </div>
        </div>

        {/* GST Invoice Summary (No payment entries, no duplicate bottom save buttons) */}
        <div className="border border-line bg-bg-alt p-4">
          <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            GST Tax Invoice Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="border border-line bg-bg p-3">
              <span className="text-ink-dimmer block text-[10px] uppercase tracking-wider mb-1">
                Taxable Subtotal
              </span>
              <span className="font-bold text-base text-ink">{formatCurrency(subtotal)}</span>
            </div>

            <div className="border border-line bg-bg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-ink-dimmer text-[10px] uppercase tracking-wider">GST Rate</span>
                <div className="flex gap-1">
                  {GST_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTaxRatePercent(rate)}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors",
                        taxRatePercent === rate
                          ? "bg-accent text-bg border-accent"
                          : "border-line text-ink-dim hover:bg-bg-alt"
                      )}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-base text-ink">{formatCurrency(taxAmount)}</span>
                {taxRatePercent > 0 && (
                  <span className="text-[10px] text-ink-dimmer">
                    ({taxRatePercent / 2}% + {taxRatePercent / 2}%)
                  </span>
                )}
              </div>
            </div>

            <div className="border border-accent/40 bg-accent/5 p-3">
              <span className="text-accent block text-[10px] font-bold uppercase tracking-wider mb-1">
                Grand Total (₹)
              </span>
              <span className="font-mono text-xl font-black text-accent">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  // ─── Render Main View ───────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Jobwork Sales"
        description="Manage job work sales orders, track client billing, and print GST tax invoices."
        action={
          view === "list" ? (
            <Button size="sm" onClick={handleOpenCreateForm}>
              + Add Jobwork Invoice
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setView("list")} className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </Button>
          )
        }
      />

      {view === "list" ? (
        <>
          {isLoading ? (
            <p className="text-sm text-ink-dimmer">Loading…</p>
          ) : sales.length === 0 ? (
        <EmptyState
          title="No jobwork sales invoices yet"
          description="Click '+ Add Jobwork Invoice' above to create your first sales invoice."
        />
      ) : (
        <Table>
          <THead>
            <TH>Invoice #</TH>
            <TH>Date</TH>
            <TH>Customer (Bill To)</TH>
            <TH>Items</TH>
            <TH className="text-right">Total Amount</TH>
            <TH className="text-right">Paid / Balance</TH>
            <TH className="text-center">Payment</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {sales.map((sale) => {
              let itemCount = 1;
              try {
                const parsed = JSON.parse(sale.itemsJson);
                itemCount = Array.isArray(parsed) ? parsed.length : 1;
              } catch {}

              return (
                <TRow key={sale.id}>
                  <TD>
                    <span className="font-mono font-bold text-accent">
                      {sale.invoiceNumber}
                    </span>
                  </TD>
                  <TD className="text-xs text-ink-dim">
                    {formatDate(sale.invoiceDate)}
                  </TD>
                  <TD>
                    <div className="font-medium text-ink">{sale.customerName}</div>
                    <div className="text-xs text-ink-dimmer flex gap-2">
                      {sale.customerPhone && <span>{sale.customerPhone}</span>}
                      {sale.customerGst && (
                        <span className="font-mono text-accent/80">{sale.customerGst}</span>
                      )}
                    </div>
                  </TD>
                  <TD className="text-xs text-ink-dim font-mono">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </TD>
                  <TD className="text-right">
                    <span className="font-mono font-bold text-ink">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </TD>
                  <TD className="text-right">
                    <div className="font-mono font-semibold text-emerald-400">
                      {formatCurrency(sale.paidAmount)}
                    </div>
                    {sale.balanceAmount > 0 ? (
                      <div className="font-mono text-red-400 text-[10px]">
                        Due: {formatCurrency(sale.balanceAmount)}
                      </div>
                    ) : (
                      <div className="font-mono text-emerald-500 text-[10px]">Settled</div>
                    )}
                  </TD>
                  <TD className="text-center">
                    <Badge
                      tone={
                        sale.paymentStatus === "PAID"
                          ? "success"
                          : sale.paymentStatus === "PARTIAL"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {sale.paymentStatus}
                    </Badge>
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => printJobworkInvoice(sale, companySettings || undefined)}
                        className="text-ink-dim hover:text-accent transition-colors"
                        title="Print Tax Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditForm(sale)}
                        className="text-ink-dim hover:text-accent transition-colors"
                        title="Edit Invoice"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setDeleteId(sale.id)}
                        className="text-ink-dim hover:text-red-400 transition-colors"
                        title="Delete Invoice"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </TD>
                </TRow>
              );
            })}
          </tbody>
        </Table>
          )}
        </>
      ) : (
        renderForm()
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Jobwork Sale Record?"
        message="Are you sure you want to delete this jobwork sales invoice? This action cannot be undone."
        confirmText="Delete Invoice"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteSale}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
