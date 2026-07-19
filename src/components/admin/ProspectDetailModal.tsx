"use client";

import { useEffect, useState, useCallback } from "react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProspectCompanyForm } from "@/components/admin/ProspectCompanyForm";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@/components/ui/Icons";

interface VisitLog {
  id: string;
  companyName: string;
  visitDate: string;
  purpose: string | null;
  requirement: string | null;
  notes: string | null;
  status: string;
  followUpDate: string | null;
  contactPerson: string | null;
  employee: { id: string; name: string };
  createdAt: string;
}

interface ProspectDetail {
  id: string;
  companyName: string;
  location: string | null;
  address: string | null;
  industry: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  potentialParts: string | null;
  priority: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  _count: { visits: number };
  visits: VisitLog[];
  createdBy: { id: string; name: string } | null;
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  HIGH: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  MEDIUM: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  LOW: { bg: "bg-steel/10", border: "border-steel/30", text: "text-steel" },
};

const VISIT_STATUS_COLORS: Record<string, string> = {
  INTERESTED: "border-accent bg-accent/10",
  CONVERTED: "border-emerald-500 bg-emerald-500/10",
  ON_HOLD: "border-amber-500 bg-amber-500/10",
  NOT_INTERESTED: "border-red-500 bg-red-500/10",
};

