"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/Card";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@/components/ui/Icons";

interface VisitListItem {
  id: string;
  companyName: string;
  contactPerson: string | null;
  visitDate: string;
  followUpDate: string | null;
  status: string;
  purpose: string | null;
  employee: { name: string };
  prospect: { id: string; companyName: string; location: string | null; industry: string | null } | null;
}

const FILTERS = [
  { value: "", label: "All" },
  { value: "INTERESTED", label: "Interested" },
  { value: "CONVERTED", label: "Converted" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
];

export function VisitTable() {
  const [visits, setVisits] = useState<VisitListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, [filter]);

  function fetchVisits() {
    setLoading(true);
    const url = filter ? `/api/visits?status=${filter}` : "/api/visits";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setVisits(data.visits ?? []))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this visit?")) return;
    try {
      const res = await fetch(`/api/visits/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Visit removed");
      fetchVisits();
    } catch {
      toast.error("Failed to delete visit");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "border px-4 py-2 font-mono text-xs tracking-wide transition-all duration-200",
              filter === f.value ? "border-accent bg-accent/10 text-accent" : "border-line text-ink-dimmer hover:border-ink-dim hover:text-ink-dim"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse border border-line bg-bg-alt p-4 flex gap-4">
              <div className="h-4 bg-bg-light rounded w-1/4" />
              <div className="h-4 bg-bg-light rounded w-1/6" />
              <div className="h-4 bg-bg-light rounded w-1/6" />
              <div className="h-4 bg-bg-light rounded w-1/5" />
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <EmptyState title="No visits logged" description="Add your first company visit to get started." />
      ) : (
        <Table>
          <THead>
            <TH>Company</TH>
            <TH>Contact</TH>
            <TH>Visited By</TH>
            <TH>Visit Date</TH>
            <TH>Purpose</TH>
            <TH>Follow-up</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {visits.map((v) => (
              <TRow key={v.id} className="hover:bg-bg-light transition-colors">
                <TD className="text-ink">
                  <Link href={`/admin/visits/${v.id}/edit`} className="hover:text-accent transition-colors">
                    {v.companyName}
                  </Link>
                  {v.prospect?.location && (
                    <p className="text-[10px] text-ink-dimmer mt-0.5">{v.prospect.location}</p>
                  )}
                </TD>
                <TD>{v.contactPerson || "—"}</TD>
                <TD>{v.employee.name}</TD>
                <TD>{formatDate(v.visitDate)}</TD>
                <TD>
                  <span className="max-w-[150px] truncate block text-xs">
                    {v.purpose || "—"}
                  </span>
                </TD>
                <TD>
                  {v.followUpDate ? (
                    <span className={cn(
                      "text-xs",
                      new Date(v.followUpDate) < new Date() ? "text-red-400" : "text-ink-dim"
                    )}>
                      {formatDate(v.followUpDate)}
                    </span>
                  ) : "—"}
                </TD>
                <TD>
                  <StatusBadge status={v.status} />
                </TD>
                <TD className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/visits/${v.id}/edit`}
                      className="text-ink-dim hover:text-accent transition-colors"
                      title="Edit"
                    >
                      <PencilIcon />
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-ink-dim hover:text-red-400 transition-colors"
                      title="Delete"
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
    </div>
  );
}
