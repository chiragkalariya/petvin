"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon, PencilIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatCurrency } from "@/lib/utils";

interface MaterialItem {
  id: string;
  name: string;
  ratePerKg: number | null;
  cuttingCostHourly: number | null;
  bendingCostHourly: number | null;
  createdAt: string;
}

export function MaterialManager() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [ratePerKg, setRatePerKg] = useState<string>("");
  const [cuttingCostHourly, setCuttingCostHourly] = useState<string>("");
  const [bendingCostHourly, setBendingCostHourly] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadMaterials() {
    setLoading(true);
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => setMaterials(data.materials ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  function openAddModal() {
    setEditingMaterial(null);
    setMaterialName("");
    setRatePerKg("");
    setCuttingCostHourly("");
    setBendingCostHourly("");
    setShowModal(true);
  }

  function openEditModal(m: MaterialItem) {
    setEditingMaterial(m);
    setMaterialName(m.name);
    setRatePerKg(m.ratePerKg ? String(m.ratePerKg) : "");
    setCuttingCostHourly(m.cuttingCostHourly ? String(m.cuttingCostHourly) : "");
    setBendingCostHourly(m.bendingCostHourly ? String(m.bendingCostHourly) : "");
    setShowModal(true);
  }

  async function handleSaveMaterial(e: FormEvent) {
    e.preventDefault();
    if (!materialName.trim()) {
      toast.error("Material name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingMaterial ? `/api/materials/${editingMaterial.id}` : "/api/materials";
      const method = editingMaterial ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: materialName.trim(),
          ratePerKg: ratePerKg ? parseFloat(ratePerKg) : 0,
          cuttingCostHourly: cuttingCostHourly ? parseFloat(cuttingCostHourly) : 0,
          bendingCostHourly: bendingCostHourly ? parseFloat(bendingCostHourly) : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save material");
      }

      toast.success(editingMaterial ? "Material updated" : "Material saved");
      setShowModal(false);
      loadMaterials();
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
      const res = await fetch(`/api/materials/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Material deleted");
        loadMaterials();
      } else {
        toast.error("Could not delete material");
      }
    } catch {
      toast.error("Could not delete material");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Manage dynamic materials, rates per KG, cutting cost hourly, and bending cost hourly for costing calculations."
        action={
          <Button size="sm" onClick={openAddModal}>
            + Add Material
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-dimmer">Loading…</p>
      ) : materials.length === 0 ? (
        <EmptyState
          title="No materials added yet"
          description="Click '+ Add Material' above to add material types, rates, and process costs."
        />
      ) : (
        <Table>
          <THead>
            <TH>Material Name</TH>
            <TH>Rate (₹/KG)</TH>
            <TH>Cutting Cost (₹/Hr)</TH>
            <TH>Bending Cost (₹/Hr)</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {materials.map((m) => (
              <TRow key={m.id}>
                <TD className="text-ink font-medium">{m.name}</TD>
                <TD>
                  <span className="font-mono text-accent">
                    {m.ratePerKg && m.ratePerKg > 0 ? formatCurrency(m.ratePerKg) : "Not set"}
                  </span>
                </TD>
                <TD>
                  <span className="font-mono text-ink-dim">
                    {m.cuttingCostHourly && m.cuttingCostHourly > 0 ? formatCurrency(m.cuttingCostHourly) : "Not set"}
                  </span>
                </TD>
                <TD>
                  <span className="font-mono text-ink-dim">
                    {m.bendingCostHourly && m.bendingCostHourly > 0 ? formatCurrency(m.bendingCostHourly) : "Not set"}
                  </span>
                </TD>
                <TD className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEditModal(m)}
                      className="text-ink-dim hover:text-accent transition-colors"
                      title="Edit Material"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => setDeletingId(m.id)}
                      className="text-ink-dim hover:text-red-400 transition-colors"
                      title="Delete Material"
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

      {/* Add / Edit Material Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="max-w-md"
      >
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <h3 className="font-display text-base uppercase text-ink tracking-wide">
            {editingMaterial ? "Edit Material" : "Add Material"}
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

        <form onSubmit={handleSaveMaterial} className="flex flex-col gap-4">
          <Input
            label="Material Name / Type *"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            placeholder="e.g. MS 1MM, MS 2MM, SS 304 2MM"
            required
          />
          <Input
            label="Rate per KG (₹) (Optional)"
            type="number"
            step="0.5"
            min="0"
            value={ratePerKg}
            onChange={(e) => setRatePerKg(e.target.value)}
            placeholder="e.g. 85.00 (optional)"
          />
          <Input
            label="Cutting Cost Hourly (₹) (Optional)"
            type="number"
            step="1"
            min="0"
            value={cuttingCostHourly}
            onChange={(e) => setCuttingCostHourly(e.target.value)}
            placeholder="e.g. 1200.00 (optional)"
          />
          <Input
            label="Bending Cost Hourly (₹) (Optional)"
            type="number"
            step="1"
            min="0"
            value={bendingCostHourly}
            onChange={(e) => setBendingCostHourly(e.target.value)}
            placeholder="e.g. 800.00 (optional)"
          />
          <p className="text-[11px] text-ink-dimmer italic">
            * Note: Rates and process cost fields are optional. You can enter or update them at any time.
          </p>
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
              {editingMaterial ? "Update Material" : "Save Material"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Material"
        message="Are you sure you want to delete this material entry?"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