export function ProspectDetailModal({
  prospectId,
  onClose,
  onLogVisit,
  onDeleted,
}: {
  prospectId: string;
  onClose: () => void;
  onLogVisit: (id: string) => void;
  onDeleted?: () => void;
}) {
  const [prospect, setProspect] = useState<ProspectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProspect = useCallback(() => {
    setLoading(true);
    fetch(`/api/prospects/${prospectId}`)
      .then((res) => res.json())
      .then((data) => setProspect(data.prospect ?? null))
      .finally(() => setLoading(false));
  }, [prospectId]);

  useEffect(() => {
    fetchProspect();
  }, [fetchProspect]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to remove this prospect?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Prospect removed");
      onDeleted?.();
      onClose();
    } catch {
      toast.error("Failed to delete prospect");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteVisit(visitId: string) {
    if (!confirm("Are you sure you want to delete this visit log?")) return;
    try {
      const res = await fetch(`/api/visits/${visitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Visit removed");
      fetchProspect(); // Refresh the list of visits
    } catch {
      toast.error("Failed to delete visit");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8">
      <div
        className="relative w-full max-w-3xl border border-line bg-bg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-ink-dimmer hover:text-ink transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="animate-pulse h-6 bg-bg-light rounded w-2/3" />
            <div className="animate-pulse h-4 bg-bg-light rounded w-1/3" />
            <div className="animate-pulse h-32 bg-bg-light rounded" />
          </div>
        ) : !prospect ? (
          <div className="p-8 text-center text-ink-dimmer">Prospect not found</div>
        ) : editing ? (
          <div className="p-6">
            <h2 className="font-display text-xl uppercase text-ink mb-6">Edit Company</h2>
            <ProspectCompanyForm
              prospectId={prospect.id}
              initialValues={{
                companyName: prospect.companyName,
                location: prospect.location ?? "",
                address: prospect.address ?? "",
                industry: prospect.industry ?? "",
                contactPerson: prospect.contactPerson ?? "",
                contactPhone: prospect.contactPhone ?? "",
                contactEmail: prospect.contactEmail ?? "",
                potentialParts: prospect.potentialParts ?? "",
                priority: prospect.priority,
                remarks: prospect.remarks ?? "",
              }}
              onSuccess={() => {
                setEditing(false);
                fetchProspect();
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-line p-6">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                  <h2 className="font-display text-xl uppercase text-ink">{prospect.companyName}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    {prospect.location && (
                      <span className="flex items-center gap-1 text-xs text-ink-dimmer">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {prospect.location}
                      </span>
                    )}
                    {prospect.industry && (
                      <span className="text-xs text-ink-dimmer">• {prospect.industry}</span>
                    )}
                  </div>
                </div>
                {(() => {
                  const ps = PRIORITY_STYLES[prospect.priority] ?? PRIORITY_STYLES.MEDIUM;
                  return (
                    <span className={cn("rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide", ps.bg, ps.border, ps.text)}>
                      {prospect.priority}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Info Grid */}
            <div className="border-b border-line p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Contact */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Contact</p>
                  {prospect.contactPerson && <p className="text-sm text-ink">{prospect.contactPerson}</p>}
                  {prospect.contactPhone && (
                    <p className="text-xs text-ink-dim">
                      📞 {prospect.contactPhone}
                    </p>
                  )}
                  {prospect.contactEmail && (
                    <p className="text-xs text-ink-dim">
                      ✉️ {prospect.contactEmail}
                    </p>
                  )}
                  {!prospect.contactPerson && !prospect.contactPhone && !prospect.contactEmail && (
                    <p className="text-xs text-ink-dimmer italic">No contact info</p>
                  )}
                </div>

                {/* Status + Stats */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Status</p>
                  <StatusBadge status={prospect.status} />
                  <p className="text-xs text-ink-dimmer mt-2">
                    {prospect._count.visits} visit{prospect._count.visits !== 1 ? "s" : ""} logged
                  </p>
                </div>

                {/* Potential Parts */}
                {prospect.potentialParts && (
                  <div className="sm:col-span-2 space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Potential Parts</p>
                    <div className="flex flex-wrap gap-1.5">
                      {prospect.potentialParts.split(",").map((part, i) => (
                        <span key={i} className="inline-block rounded-sm border border-line bg-bg-light px-2.5 py-1 text-xs text-ink-dim">
                          {part.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address */}
                {prospect.address && (
                  <div className="sm:col-span-2 space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Address</p>
                    <p className="text-sm text-ink-dim">{prospect.address}</p>
                  </div>
                )}

                {/* Remarks */}
                {prospect.remarks && (
                  <div className="sm:col-span-2 space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink-dimmer">Remarks</p>
                    <p className="text-sm text-ink-dim">{prospect.remarks}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onLogVisit(prospect.id)}>
                  Log Visit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" isLoading={deleting} onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>

            {/* Visit History Timeline */}
            <div className="p-6">
              <h3 className="font-display text-base uppercase text-ink mb-4">
                Visit History
                <span className="ml-2 font-mono text-sm text-ink-dimmer">({prospect.visits.length})</span>
              </h3>

              {prospect.visits.length === 0 ? (
                <div className="border border-dashed border-line py-8 text-center">
                  <p className="text-sm text-ink-dimmer">No visits logged yet</p>
                  <button
                    onClick={() => onLogVisit(prospect.id)}
                    className="mt-2 text-xs text-accent hover:text-accent-light transition-colors"
                  >
                    Log the first visit →
                  </button>
                </div>
              ) : (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-line" />

                  {prospect.visits.map((visit, idx) => {
                    const statusColor = VISIT_STATUS_COLORS[visit.status] ?? VISIT_STATUS_COLORS.INTERESTED;
                    return (
                      <div key={visit.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Timeline dot */}
                        <div className={cn("relative z-10 mt-1.5 h-[22px] w-[22px] flex-shrink-0 rounded-full border-2 flex items-center justify-center", statusColor)}>
                          <div className={cn("h-2 w-2 rounded-full", visit.status === "CONVERTED" ? "bg-emerald-400" : visit.status === "INTERESTED" ? "bg-accent" : visit.status === "ON_HOLD" ? "bg-amber-400" : "bg-red-400")} />
                        </div>

                        {/* Content */}
                        <div className="group flex-1 border border-line bg-bg-alt p-4 hover:bg-bg-light transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm text-ink">
                                {formatDate(visit.visitDate)}
                              </p>
                              <p className="text-xs text-ink-dimmer">
                                by {visit.employee.name}
                              </p>
                            </div>
                            <StatusBadge status={visit.status} />
                          </div>

                          {visit.purpose && (
                            <p className="text-xs text-ink-dim mb-1">
                              <span className="text-ink-dimmer">Purpose:</span> {visit.purpose}
                            </p>
                          )}
                          {visit.requirement && (
                            <p className="text-xs text-ink-dim mb-1">
                              <span className="text-ink-dimmer">Requirement:</span> {visit.requirement}
                            </p>
                          )}
                          {visit.notes && (
                            <p className="text-xs text-ink-dim mb-1">
                              <span className="text-ink-dimmer">Notes:</span> {visit.notes}
                            </p>
                          )}
                          {visit.followUpDate && (
                            <p className="mt-2 text-[10px] text-accent font-mono uppercase tracking-wide">
                              Follow-up: {formatDate(visit.followUpDate)}
                            </p>
                          )}
                          
                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-3 border-t border-line-soft pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/visits/${visit.id}/edit`}
                              className="text-ink-dim hover:text-accent transition-colors"
                              title="Edit"
                            >
                              <PencilIcon />
                            </Link>
                            <button
                              onClick={() => handleDeleteVisit(visit.id)}
                              className="text-ink-dim hover:text-red-400 transition-colors"
                              title="Delete"
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
          </>
        )}
      </div>
    </div>
  );
}
