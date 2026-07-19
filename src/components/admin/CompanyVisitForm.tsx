"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface CompanyVisitFormValues {
  companyName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  visitDate: string;
  purpose: string;
  requirement: string;
  notes: string;
  status: string;
  followUpDate: string;
  prospectId: string;
}

interface ProspectOption {
  id: string;
  companyName: string;
  location: string | null;
  industry: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  potentialParts: string | null;
  priority: string;
}

const STATUS_OPTIONS = [
  { value: "INTERESTED", label: "Interested" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "CONVERTED", label: "Converted" },
  { value: "ON_HOLD", label: "On Hold" },
];

const EMPTY_VALUES: CompanyVisitFormValues = {
  companyName: "",
  address: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  visitDate: new Date().toISOString().slice(0, 10),
  purpose: "",
  requirement: "",
  notes: "",
  status: "INTERESTED",
  followUpDate: "",
  prospectId: "",
};

// Inline new company fields
interface InlineCompanyValues {
  location: string;
  industry: string;
  potentialParts: string;
  priority: string;
}

const EMPTY_INLINE: InlineCompanyValues = {
  location: "",
  industry: "",
  potentialParts: "",
  priority: "MEDIUM",
};

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export function CompanyVisitForm({
  visitId,
  initialValues,
  preselectedProspectId,
}: {
  visitId?: string;
  initialValues?: Partial<CompanyVisitFormValues>;
  preselectedProspectId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CompanyVisitFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    prospectId: preselectedProspectId ?? initialValues?.prospectId ?? "",
  });
  const [saving, setSaving] = useState(false);

  // Company selector state
  const [prospects, setProspects] = useState<ProspectOption[]>([]);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectOption | null>(null);
  const [mode, setMode] = useState<"select" | "new">("select");
  const [inlineCompany, setInlineCompany] = useState<InlineCompanyValues>(EMPTY_INLINE);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch prospects for selector
  useEffect(() => {
    setLoadingProspects(true);
    fetch("/api/prospects")
      .then((res) => res.json())
      .then((data) => {
        setProspects(data.prospects ?? []);
        // If preselected, find and set
        if (preselectedProspectId && data.prospects) {
          const found = data.prospects.find((p: ProspectOption) => p.id === preselectedProspectId);
          if (found) {
            setSelectedProspect(found);
            setCompanySearch(found.companyName);
            // Auto-fill
            setValues((prev) => ({
              ...prev,
              companyName: found.companyName,
              address: found.address ?? prev.address,
              contactPerson: found.contactPerson ?? prev.contactPerson,
              contactPhone: found.contactPhone ?? prev.contactPhone,
              contactEmail: found.contactEmail ?? prev.contactEmail,
              prospectId: found.id,
            }));
          }
        }
      })
      .finally(() => setLoadingProspects(false));
  }, [preselectedProspectId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredProspects = prospects.filter((p) =>
    p.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(companySearch.toLowerCase())) ||
    (p.industry && p.industry.toLowerCase().includes(companySearch.toLowerCase()))
  );

  function selectProspect(p: ProspectOption) {
    setSelectedProspect(p);
    setCompanySearch(p.companyName);
    setShowDropdown(false);
    setMode("select");
    setValues((prev) => ({
      ...prev,
      companyName: p.companyName,
      address: p.address ?? "",
      contactPerson: p.contactPerson ?? "",
      contactPhone: p.contactPhone ?? "",
      contactEmail: p.contactEmail ?? "",
      prospectId: p.id,
    }));
  }

  function switchToNewCompany() {
    setSelectedProspect(null);
    setMode("new");
    setShowDropdown(false);
    setValues((prev) => ({
      ...prev,
      companyName: companySearch,
      prospectId: "",
    }));
  }

  function update<K extends keyof CompanyVisitFormValues>(key: K, value: CompanyVisitFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = visitId ? `/api/visits/${visitId}` : "/api/visits";
      const method = visitId ? "PATCH" : "POST";

      const payload: Record<string, unknown> = { ...values };

      // If new company mode, include inline prospect data
      if (mode === "new" && !visitId && !values.prospectId) {
        payload.newProspect = {
          companyName: values.companyName,
          location: inlineCompany.location,
          address: values.address,
          industry: inlineCompany.industry,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          contactEmail: values.contactEmail,
          potentialParts: inlineCompany.potentialParts,
          priority: inlineCompany.priority,
          remarks: "",
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save visit");
      }

      toast.success(visitId ? "Visit updated" : "Visit logged");
      router.push("/admin/visits");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const PRIORITY_DOTS: Record<string, string> = {
    HIGH: "bg-red-400",
    MEDIUM: "bg-amber-400",
    LOW: "bg-steel",
  };

  const isEditing = !!visitId;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Step 1: Company Selection */}
      {!isEditing && (
        <div className="border border-line bg-bg-alt p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-bg text-[10px] font-bold">1</span>
            Select or Add Company
          </p>

          <div ref={dropdownRef} className="relative">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dimmer"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setShowDropdown(true);
                  if (selectedProspect) {
                    setSelectedProspect(null);
                    setValues((prev) => ({ ...prev, prospectId: "" }));
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search existing companies or type a new name..."
                className="w-full bg-bg border border-line text-ink pl-10 pr-4 py-3 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-ink-dimmer"
              />
              {selectedProspect && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-sm bg-accent/10 border border-accent/30 px-2 py-0.5 text-[10px] font-mono text-accent uppercase tracking-wide">
                  ✓ Linked
                </span>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-30 top-full left-0 right-0 mt-1 border border-line bg-bg shadow-2xl max-h-64 overflow-y-auto">
                {loadingProspects ? (
                  <p className="px-4 py-3 text-xs text-ink-dimmer">Loading companies...</p>
                ) : (
                  <>
                    {filteredProspects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-bg-light transition-colors border-b border-line-soft last:border-none",
                          selectedProspect?.id === p.id && "bg-accent/5"
                        )}
                        onClick={() => selectProspect(p)}
                      >
                        <span className={cn("h-2 w-2 rounded-full flex-shrink-0", PRIORITY_DOTS[p.priority] ?? "bg-ink-dimmer")} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-ink truncate">{p.companyName}</p>
                          <p className="text-[11px] text-ink-dimmer truncate">
                            {[p.location, p.industry].filter(Boolean).join(" • ") || "No details"}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-dimmer">
                          {p.priority}
                        </span>
                      </button>
                    ))}

                    {/* Add New Option */}
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/5 transition-colors border-t border-line"
                      onClick={switchToNewCompany}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-accent text-accent text-xs">+</span>
                      <div>
                        <p className="text-sm text-accent">
                          Add New Company{companySearch ? `: "${companySearch}"` : ""}
                        </p>
                        <p className="text-[11px] text-ink-dimmer">Create a new prospect and log a visit</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Selected prospect info chip */}
          {selectedProspect && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-dim">
              <span className="text-ink-dimmer">Auto-filled from:</span>
              <span className="border border-line rounded-sm px-2 py-0.5 bg-bg-light">{selectedProspect.companyName}</span>
              {selectedProspect.location && <span className="border border-line rounded-sm px-2 py-0.5 bg-bg-light">{selectedProspect.location}</span>}
              {selectedProspect.industry && <span className="border border-line rounded-sm px-2 py-0.5 bg-bg-light">{selectedProspect.industry}</span>}
              <button
                type="button"
                onClick={() => {
                  setSelectedProspect(null);
                  setCompanySearch("");
                  setValues((prev) => ({
                    ...prev,
                    companyName: "",
                    address: "",
                    contactPerson: "",
                    contactPhone: "",
                    contactEmail: "",
                    prospectId: "",
                  }));
                }}
                className="text-accent hover:text-accent-light transition-colors ml-1"
              >
                × Clear
              </button>
            </div>
          )}

          {/* Inline new company fields */}
          {mode === "new" && !selectedProspect && (
            <div className="mt-4 border-t border-line-soft pt-4 space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">New Company Details</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Location"
                  value={inlineCompany.location}
                  onChange={(e) => setInlineCompany((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Kathwada GIDC"
                />
                <Input
                  label="Industry"
                  value={inlineCompany.industry}
                  onChange={(e) => setInlineCompany((prev) => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g. Electrical Panels"
                />
                <Select
                  label="Priority"
                  value={inlineCompany.priority}
                  onChange={(e) => setInlineCompany((prev) => ({ ...prev, priority: e.target.value }))}
                  options={PRIORITY_OPTIONS}
                />
              </div>
              <Input
                label="Potential Laser-Cut Parts"
                value={inlineCompany.potentialParts}
                onChange={(e) => setInlineCompany((prev) => ({ ...prev, potentialParts: e.target.value }))}
                placeholder="Mounting plates, panel doors, brackets"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Visit Details */}
      <div className={cn(!isEditing && "border border-line bg-bg-alt p-5")}>
        {!isEditing && (
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-bg text-[10px] font-bold">2</span>
            Visit Details
          </p>
        )}

        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Company Name"
              required
              value={values.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              disabled={!!selectedProspect}
            />
            <Input
              label="Visit Date"
              type="date"
              required
              value={values.visitDate}
              onChange={(e) => update("visitDate", e.target.value)}
            />
          </div>

          <Input label="Address" value={values.address} onChange={(e) => update("address", e.target.value)} />

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Contact Person"
              value={values.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={values.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              value={values.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </div>

          <Input
            label="Purpose of Visit"
            value={values.purpose}
            onChange={(e) => update("purpose", e.target.value)}
            placeholder="e.g. Introduce services, follow up on quote..."
          />

          <Textarea
            label="Requirement Details"
            value={values.requirement}
            onChange={(e) => update("requirement", e.target.value)}
            placeholder="What do they need cut/bent? Expected volume?"
          />

          <Textarea
            label="Visit Notes"
            value={values.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Discussion notes, objections, next steps..."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Status"
              value={values.status}
              onChange={(e) => update("status", e.target.value)}
              options={STATUS_OPTIONS}
            />
            <Input
              label="Follow-up Date"
              type="date"
              value={values.followUpDate}
              onChange={(e) => update("followUpDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" isLoading={saving} className="self-start">
        {visitId ? "Save Changes" : "Log Visit"}
      </Button>
    </form>
  );
}
