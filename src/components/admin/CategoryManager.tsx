"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, Badge, EmptyState } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TrashIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { items: number };
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Delete modal state
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  function loadCategories() {
    setLoading(true);
    fetch("/api/portfolio/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/portfolio/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add category");
      }
      toast.success("Category added");
      setCategoryName("");
      setShowAddCategoryModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!deletingCategoryId) return;
    setIsDeletingCategory(true);
    try {
      const res = await fetch(`/api/portfolio/categories/${deletingCategoryId}`, { method: "DELETE" });
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
    <div>
      <PageHeader
        title="Categories"
        description="Manage portfolio categories for grouping finished jobs."
        action={
          <Button size="sm" onClick={() => setShowAddCategoryModal(true)}>
            + Add Category
          </Button>
        }
      />

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-ink-dimmer">Loading…</p>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Click '+ Add Category' above to create your first portfolio category."
          />
        ) : (
          <ul className="divide-y divide-line-soft">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink font-medium">{cat.name}</span>
                  <Badge>{cat._count.items} items</Badge>
                </div>
                <button
                  onClick={() => setDeletingCategoryId(cat.id)}
                  className="text-ink-dim hover:text-red-400 transition-colors"
                  title="Delete Category"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div
          onClick={() => setShowAddCategoryModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-line bg-bg p-6 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <h3 className="font-display text-base uppercase text-ink tracking-wide">
                Add Category
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-ink-dimmer hover:text-ink transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <Input
                label="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Railings"
                autoFocus
                required
              />
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCategoryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={addingCategory}>
                  Add Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCategoryId}
        title="Delete Category"
        message="Are you sure you want to delete this portfolio category?"
        isLoading={isDeletingCategory}
        onConfirm={handleConfirmDeleteCategory}
        onClose={() => setDeletingCategoryId(null)}
      />
    </div>
  );
}
