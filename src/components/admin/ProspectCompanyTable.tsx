"use client";

import { useEffect, useState, useCallback } from "react";
import { cn, formatDate } from "@/lib/utils";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";
import { EyeIcon, PencilIcon, TrashIcon } from "@/components/ui/Icons";

interface ProspectListItem {
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
  status: string;
  remarks: string | null;
  createdAt: string;
  _count: { visits: number };
  visits: { visitDate: string; status: string }[];
  createdBy: { id: string; name: string } | null;
}

const STATUS_FILTERS = [
  { value: "TO_VISIT", label: "Visit Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "VISITED", label: "Visited" },
  { value: "CONVERTED", label: "Converted" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "", label: "All Companies" },
];

const PRIORITY_FILTERS = [
  { value: "", label: "All Priority" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const PRIORITY_STYLES: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  HIGH: {
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  MEDIUM: {
    dot: "bg-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  LOW: {
    dot: "bg-steel",
    bg: "bg-steel/10",
    border: "border-steel/30",
    text: "text-steel",
  },
};

const STATUS_STYLES: Record<string, string> = {
  TO_VISIT: "text-accent",
  IN_PROGRESS: "text-amber-400",
  VISITED: "text-steel",
  CONVERTED: "text-emerald-400",
  NOT_INTERESTED: "text-red-400",
};

export function ProspectCompanyTable({
  onAddClick,
  onViewClick,
  onLogVisitClick,
  onEditClick,
}: {
  onAddClick?: () => void;
  onViewClick: (id: string) => void;
  onLogVisitClick: (id: string) => void;
  onEditClick: (prospect: ProspectListItem) => void;
}) {
  const [prospects, setProspects] = useState<ProspectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TO_VISIT");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProspects = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);

    const url = `/api/prospects${params.toString() ? `?${params}` : ""}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setProspects(data.prospects ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter, debouncedSearch]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/prospects/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Prospect removed");
      fetchProspects();
    } catch {
      toast.error("Failed to delete prospect");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dimmer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies, locations, industry..."
          className="pl-10"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-all duration-200",
                statusFilter === f.value
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line text-ink-dimmer hover:border-ink-dim hover:text-ink-dim"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-line self-center hidden sm:block" />
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPriorityFilter(f.value)}
              className={cn(
                "rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-all duration-200",
                priorityFilter === f.value
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-line text-ink-dimmer hover:border-ink-dim hover:text-ink-dim"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Results */}
      {loading ? (
        <div className="border border-line bg-bg-alt p-8 text-center text-sm text-ink-dimmer animate-pulse">
          Loading companies...
        </div>
      ) : prospects.length === 0 ? (
        <EmptyState
          title="No prospects found"
          description={
            search || statusFilter || priorityFilter
              ? "Try adjusting your filters."
              : "Add your first prospect company to get started."
          }
        />
      ) : (
        <Table>
          <THead>
            <TH>Company</TH>
            <TH>Industry</TH>
            <TH>Contact</TH>
            <TH>Priority</TH>
            <TH>Status</TH>
            <TH>Visits</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {prospects.map((p) => {
              const pStyle = PRIORITY_STYLES[p.priority] ?? PRIORITY_STYLES.MEDIUM;
              const lastVisit = p.visits[0];

              return (
                <TRow key={p.id} onClick={() => onViewClick(p.id)}>
                  {/* Company Name & Location */}
                  <TD>
                    <div className="font-display text-sm font-semibold uppercase text-ink hover:text-accent transition-colors">
                      {p.companyName}
                    </div>
                    {p.location && (
                      <p className="mt-0.5 text-xs text-ink-dimmer flex items-center gap-1">
                        <svg
                          className="h-3 w-3 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.location}
                      </p>
                    )}
                  </TD>

                  {/* Industry & Potential Parts */}
                  <TD>
                    <p className="text-xs text-ink font-medium">{p.industry || "—"}</p>
                    {p.potentialParts && (
                      <p className="text-[11px] text-ink-dimmer truncate max-w-[180px]" title={p.potentialParts}>
                        {p.potentialParts}
                      </p>
                    )}
                  </TD>

                  {/* Contact Details */}
                  <TD>
                    {p.contactPerson ? (
                      <div>
                        <p className="text-xs text-ink font-medium">{p.contactPerson}</p>
                        {(p.contactPhone || p.contactEmail) && (
                          <p className="text-[11px] text-ink-dimmer font-mono">
                            {p.contactPhone || p.contactEmail}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-ink-dimmer">—</span>
                    )}
                  </TD>

                  {/* Priority */}
                  <TD>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                        pStyle.bg,
                        pStyle.border,
                        pStyle.text
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", pStyle.dot)} />
                      {p.priority}
                    </span>
                  </TD>

                  {/* Status */}
                  <TD>
                    <span
                      className={cn(
                        "font-mono text-[11px] uppercase tracking-wide font-semibold",
                        STATUS_STYLES[p.status] ?? "text-ink-dimmer"
                      )}
                    >
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </TD>

                  {/* Visit Stats */}
                  <TD>
                    <div className="font-mono text-xs text-ink font-medium">
                      {p._count.visits} visit{p._count.visits !== 1 ? "s" : ""}
                    </div>
                    {lastVisit && (
                      <p className="text-[10px] text-ink-dimmer">
                        Last: {formatDate(lastVisit.visitDate)}
                      </p>
                    )}
                  </TD>

                  {/* Action Buttons */}
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onLogVisitClick(p.id)}
                        className="border border-accent bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-accent hover:bg-accent/20 transition-colors"
                        title="Log Visit"
                      >
                        Log Visit
                      </button>
                      <button
                        onClick={() => onViewClick(p.id)}
                        className="border border-line p-1.5 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors"
                        title="View Details"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => onEditClick(p)}
                        className="border border-line p-1.5 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors"
                        title="Edit Company"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="border border-red-900/60 p-1.5 text-red-400 hover:bg-red-950/60 transition-colors"
                        title="Delete Company"
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

      <ConfirmModal
        isOpen={!!deletingId}
        title="Remove Prospect"
        message="Are you sure you want to remove this prospect company? All associated visit logs will also be removed."
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
