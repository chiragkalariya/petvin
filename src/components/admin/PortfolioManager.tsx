"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, Badge, EmptyState } from "@/components/ui/Card";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { TrashIcon } from "@/components/ui/Icons";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { items: number };
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

  const [categoryName, setCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [itemName, setItemName] = useState("");
  const [itemMaterial, setItemMaterial] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  function load() {
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

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    const res = await fetch(`/api/portfolio/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category deleted");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not delete category");
    }
  }

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
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(id: string) {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Removed");
      load();
    } else {
      toast.error("Could not remove item");
    }
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Categories</h3>
          {categories.length === 0 ? (
            <EmptyState title="No categories yet" description="Add your first category on the right." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-ink">{cat.name}</span>
                    <Badge>{cat._count.items} items</Badge>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
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

        <Card className="h-fit p-6">
          <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Add Category</h3>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
            <Input
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Railings"
            />
            <Button type="submit" isLoading={addingCategory}>
              Add Category
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Portfolio Items</h3>
          {loading ? (
            <p className="text-sm text-ink-dimmer">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState title="No items yet" description="Add a finished job on the right to show it on the site." />
          ) : (
            <Table>
              <THead>
                <TH>Name</TH>
                <TH>Category</TH>
                <TH>Material</TH>
                <TH>Photo</TH>
                <TH></TH>
              </THead>
              <tbody>
                {items.map((item) => (
                  <TRow key={item.id}>
                    <TD className="text-ink">{item.name}</TD>
                    <TD>{item.category.name}</TD>
                    <TD>{item.material || "—"}</TD>
                    <TD>
                      <Badge tone={item.imageUrl ? "success" : "neutral"}>
                        {item.imageUrl ? "Uploaded" : "Placeholder"}
                      </Badge>
                    </TD>
                    <TD>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
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
        </div>

        <Card className="h-fit p-6">
          <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Add to Our Work</h3>
          <form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <Input label="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
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
            />
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setItemFile(e.target.files?.[0] ?? null)}
                className="border border-dashed border-line bg-bg-alt px-4 py-3.5 text-sm text-ink-dim file:mr-3 file:border-0 file:bg-bg-light file:px-3 file:py-1.5 file:text-ink"
              />
            </div>
            <Button type="submit" isLoading={addingItem}>
              Add Item
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
