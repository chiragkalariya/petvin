"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { VisitTable } from "@/components/admin/VisitTable";
import { ProspectCompanyTable } from "@/components/admin/ProspectCompanyTable";
import { ProspectCompanyForm } from "@/components/admin/ProspectCompanyForm";
import { ProspectDetailModal } from "@/components/admin/ProspectDetailModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function VisitsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"prospects" | "history">("prospects");

  // Modals state
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [detailProspectId, setDetailProspectId] = useState<string | null>(null);
  const [editingProspect, setEditingProspect] = useState<any>(null); // Added this state

  // When adding or editing a prospect finishes
  function handleAddSuccess() {
    setShowAddProspect(false);
    setEditingProspect(null);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Company Visits"
        description="Manage your prospect companies and track your visit history."
        action={
          <Link href="/admin/visits/new">
            <Button size="sm">+ Log Visit</Button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-8 border-b border-line">
        <button
          onClick={() => setActiveTab("prospects")}
          className={cn(
            "pb-3 font-mono text-sm uppercase tracking-wide transition-colors relative",
            activeTab === "prospects" ? "text-accent" : "text-ink-dim hover:text-ink"
          )}
        >
          Prospect Companies
          {activeTab === "prospects" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "pb-3 font-mono text-sm uppercase tracking-wide transition-colors relative",
            activeTab === "history" ? "text-accent" : "text-ink-dim hover:text-ink"
          )}
        >
          Visit History
          {activeTab === "history" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "prospects" ? (
        <div className="animate-in fade-in duration-300">
          <ProspectCompanyTable
            onAddClick={() => setShowAddProspect(true)}
            onViewClick={(id) => setDetailProspectId(id)}
            onLogVisitClick={(id) => router.push(`/admin/visits/new?prospect=${id}`)}
            onEditClick={(prospect) => setEditingProspect(prospect)}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <VisitTable />
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAddProspect && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8">
          <div
            className="relative w-full max-w-2xl border border-line bg-bg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl uppercase text-ink mb-6">Add Prospect Company</h2>
            <ProspectCompanyForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddProspect(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Prospect Modal */}
      {editingProspect && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8">
          <div
            className="relative w-full max-w-2xl border border-line bg-bg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl uppercase text-ink mb-6">Edit Prospect Company</h2>
            <ProspectCompanyForm
              prospectId={editingProspect.id}
              initialValues={{
                companyName: editingProspect.companyName,
                location: editingProspect.location ?? "",
                address: editingProspect.address ?? "",
                industry: editingProspect.industry ?? "",
                contactPerson: editingProspect.contactPerson ?? "",
                contactPhone: editingProspect.contactPhone ?? "",
                contactEmail: editingProspect.contactEmail ?? "",
                potentialParts: editingProspect.potentialParts ?? "",
                priority: editingProspect.priority,
                remarks: editingProspect.remarks ?? "",
              }}
              onSuccess={handleAddSuccess}
              onCancel={() => setEditingProspect(null)}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailProspectId && (
        <ProspectDetailModal
          prospectId={detailProspectId}
          onClose={() => setDetailProspectId(null)}
          onLogVisit={(id) => router.push(`/admin/visits/new?prospect=${id}`)}
          onDeleted={() => {
            setDetailProspectId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
