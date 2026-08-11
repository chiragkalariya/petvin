"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState } from "@/components/ui/Card";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TrashIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioItemData {
  id: string;
  name: string;
  material: string | null;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  category: { id: string; name: string; slug: string };
}

export function PortfolioManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Item modal state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemMaterial, setItemMaterial] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  // Delete modal state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/portfolio/categories").then((res) => res.json()),
      fetch("/api/portfolio").then((res) => res.json()),
    ])
      .then(([catData, itemData]) => {
        setCategories(catData.categories ?? []);
        setItems(itemData.items ?? []);
        if (!itemCategoryId && catData.categories?.length) {
          setItemCategoryId(catData.categories[0].id);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!itemCategoryId && categories.length > 0) {
      setItemCategoryId(categories[0].id);
    }
  }, [categories, itemCategoryId]);

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!itemName.trim() || !itemCategoryId) {
      toast.error("Name and category are required");
      return;
    }
    setAddingItem(true);
    try {
      let imageUrl = "";

      if (itemFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", itemFile);
        uploadForm.append("access", "public");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) throw new Error("Photo upload failed");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          material: itemMaterial,
          description: itemDescription,
          categoryId: itemCategoryId,
          imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add item");
      }

      toast.success("Added to Our Work");
      setItemName("");
      setItemMaterial("");
      setItemDescription("");
      setItemFile(null);
      setShowAddItemModal(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleConfirmDeleteItem() {
    if (!deletingItemId) return;
    setIsDeletingItem(true);
    try {
      const res = await fetch(`/api/portfolio/${deletingItemId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Removed");
        loadData();
      } else {
        toast.error("Could not remove item");
      }
    } catch {
      toast.error("Could not remove item");
    } finally {
      setIsDeletingItem(false);
      setDeletingItemId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Our Work"
        description="Manage categories and add finished jobs to the public portfolio."
        action={
          <Button size="sm" onClick={() => setShowAddItemModal(true)}>
            + Add Item
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-dimmer">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Click '+ Add Item' above to show your finished work on the website."
        />
      ) : (
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>Category</TH>
            <TH>Material</TH>
            <TH>Photo</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {items.map((item) => (
              <TRow key={item.id}>
                <TD className="text-ink font-medium">{item.name}</TD>
                <TD>{item.category.name}</TD>
                <TD>{item.material || "—"}</TD>
                <TD>
                  <Badge tone={item.imageUrl ? "success" : "neutral"}>
                    {item.imageUrl ? "Uploaded" : "Placeholder"}
                  </Badge>
                </TD>
                <TD className="text-right whitespace-nowrap">
                  <button
                    onClick={() => setDeletingItemId(item.id)}
                    className="text-ink-dim hover:text-red-400 transition-colors"
                    title="Delete Item"
                  >
                    <TrashIcon />
                  </button>
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div
          onClick={() => setShowAddItemModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg border border-line bg-bg p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8"
          >
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <h3 className="font-display text-base uppercase text-ink tracking-wide">
                Add Portfolio Item
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-ink-dimmer hover:text-ink transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <Input
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Laser Cut Balcony Railing"
                autoFocus
                required
              />
              <Select
                label="Category"
                value={itemCategoryId}
                onChange={(e) => setItemCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Input
                label="Material"
                value={itemMaterial}
                onChange={(e) => setItemMaterial(e.target.value)}
                placeholder="e.g. MS 3mm"
              />
              <Textarea
                label="Description (optional)"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Optional description"
              />
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItemFile(e.target.files?.[0] ?? null)}
                  className="border border-dashed border-line bg-bg-alt px-4 py-3 text-sm text-ink-dim file:mr-3 file:border-0 file:bg-bg-light file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddItemModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={addingItem}>
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingItemId}
        title="Delete Item"
        message="Are you sure you want to delete this portfolio item?"
        isLoading={isDeletingItem}
        onConfirm={handleConfirmDeleteItem}
        onClose={() => setDeletingItemId(null)}
      />
    </div>
  );
}
