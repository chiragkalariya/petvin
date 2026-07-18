"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/Card";
import { formatDate, cn } from "@/lib/utils";

interface VisitListItem {
  id: string;
  companyName: string;
  contactPerson: string | null;
  visitDate: string;
  followUpDate: string | null;
  status: string;
  employee: { name: string };
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
    setLoading(true);
    const url = filter ? `/api/visits?status=${filter}` : "/api/visits";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setVisits(data.visits ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "border px-4 py-2 font-mono text-xs tracking-wide transition-colors",
              filter === f.value ? "border-accent text-accent" : "border-line text-ink-dim hover:border-ink-dim"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-dimmer">Loading…</p>
      ) : visits.length === 0 ? (
        <EmptyState title="No visits logged" description="Add your first company visit to get started." />
      ) : (
        <Table>
          <THead>
            <TH>Company</TH>
            <TH>Contact</TH>
            <TH>Visited By</TH>
            <TH>Visit Date</TH>
            <TH>Follow-up</TH>
            <TH>Status</TH>
          </THead>
          <tbody>
            {visits.map((v) => (
              <TRow key={v.id}>
                <TD className="text-ink">
                  <Link href={`/admin/visits/${v.id}/edit`} className="hover:text-accent">
                    {v.companyName}
                  </Link>
                </TD>
                <TD>{v.contactPerson || "—"}</TD>
                <TD>{v.employee.name}</TD>
                <TD>{formatDate(v.visitDate)}</TD>
                <TD>{v.followUpDate ? formatDate(v.followUpDate) : "—"}</TD>
                <TD>
                  <StatusBadge status={v.status} />
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
