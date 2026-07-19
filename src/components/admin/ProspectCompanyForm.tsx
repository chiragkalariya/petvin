"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProspectFormValues {
  companyName: string;
  location: string;
  address: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  potentialParts: string;
  priority: string;
  remarks: string;
}

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const INDUSTRY_SUGGESTIONS = [
  "Electrical Panels",
  "Sheet Metal OEM",
  "Packaging Machinery",
  "Industrial Automation",
  "Control Panels",
  "Pharma Machinery",
  "Automation Panels",
  "Automation",
  "HVAC",
  "Steel Fabrication",
];

const EMPTY: ProspectFormValues = {
  companyName: "",
  location: "",
  address: "",
  industry: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  potentialParts: "",
  priority: "MEDIUM",
  remarks: "",
};

export function ProspectCompanyForm({
  prospectId,
  initialValues,
  onSuccess,
  onCancel,
}: {
  prospectId?: string;
  initialValues?: Partial<ProspectFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<ProspectFormValues>({ ...EMPTY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);

  function update<K extends keyof ProspectFormValues>(key: K, value: ProspectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = prospectId ? `/api/prospects/${prospectId}` : "/api/prospects";
      const method = prospectId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }

      toast.success(prospectId ? "Company updated" : "Company added");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Company Name + Priority */}
      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <Input
          label="Company Name"
          required
          value={values.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          placeholder="e.g. Accu Panels Energy Pvt. Ltd."
        />
        <Select
          label="Priority"
          value={values.priority}
          onChange={(e) => update("priority", e.target.value)}
          options={PRIORITY_OPTIONS}
          className="min-w-[130px]"
        />
      </div>

      {/* Location + Industry */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Location"
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="e.g. Kathwada GIDC"
        />
        <div className="relative">
          <Input
            label="Industry"
            value={values.industry}
            onChange={(e) => {
              update("industry", e.target.value);
              setShowIndustrySuggestions(true);
            }}
            onFocus={() => setShowIndustrySuggestions(true)}
            onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 200)}
            placeholder="e.g. Electrical Panels"
          />
          {showIndustrySuggestions && values.industry.length === 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 border border-line bg-bg-alt shadow-xl max-h-48 overflow-y-auto">
              {INDUSTRY_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="block w-full px-3.5 py-2 text-left text-sm text-ink-dim hover:bg-bg-light hover:text-ink transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    update("industry", s);
                    setShowIndustrySuggestions(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <Input
        label="Address"
        value={values.address}
        onChange={(e) => update("address", e.target.value)}
        placeholder="Full company address"
      />

      {/* Contact Details */}
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

      {/* Potential Parts */}
      <Input
        label="Potential Laser-Cut Parts"
        value={values.potentialParts}
        onChange={(e) => update("potentialParts", e.target.value)}
        placeholder="Mounting plates, panel doors, brackets"
      />

      {/* Remarks */}
      <Textarea
        label="Remarks"
        value={values.remarks}
        onChange={(e) => update("remarks", e.target.value)}
        placeholder="Any additional notes about this prospect..."
        className="min-h-[80px]"
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isLoading={saving}>
          {prospectId ? "Save Changes" : "Add Company"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
