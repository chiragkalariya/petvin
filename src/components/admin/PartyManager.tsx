"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PencilIcon, TrashIcon } from "@/components/ui/Icons";

export interface PartyRecord {
  id: string;
  name?: string | null;
  companyName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  stateCode?: string | null;
  pincode?: string | null;
  gstin?: string | null;
  pan?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function PartyManager() {
  const [parties, setParties] = useState<PartyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "form">("list");
  const [editingParty, setEditingParty] = useState<PartyRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Gujarat");
  const [stateCode, setStateCode] = useState("24");
  const [pincode, setPincode] = useState("");

  const fetchParties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/parties");
      if (!res.ok) throw new Error("Failed to load parties");
      const data = await res.json();
      setParties(data.parties || []);
    } catch {
      toast.error("Could not load parties list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleOpenCreate = () => {
    setEditingParty(null);
    setCompanyName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setGstin("");
    setPan("");
    setAddress("");
    setCity("");
    setState("Gujarat");
    setStateCode("24");
    setPincode("");
    setView("form");
  };

  const handleOpenEdit = (party: PartyRecord) => {
    setEditingParty(party);
    setCompanyName(party.companyName || "");
    setContactName(party.name || "");
    setPhone(party.phone || "");
    setEmail(party.email || "");
    setGstin(party.gstin || "");
    setPan(party.pan || "");
    setAddress(party.address || "");
    setCity(party.city || "");
    setState(party.state || "Gujarat");
    setStateCode(party.stateCode || "24");
    setPincode(party.pincode || "");
    setView("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyName: companyName.trim(),
        name: contactName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        gstin: gstin.trim().toUpperCase() || null,
        pan: pan.trim().toUpperCase() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || "Gujarat",
        stateCode: stateCode.trim() || "24",
        pincode: pincode.trim() || null,
      };

      const url = editingParty ? `/api/parties/${editingParty.id}` : "/api/parties";
      const method = editingParty ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save party");
      }

      toast.success(editingParty ? "Party updated successfully" : "Party created successfully");
      await fetchParties();
      setView("list");
      setEditingParty(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save party");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/parties/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete party");
      toast.success("Party deleted");
      await fetchParties();
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || "Could not delete party");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredParties = useMemo(() => {
    if (!search.trim()) return parties;
    const q = search.toLowerCase();
    return parties.filter((p) => {
      return (
        p.companyName.toLowerCase().includes(q) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.gstin && p.gstin.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    });
  }, [parties, search]);

  const renderForm = () => (
    <div className="space-y-6 pb-16">
      {/* Top bar matching Costing Calculator */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {editingParty ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editing Party: {editingParty.companyName}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
              New Party Draft
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setView("list")}
            className="gap-1.5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {editingParty ? "Update Party" : "Save Party"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-line bg-bg-alt p-6 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
            Company & Contact Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                Company / Firm Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bhadja Industries Pvt. Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Patel"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +91 92657 54704"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                Email Address
              </label>
              <input
                type="email"
                placeholder="accounts@bhadja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                GSTIN Number
              </label>
              <input
                type="text"
                placeholder="e.g. 24ANDPB2487J1Z4"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 font-mono text-sm uppercase text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                PAN Number
              </label>
              <input
                type="text"
                placeholder="e.g. ANDPB2487J"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 font-mono text-sm uppercase text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmedabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                State & Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="flex-1 border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Code"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-16 border border-line bg-bg px-2.5 py-2 font-mono text-sm text-center text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                Full Billing / Delivery Address
              </label>
              <input
                type="text"
                placeholder="e.g. 21, Satellite Industrial Estate, Kathwada Singarva Road, Ahmedabad 382430"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                Pincode
              </label>
              <input
                type="text"
                placeholder="382430"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2 font-mono text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Parties & Clients"
        description="Manage customer profiles, billing addresses, and GST details."
        action={
          view === "list" ? (
            <Button size="sm" onClick={handleOpenCreate}>
              + Add Party
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
          {/* Search bar */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dimmer" />
              <input
                type="text"
                placeholder="Search party by name, phone, or GST..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-line bg-bg-alt py-2 pl-9 pr-3 text-xs text-ink placeholder:text-ink-dimmer focus:border-accent focus:outline-none"
              />
            </div>
            <span className="font-mono text-xs text-ink-dimmer">
              {filteredParties.length} {filteredParties.length === 1 ? "party" : "parties"}
            </span>
          </div>

          {isLoading ? (
            <p className="text-sm text-ink-dimmer">Loading parties…</p>
          ) : filteredParties.length === 0 ? (
            <EmptyState
              title="No parties found"
              description="Click '+ Add Party' above to add your first customer or client."
            />
          ) : (
            <Table>
              <THead>
                <TH>Company / Firm Name</TH>
                <TH>Contact Person</TH>
                <TH>Phone & Email</TH>
                <TH>GSTIN / PAN</TH>
                <TH>City / State</TH>
                <TH className="text-right">Actions</TH>
              </THead>
              <tbody>
                {filteredParties.map((party) => (
                  <TRow key={party.id}>
                    <TD>
                      <div className="font-medium text-ink">{party.companyName}</div>
                      {party.address && (
                        <div className="text-[11px] text-ink-dimmer truncate max-w-[280px]" title={party.address}>
                          {party.address}
                        </div>
                      )}
                    </TD>
                    <TD className="text-xs text-ink-dim">
                      {party.name || "--"}
                    </TD>
                    <TD className="text-xs text-ink-dim">
                      <div>{party.phone || "--"}</div>
                      {party.email && <div className="text-ink-dimmer text-[11px]">{party.email}</div>}
                    </TD>
                    <TD className="font-mono text-xs">
                      {party.gstin ? (
                        <div className="text-accent">{party.gstin}</div>
                      ) : (
                        <span className="text-ink-dimmer">--</span>
                      )}
                      {party.pan && <div className="text-[10px] text-ink-dimmer">{party.pan}</div>}
                    </TD>
                    <TD className="text-xs text-ink-dim">
                      {party.city ? `${party.city}, ${party.state || ""}` : party.state || "--"}
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenEdit(party)}
                          className="text-ink-dim hover:text-accent transition-colors"
                          title="Edit Party"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => setDeleteId(party.id)}
                          className="text-ink-dim hover:text-red-400 transition-colors"
                          title="Delete Party"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </TD>
                  </TRow>
                ))}
              </tbody>
            </Table>
          )}
        </>
      ) : (
        renderForm()
      )}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Party Record?"
        message="Are you sure you want to delete this party? This action cannot be undone."
        confirmText="Delete Party"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
