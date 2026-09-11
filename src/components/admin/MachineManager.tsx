"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState } from "@/components/ui/Card";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon, PencilIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";

interface MachineItem {
  id: string;
  name: string;
  type: "CUTTING" | "BENDING";
  createdAt: string;
}

export function MachineManager() {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<MachineItem | null>(null);
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState<"CUTTING" | "BENDING">("CUTTING");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadMachines() {
    setLoading(true);
    fetch("/api/machines")
      .then((res) => res.json())
      .then((data) => setMachines(data.machines ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMachines();
  }, []);

  function openAddModal() {
    setEditingMachine(null);
    setMachineName("");
    setMachineType("CUTTING");
    setShowModal(true);
  }

  function openEditModal(m: MachineItem) {
    setEditingMachine(m);
    setMachineName(m.name);
    setMachineType(m.type);
    setShowModal(true);
  }

  async function handleSaveMachine(e: FormEvent) {
    e.preventDefault();
    if (!machineName.trim()) {
      toast.error("Machine name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingMachine ? `/api/machines/${editingMachine.id}` : "/api/machines";
      const method = editingMachine ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: machineName.trim(),
          type: machineType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save machine");
      }

      toast.success(editingMachine ? "Machine updated" : "Machine saved");
      setShowModal(false);
      loadMachines();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/machines/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Machine deleted");
        loadMachines();
      } else {
        toast.error("Could not delete machine");
      }
    } catch {
      toast.error("Could not delete machine");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Machines"
        description="Manage laser cutting and bending machines for costing calculations."
        action={
          <Button size="sm" onClick={openAddModal}>
            + Add Machine
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-dimmer">Loading…</p>
      ) : machines.length === 0 ? (
        <EmptyState
          title="No machines added yet"
          description="Click '+ Add Machine' above to add laser cutting or bending machines."
        />
      ) : (
        <Table>
          <THead>
            <TH>Machine Name</TH>
            <TH>Type</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {machines.map((m) => (
              <TRow key={m.id}>
                <TD className="text-ink font-medium">{m.name}</TD>
                <TD>
                  <Badge tone={m.type === "CUTTING" ? "accent" : "success"}>
                    {m.type === "CUTTING" ? "Laser Cutting" : "Bending"}
                  </Badge>
                </TD>
                <TD className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEditModal(m)}
                      className="text-ink-dim hover:text-accent transition-colors"
                      title="Edit Machine"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => setDeletingId(m.id)}
                      className="text-ink-dim hover:text-red-400 transition-colors"
                      title="Delete Machine"
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

      {/* Add / Edit Machine Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="max-w-md"
      >
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <h3 className="font-display text-base uppercase text-ink tracking-wide">
            {editingMachine ? "Edit Machine" : "Add Machine"}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-ink-dimmer hover:text-ink transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSaveMachine} className="flex flex-col gap-4">
          <Input
            label="Machine Name *"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            placeholder="e.g. Fiber Laser 3KW, 160 Ton CNC"
            required
          />
          <Select
            label="Machine Type *"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value as "CUTTING" | "BENDING")}
            options={[
              { value: "CUTTING", label: "Laser Cutting" },
              { value: "BENDING", label: "Bending" },
            ]}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={saving}>
              {editingMachine ? "Update Machine" : "Save Machine"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Machine"
        message="Are you sure you want to delete this machine entry?"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
