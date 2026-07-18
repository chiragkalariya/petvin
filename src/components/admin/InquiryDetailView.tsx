"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateTime } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string } | null;
}

interface InquiryDetail {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  message: string | null;
  fileUrl: string | null;
  fileName: string | null;
  status: string;
  assignedTo: { id: string; name: string } | null;
  notes: Note[];
  createdAt: string;
}

interface EmployeeOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
];

export function InquiryDetailView({ inquiryId }: { inquiryId: string }) {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [status, setStatus] = useState("NEW");
  const [assignedToId, setAssignedToId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  async function loadInquiry() {
    const res = await fetch(`/api/inquiries/${inquiryId}`);
    const data = await res.json();
    if (data.inquiry) {
      setInquiry(data.inquiry);
      setStatus(data.inquiry.status);
      setAssignedToId(data.inquiry.assignedTo?.id ?? "");
    }
  }

  useEffect(() => {
    loadInquiry();
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setEmployees(data.users ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId]);

  async function handleUpdate() {
    setSaving(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedToId: assignedToId || null }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Inquiry updated");
      loadInquiry();
    } catch {
      toast.error("Could not update inquiry");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNoteText("");
      loadInquiry();
    } catch {
      toast.error("Could not add note");
    } finally {
      setAddingNote(false);
    }
  }

  if (!inquiry) {
    return <p className="text-sm text-ink-dimmer">Loading…</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg uppercase text-ink">{inquiry.name}</h2>
              <p className="text-sm text-ink-dim">{inquiry.company || "No company given"}</p>
            </div>
            <StatusBadge status={inquiry.status} />
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase text-ink-dimmer">Phone</dt>
              <dd className="text-ink">{inquiry.phone}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase text-ink-dimmer">Email</dt>
              <dd className="text-ink">{inquiry.email || "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[11px] uppercase text-ink-dimmer">Message</dt>
              <dd className="mt-1 whitespace-pre-wrap text-ink-dim">{inquiry.message || "—"}</dd>
            </div>
            {inquiry.fileUrl && (
              <div className="col-span-2">
                <dt className="font-mono text-[11px] uppercase text-ink-dimmer">Attachment</dt>
                <dd>
                  <a
                    href={inquiry.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {inquiry.fileName || "View file"}
                  </a>
                </dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="font-mono text-[11px] uppercase text-ink-dimmer">Received</dt>
              <dd className="text-ink-dim">{formatDateTime(inquiry.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Internal Notes</h3>
          <div className="mb-4 flex flex-col gap-2">
            <Textarea
              placeholder="Add a note about this inquiry..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button onClick={handleAddNote} isLoading={addingNote} size="sm" className="self-start">
              Add Note
            </Button>
          </div>
          {inquiry.notes.length === 0 ? (
            <p className="text-sm text-ink-dimmer">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {inquiry.notes.map((note) => (
                <li key={note.id} className="border-l-2 border-line-soft pl-4">
                  <p className="text-sm text-ink-dim">{note.content}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink-dimmer">
                    {note.author?.name || "Unknown"} · {formatDateTime(note.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="h-fit p-6">
        <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Manage</h3>
        <div className="flex flex-col gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Assigned To"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            options={[{ value: "", label: "Unassigned" }, ...employees.map((e) => ({ value: e.id, label: e.name }))]}
          />
          <Button onClick={handleUpdate} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
