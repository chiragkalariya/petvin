"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProspectCompanyTable } from "@/components/admin/ProspectCompanyTable";
import { ProspectCompanyForm } from "@/components/admin/ProspectCompanyForm";
import { ProspectDetailModal } from "@/components/admin/ProspectDetailModal";
import { Button } from "@/components/ui/Button";

export default function CompaniesPage() {
  const router = useRouter();

  // Modals state
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [detailProspectId, setDetailProspectId] = useState<string | null>(null);
  const [editingProspect, setEditingProspect] = useState<any>(null);

  function handleAddSuccess() {
    setShowAddProspect(false);
    setEditingProspect(null);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Prospect Companies"
        description="Manage your prospect companies and track potential leads."
        action={
          <Button size="sm" onClick={() => setShowAddProspect(true)}>
            + Add Company
          </Button>
        }
      />

      <div className="animate-in fade-in duration-300">
        <ProspectCompanyTable
          onAddClick={() => setShowAddProspect(true)}
          onViewClick={(id) => setDetailProspectId(id)}
          onLogVisitClick={(id) => router.push(`/admin/visits/new?prospect=${id}`)}
          onEditClick={(prospect) => setEditingProspect(prospect)}
        />
      </div>

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
