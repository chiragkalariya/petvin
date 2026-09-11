"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState } from "@/components/ui/Card";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";
import { slugify } from "@/lib/utils";
import {
  Star,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
  Crop,
} from "lucide-react";
import { ImageCropperModal } from "@/components/ui/ImageCropperModal";
import { autoCropToRatio } from "@/lib/cropImage";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioItemData {
  id: string;
  name: string;
  slug?: string | null;
  material: string | null;
  materials?: string | null;
  industry?: string | null;
  processes?: string | null;
  applicationType?: string | null;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  status?: string | null;
  displayOrder?: number | null;
  createdAt?: string;
  category: { id: string; name: string; slug: string };
}

const PRESET_MATERIALS = [
  "Mild Steel (MS)",
  "Stainless Steel (SS)",
  "Aluminium",
  "GI",
  "CRCA",
  "Galvanized Sheet",
  "MS / SS / Aluminium",
];

export function PortfolioManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Modal State (Add / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItemData | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  // Form Fields
  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemMaterial, setItemMaterial] = useState("Mild Steel (MS)");
  const [itemDescription, setItemDescription] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Image Cropper states
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string>("");
  const [cropperFileName, setCropperFileName] = useState<string>("portfolio-image.jpg");

  // Delete modal state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Photo must be smaller than 15MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Only JPG, JPEG, PNG, and WEBP images are supported");
      return;
    }

    setCropperFileName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCropperRawSrc(dataUrl);

      // Auto-crop to 4:3 ratio without opening the modal
      try {
        const cropped = await autoCropToRatio(dataUrl, 4 / 3, file.name);
        if (cropped) {
          setItemFile(cropped.file);
          setPreviewUrl(cropped.url);
          toast.success("Photo auto-cropped to 4:3 ratio");
        } else {
          setItemFile(file);
        }
      } catch (err) {
        console.error("Auto crop error:", err);
        setItemFile(file);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCropCompleted(croppedFile: File, croppedUrl: string) {
    setItemFile(croppedFile);
    setPreviewUrl(croppedUrl);
    setShowCropperModal(false);
    toast.success("Crop updated");
  }

  function handleReCrop() {
    if (cropperRawSrc) {
      setShowCropperModal(true);
    } else if (previewUrl) {
      setCropperRawSrc(previewUrl);
      setShowCropperModal(true);
    }
  }

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/portfolio/categories?all=true").then((res) => res.json()),
      fetch("/api/portfolio?status=all").then((res) => res.json()),
    ])
      .then(([catData, itemData]) => {
        setCategories(catData.categories ?? []);
        setItems(itemData.items ?? []);
        if (!itemCategoryId && catData.categories?.length) {
          setItemCategoryId(catData.categories[0].id);
        }
      })
      .catch((err) => {
        console.error("Error loading portfolio data:", err);
        toast.error("Failed to load portfolio items");
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

  // Clean up object URL on file change or unmount
  useEffect(() => {
    if (!itemFile) return;
    const objectUrl = URL.createObjectURL(itemFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [itemFile]);

  function openAddModal() {
    setEditingItem(null);
    setItemName("");
    setItemCategoryId(categories[0]?.id || "");
    setItemMaterial("Mild Steel (MS)");
    setItemDescription("");
    setItemFile(null);
    setPreviewUrl("");
    setCropperRawSrc("");
    setShowCropperModal(false);
    setShowModal(true);
  }

  function openEditModal(item: PortfolioItemData) {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategoryId(item.category?.id || categories[0]?.id || "");
    setItemMaterial(item.materials || item.material || "Mild Steel (MS)");
    setItemDescription(item.description || "");
    setItemFile(null);
    setPreviewUrl(item.imageUrl || "");
    setCropperRawSrc(item.imageUrl || "");
    setShowCropperModal(false);
    setShowModal(true);
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault();

    if (!itemName.trim()) {
      toast.error("Item Name is required");
      return;
    }
    if (!itemCategoryId) {
      toast.error("Category is required");
      return;
    }
    if (!itemMaterial.trim()) {
      toast.error("Material is required");
      return;
    }

    if (!editingItem && !itemFile && !previewUrl) {
      toast.error("Photo is required for new portfolio items");
      return;
    }

    setSavingItem(true);
    try {
      let finalImageUrl = editingItem ? editingItem.imageUrl || "" : "";

      if (itemFile) {
        if (itemFile.size > 15 * 1024 * 1024) {
          throw new Error("Photo must be smaller than 15MB");
        }

        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(itemFile.type.toLowerCase())) {
          throw new Error("Only JPG, JPEG, PNG, and WEBP images are supported");
        }

        const uploadForm = new FormData();
        uploadForm.append("file", itemFile);
        uploadForm.append("access", "public");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error ?? "Photo upload failed");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const payload: Record<string, unknown> = {
        name: itemName.trim(),
        categoryId: itemCategoryId,
        materials: itemMaterial.trim(),
        material: itemMaterial.trim(),
        description: itemDescription.trim(),
        imageUrl: finalImageUrl,
      };

      // Preserve existing values for fields removed from modal
      if (!editingItem) {
        payload.industry = "General Engineering";
        payload.processes = "Laser Cutting + CNC Bending";
        payload.applicationType = "Job Work";
        payload.featured = false;
        payload.status = "ACTIVE";
        payload.displayOrder = items.length + 1;
      }

      const url = editingItem
        ? `/api/portfolio/${editingItem.id}`
        : "/api/portfolio";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save portfolio item");
      }

      toast.success(editingItem ? "Portfolio item updated" : "Portfolio item added");
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingItem(false);
    }
  }

  async function handleToggleFeatured(item: PortfolioItemData) {
    try {
      const updatedFeatured = !item.featured;
      const res = await fetch(`/api/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: updatedFeatured }),
      });
      if (res.ok) {
        toast.success(
          updatedFeatured ? "Marked as Featured" : "Removed from Featured"
        );
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, featured: updatedFeatured } : i))
        );
      } else {
        toast.error("Failed to update featured status");
      }
    } catch {
      toast.error("Failed to update featured status");
    }
  }

  async function handleToggleStatus(item: PortfolioItemData) {
    try {
      const newStatus = item.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
      const res = await fetch(`/api/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === "ACTIVE" ? "Item Activated" : "Item Deactivated");
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleConfirmDeleteItem() {
    if (!deletingItemId) return;
    setIsDeletingItem(true);
    try {
      const res = await fetch(`/api/portfolio/${deletingItemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Item removed from portfolio");
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

  // Filtered Items computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (
        selectedCategoryFilter !== "all" &&
        item.category?.slug !== selectedCategoryFilter &&
        item.category?.id !== selectedCategoryFilter
      ) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== "all") {
        const itemStatusVal = item.status || "ACTIVE";
        if (itemStatusVal !== selectedStatusFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category?.name.toLowerCase().includes(q);
        const matchesMaterial =
          item.materials?.toLowerCase().includes(q) ||
          item.material?.toLowerCase().includes(q);

        if (!matchesName && !matchesCategory && !matchesMaterial) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategoryFilter, selectedStatusFilter, searchQuery]);

  const activeCount = useMemo(
    () => items.filter((i) => (i.status || "ACTIVE") === "ACTIVE").length,
    [items]
  );
  const featuredCount = useMemo(
    () => items.filter((i) => i.featured).length,
    [items]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Our Work & Portfolio"
        description="Manage manufacturing job-work items, laser cutting and CNC bending components displayed on the public website."
        action={
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={openAddModal}>
              + Add Portfolio Item
            </Button>
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-bg-card p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
            Total Items
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-white">
            {items.length}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-bg-card p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
            Active Online
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-400">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-bg-card p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
            Featured Items
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-accent">
            {featuredCount}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-bg-card p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
            Categories
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-white">
            {categories.length}
          </p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="rounded-xl border border-line bg-bg-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dimmer" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, material..."
              className="w-full rounded-lg border border-line bg-bg-alt pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-dimmer focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-dim hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-lg border border-line bg-bg-alt px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="rounded-lg border border-line bg-bg-alt px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Active Summary */}
        {(selectedCategoryFilter !== "all" ||
          selectedStatusFilter !== "all" ||
          searchQuery) && (
            <div className="flex items-center gap-2 pt-2 border-t border-line/40 text-xs text-ink-dim">
              <Filter className="h-3.5 w-3.5 text-accent" />
              <span>
                Showing {filteredItems.length} of {items.length} items
              </span>
              <button
                onClick={() => {
                  setSelectedCategoryFilter("all");
                  setSelectedStatusFilter("all");
                  setSearchQuery("");
                }}
                className="ml-auto text-accent underline hover:text-accent-hover text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="rounded-xl border border-line bg-bg-card p-12 text-center text-sm text-ink-dimmer animate-pulse">
          Loading portfolio items...
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No portfolio items found"
          description={
            items.length === 0
              ? "Click '+ Add Portfolio Item' above to showcase manufactured components."
              : "No items match your filter criteria. Try clearing search or filters."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-bg-card">
          <Table>
            <THead>
              <TH className="w-14">Photo</TH>
              <TH>Item Name & Slug</TH>
              <TH>Category</TH>
              <TH>Material</TH>
              <TH className="text-center">Featured</TH>
              <TH className="text-center">Status</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <tbody>
              {filteredItems.map((item) => {
                const isFeatured = item.featured;
                const isActive = (item.status || "ACTIVE") === "ACTIVE";

                return (
                  <TRow key={item.id} className="hover:bg-bg-light/40 transition-colors">
                    {/* Thumbnail Image */}
                    <TD>
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-line bg-bg-alt">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink-dimmer">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </TD>

                    {/* Name & Slug */}
                    <TD className="min-w-[180px]">
                      <div>
                        <span className="font-display font-bold text-white text-sm block">
                          {item.name}
                        </span>
                        <span className="font-mono text-[11px] text-accent/80 block mt-0.5">
                          /our-work/{item.slug || slugify(item.name)}
                        </span>
                      </div>
                    </TD>

                    {/* Category */}
                    <TD>
                      <span className="rounded bg-bg-light/60 px-2 py-0.5 font-mono text-[11px] font-medium text-ink-dim border border-line/40">
                        {item.category?.name}
                      </span>
                    </TD>

                    {/* Material */}
                    <TD>
                      <span className="text-xs text-ink-dim">
                        {item.materials || item.material || "—"}
                      </span>
                    </TD>

                    {/* Featured Toggle */}
                    <TD className="text-center">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded-md transition-colors ${isFeatured
                            ? "text-accent hover:bg-accent/10"
                            : "text-ink-dimmer hover:text-ink hover:bg-bg-light"
                          }`}
                        title={isFeatured ? "Featured (Click to unfeature)" : "Not featured (Click to feature)"}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={isFeatured ? "currentColor" : "none"}
                        />
                      </button>
                    </TD>

                    {/* Status Toggle */}
                    <TD className="text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold transition-colors ${isActive
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                            : "bg-zinc-500/15 text-zinc-400 hover:bg-zinc-500/25 border border-zinc-500/30"
                          }`}
                        title="Click to toggle status"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </TD>

                    {/* Actions */}
                    <TD className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded text-ink-dim hover:text-accent hover:bg-bg-light transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItemId(item.id)}
                          className="p-1.5 rounded text-ink-dim hover:text-red-400 hover:bg-bg-light transition-colors"
                          title="Delete Item"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </TD>
                  </TRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="max-w-2xl"
      >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-display text-lg uppercase font-bold text-white tracking-wide">
                  {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-dimmer hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-5">
              {/* Row 1: Item Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Item Name *"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Control Panel Enclosure"
                    required
                  />
                  {itemName.trim() && (
                    <p className="mt-1.5 font-mono text-[11px] text-accent/80">
                      Slug: /{slugify(itemName)}
                    </p>
                  )}
                </div>

                <Select
                  label="Category *"
                  value={itemCategoryId}
                  onChange={(e) => setItemCategoryId(e.target.value)}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>

              {/* Row 2: Material */}
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer block mb-2">
                  Material *
                </label>
                <div className="space-y-2">
                  <select
                    value={itemMaterial}
                    onChange={(e) => setItemMaterial(e.target.value)}
                    className="w-full bg-bg-alt border border-line text-ink px-3.5 py-2.5 text-sm transition-all focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                  >
                    {PRESET_MATERIALS.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                  {/* <input
                    type="text"
                    value={itemMaterial}
                    onChange={(e) => setItemMaterial(e.target.value)}
                    placeholder="Or specify exact grades (e.g. MS 3mm, SS 304, AL 5052)"
                    className="w-full bg-bg-alt border border-line text-ink px-3.5 py-1.5 text-xs focus:border-accent focus:outline-none placeholder:text-ink-dimmer"
                  /> */}
                </div>
              </div>

              {/* Row 3: Description & Photo Upload with Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Description (Optional)"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Short, professional manufacturing summary (e.g. Precision laser cut and CNC bent enclosure suitable for industrial control automation)."
                />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
                      Photo {editingItem ? "(Leave blank to keep existing)" : "*"}
                    </label>
                    <span className="font-mono text-[10px] text-accent">
                      Fixed 4:3 Ratio (Auto-Crop)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelected}
                    className="border border-dashed border-line bg-bg-alt px-3.5 py-2.5 text-xs text-ink-dim file:mr-3 file:border-0 file:bg-bg-light file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink cursor-pointer focus:outline-none hover:border-accent/50 transition-colors"
                  />
                  {previewUrl && (
                    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-alt p-2.5">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded border border-line bg-black/40">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="text-xs text-ink-dim min-w-0">
                          <p className="font-medium text-white truncate">
                            {itemFile ? itemFile.name : "Current Image"}
                          </p>
                          <p className="text-[11px] text-ink-dimmer">
                            {itemFile
                              ? `${(itemFile.size / 1024).toFixed(0)} KB (Cropped 4:3)`
                              : "Active Card Photo"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleReCrop}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30 transition-colors shrink-0"
                        title="Crop / Adjust image"
                      >
                        <Crop className="h-3.5 w-3.5" />
                        <span>Adjust</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={savingItem}>
                  {editingItem ? "Save Changes" : "Add Portfolio Item"}
                </Button>
              </div>
            </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingItemId}
        title="Delete Portfolio Item"
        message="Are you sure you want to delete this portfolio item? This will remove it from the website."
        isLoading={isDeletingItem}
        onConfirm={handleConfirmDeleteItem}
        onClose={() => setDeletingItemId(null)}
      />

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropperModal}
        imageSrc={cropperRawSrc}
        originalFileName={cropperFileName}
        onCropComplete={handleCropCompleted}
        onClose={() => setShowCropperModal(false)}
        defaultAspect={4 / 3}
      />
    </div>
  );
}
