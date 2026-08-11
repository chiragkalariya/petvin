"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TrashIcon } from "@/components/ui/Icons";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InquiryListItem {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  status: string;
  createdAt: string;
  assignedTo: { name: string } | null;
}

const FILTERS = [
  { value: "", label: "All" },
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
];

export function InquiryTable() {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInquiries = useCallback(() => {
    setLoading(true);
    const url = filter ? `/api/inquiries?status=${filter}` : "/api/inquiries";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setInquiries(data.inquiries ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  async function handleDeleteConfirm() {
    if (!deletingInquiryId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/inquiries/${deletingInquiryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Inquiry removed");
      fetchInquiries();
    } catch {
      toast.error("Failed to delete inquiry");
    } finally {
      setIsDeleting(false);
      setDeletingInquiryId(null);
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
      ) : inquiries.length === 0 ? (
        <EmptyState title="No inquiries" description="Submissions from the contact form will show up here." />
      ) : (
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>Company</TH>
            <TH>Phone</TH>
            <TH>Assigned</TH>
            <TH>Status</TH>
            <TH>Received</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {inquiries.map((inq) => (
              <TRow key={inq.id}>
                <TD className="text-ink">
                  <Link href={`/admin/inquiries/${inq.id}`} className="hover:text-accent">
                    {inq.name}
                  </Link>
                </TD>
                <TD>{inq.company || "—"}</TD>
                <TD>{inq.phone}</TD>
                <TD>{inq.assignedTo?.name || "Unassigned"}</TD>
                <TD>
                  <StatusBadge status={inq.status} />
                </TD>
                <TD>{formatDate(inq.createdAt)}</TD>
                <TD className="text-right whitespace-nowrap">
                  <button
                    onClick={() => setDeletingInquiryId(inq.id)}
                    className="text-ink-dim hover:text-red-400 transition-colors"
                    title="Delete Inquiry"
                  >
                    <TrashIcon />
                  </button>
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmModal
        isOpen={!!deletingInquiryId}
        title="Remove Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingInquiryId(null)}
      />
    </div>
  );
}

