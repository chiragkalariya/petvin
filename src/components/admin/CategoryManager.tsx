"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, Badge, EmptyState } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TrashIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";
import { CheckCircle2, XCircle, Edit2, Layers, AlertTriangle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  status?: string | null;
  _count: { items: number };
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryStatus, setCategoryStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [savingCategory, setSavingCategory] = useState(false);

  // Disable Warning Modal
  const [confirmDisableCat, setConfirmDisableCat] = useState<Category | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);

  // Delete modal state
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  function loadCategories() {
    setLoading(true);
    fetch("/api/portfolio/categories?all=true")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch((err) => {
        console.error("Error loading categories:", err);
        toast.error("Failed to load categories");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openAddModal() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryStatus("ACTIVE");
    setShowModal(true);
  }

  function openEditModal(cat: Category) {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryStatus((cat.status as "ACTIVE" | "INACTIVE") || "ACTIVE");
    setShowModal(true);
  }

  async function handleSaveCategory(e: FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSavingCategory(true);
    try {
      const url = editingCategory
        ? `/api/portfolio/categories/${editingCategory.id}`
        : "/api/portfolio/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName.trim(),
          status: categoryStatus,
          activateItems: categoryStatus === "ACTIVE",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save category");
      }

      toast.success(editingCategory ? "Category updated" : "Category added");
      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingCategory(false);
    }
  }

  async function toggleCategoryStatus(cat: Category) {
    const isCurrentlyActive = (cat.status || "ACTIVE") === "ACTIVE";

    // If active, prompt confirmation before disabling since it cascades to all items
    if (isCurrentlyActive) {
      setConfirmDisableCat(cat);
      return;
    }

    // If activating, activate immediately
    try {
      const res = await fetch(`/api/portfolio/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE", activateItems: true }),
      });
      if (res.ok) {
        toast.success("Category and its items activated on the website");
        loadCategories();
      } else {
        toast.error("Failed to activate category");
      }
    } catch {
      toast.error("Failed to activate category");
    }
  }

  async function handleConfirmDisableCategory() {
    if (!confirmDisableCat) return;
    setIsDisabling(true);
    try {
      const res = await fetch(`/api/portfolio/categories/${confirmDisableCat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INACTIVE" }),
      });
      if (res.ok) {
        toast.success(
          "Category and all its items have been disabled from the website"
        );
        loadCategories();
      } else {
        toast.error("Failed to disable category");
      }
    } catch {
      toast.error("Failed to disable category");
    } finally {
      setIsDisabling(false);
      setConfirmDisableCat(null);
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!deletingCategoryId) return;
    setIsDeletingCategory(true);
    try {
      const res = await fetch(`/api/portfolio/categories/${deletingCategoryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Category deleted");
        loadCategories();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Could not delete category");
      }
    } catch {
      toast.error("Could not delete category");
    } finally {
      setIsDeletingCategory(false);
      setDeletingCategoryId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio Categories"
        description="Manage categories for grouping manufacturing work. Disabling a category automatically hides all its items from the public website."
        action={
          <Button size="sm" onClick={openAddModal}>
            + Add Category
          </Button>
        }
      />

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-ink-dimmer">Loading categories…</p>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Click '+ Add Category' above to create your first portfolio category."
          />
        ) : (
          <ul className="divide-y divide-line-soft">
            {categories.map((cat) => {
              const isActive = (cat.status || "ACTIVE") === "ACTIVE";

              return (
                <li
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3 hover:bg-bg-light/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-alt text-ink-dim">
                      <Layers className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-bold">
                          {cat.name}
                        </span>
                        <span className="font-mono text-[11px] text-ink-dimmer">
                          ({cat.slug})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge tone={isActive ? "success" : "neutral"}>
                          {cat._count.items} active online items
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Status Toggle Button */}
                    <button
                      onClick={() => toggleCategoryStatus(cat)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                          : "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30 border border-zinc-500/30"
                      }`}
                      title={
                        isActive
                          ? "Category is Active online (Click to disable)"
                          : "Category is Disabled (Click to activate)"
                      }
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded text-ink-dim hover:text-accent hover:bg-bg-light transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeletingCategoryId(cat.id)}
                      className="p-1.5 rounded text-ink-dim hover:text-red-400 hover:bg-bg-light transition-colors"
                      title="Delete Category"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-line bg-bg p-6 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <h3 className="font-display text-base uppercase text-ink tracking-wide font-bold">
                {editingCategory ? "Edit Category" : "Add Category"}
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

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <Input
                label="Category Name *"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Electrical & Electronics"
                autoFocus
                required
              />

              <Select
                label="Status"
                value={categoryStatus}
                onChange={(e) =>
                  setCategoryStatus(e.target.value as "ACTIVE" | "INACTIVE")
                }
                options={[
                  { value: "ACTIVE", label: "Active (Visible on Website)" },
                  {
                    value: "INACTIVE",
                    label: "Disabled (Hides category & all its items)",
                  },
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
                <Button type="submit" size="sm" isLoading={savingCategory}>
                  {editingCategory ? "Save Changes" : "Add Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable Category Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDisableCat}
        title="Disable Category & All Items"
        message={`Are you sure you want to disable "${confirmDisableCat?.name}"? This will automatically hide this category and all its ${confirmDisableCat?._count.items ?? 0} portfolio items from the public website.`}
        confirmText="Disable"
        icon={<XCircle className="h-5 w-5 text-red-400" />}
        isLoading={isDisabling}
        onConfirm={handleConfirmDisableCategory}
        onClose={() => setConfirmDisableCat(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCategoryId}
        title="Delete Category"
        message="Are you sure you want to delete this portfolio category? (Only empty categories can be deleted)."
        isLoading={isDeletingCategory}
        onConfirm={handleConfirmDeleteCategory}
        onClose={() => setDeletingCategoryId(null)}
      />
    </div>
  );
}
