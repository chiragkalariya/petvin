"use client";

import { useEffect, useState, useCallback } from "react";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
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
  onAddClick: () => void;
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

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this prospect?")) return;
    try {
      const res = await fetch(`/api/prospects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Prospect removed");
      fetchProspects();
    } catch {
      toast.error("Failed to delete prospect");
    }
  }

  return (
    <div className="space-y-6">
      {/* Search + Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
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
        <Button size="sm" onClick={onAddClick}>
          + Add Company
        </Button>
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
                  ? "border-accent bg-accent/10 text-accent"
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
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-ink-dimmer hover:border-ink-dim hover:text-ink-dim"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse border border-line bg-bg-alt p-5">
              <div className="h-4 bg-bg-light rounded w-3/4 mb-3" />
              <div className="h-3 bg-bg-light rounded w-1/2 mb-2" />
              <div className="h-3 bg-bg-light rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : prospects.length === 0 ? (
        <EmptyState
          title="No prospects found"
          description={search || statusFilter || priorityFilter ? "Try adjusting your filters." : "Add your first prospect company to get started."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prospects.map((p) => {
            const pStyle = PRIORITY_STYLES[p.priority] ?? PRIORITY_STYLES.MEDIUM;
            const lastVisit = p.visits[0];

            return (
              <div
                key={p.id}
                className={cn(
                  "group relative border bg-bg-alt transition-all duration-300 hover:bg-bg-light cursor-pointer",
                  "border-line hover:border-ink-dim"
                )}
                onClick={() => onViewClick(p.id)}
              >
                {/* Priority indicator strip */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", pStyle.bg)} />

                <div className="p-5 pl-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base uppercase text-ink group-hover:text-accent transition-colors truncate">
                        {p.companyName}
                      </h3>
                      {p.location && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-dimmer">
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {p.location}
                        </p>
                      )}
                    </div>
                    {/* Priority badge */}
                    <span className={cn("flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide", pStyle.bg, pStyle.border, pStyle.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", pStyle.dot)} />
                      {p.priority}
                    </span>
                  </div>

                  {/* Industry */}
                  {p.industry && (
                    <p className="mb-3 text-xs text-ink-dim">
                      {p.industry}
                    </p>
                  )}

                  {/* Potential Parts Tags */}
                  {p.potentialParts && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {p.potentialParts.split(",").slice(0, 3).map((part, idx) => (
                        <span key={idx} className="inline-block rounded-sm bg-bg-light px-2 py-0.5 text-[10px] text-ink-dim">
                          {part.trim()}
                        </span>
                      ))}
                      {p.potentialParts.split(",").length > 3 && (
                        <span className="inline-block rounded-sm bg-bg-light px-2 py-0.5 text-[10px] text-ink-dimmer">
                          +{p.potentialParts.split(",").length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
                    <div className="flex items-center gap-3">
                      {/* Status */}
                      <span className={cn("font-mono text-[10px] uppercase tracking-wide", STATUS_STYLES[p.status] ?? "text-ink-dimmer")}>
                        {p.status.replace(/_/g, " ")}
                      </span>
                      {/* Visit count */}
                      <span className="flex items-center gap-1 text-[10px] text-ink-dimmer">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {p._count.visits} visit{p._count.visits !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {lastVisit && (
                      <span className="text-[10px] text-ink-dimmer">
                        Last: {formatDate(lastVisit.visitDate)}
                      </span>
                    )}
                  </div>

                  {/* Quick action */}
                  <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogVisitClick(p.id);
                      }}
                      className="flex-1 border border-accent bg-accent/10 px-2 py-1.5 font-mono text-[10px] uppercase tracking-wide text-accent hover:bg-accent/20 transition-colors text-center"
                      title="Log Visit"
                    >
                      Log
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewClick(p.id);
                      }}
                      className="flex-1 flex justify-center items-center border border-line px-2 py-1.5 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors text-center"
                      title="View Details"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(p);
                      }}
                      className="flex-1 flex justify-center items-center border border-line px-2 py-1.5 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors text-center"
                      title="Edit Company"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="flex-1 flex justify-center items-center border border-red-900 px-2 py-1.5 text-red-400 hover:bg-red-950 transition-colors text-center"
                      title="Delete Company"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
