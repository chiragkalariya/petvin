"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

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
};

export function CompanyVisitForm({
  visitId,
  initialValues,
}: {
  visitId?: string;
  initialValues?: Partial<CompanyVisitFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CompanyVisitFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CompanyVisitFormValues>(key: K, value: CompanyVisitFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = visitId ? `/api/visits/${visitId}` : "/api/visits";
      const method = visitId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Company Name"
          required
          value={values.companyName}
          onChange={(e) => update("companyName", e.target.value)}
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

      <Button type="submit" isLoading={saving} className="self-start">
        {visitId ? "Save Changes" : "Log Visit"}
      </Button>
    </form>
  );
}
