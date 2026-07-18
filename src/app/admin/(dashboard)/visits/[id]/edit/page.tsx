import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyVisitForm } from "@/components/admin/CompanyVisitForm";
import { Card } from "@/components/ui/Card";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default async function EditVisitPage({ params }: { params: { id: string } }) {
  const visit = await prisma.companyVisit.findUnique({ where: { id: params.id } });

  if (!visit) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/visits" className="mb-4 inline-block text-xs uppercase tracking-wide text-ink-dim hover:text-accent">
        ← Back to Visits
      </Link>
      <PageHeader title={`Edit Visit — ${visit.companyName}`} />
      <Card className="max-w-2xl p-6">
        <CompanyVisitForm
          visitId={visit.id}
          initialValues={{
            companyName: visit.companyName,
            address: visit.address ?? "",
            contactPerson: visit.contactPerson ?? "",
            contactPhone: visit.contactPhone ?? "",
            contactEmail: visit.contactEmail ?? "",
            visitDate: toDateInputValue(visit.visitDate),
            purpose: visit.purpose ?? "",
            requirement: visit.requirement ?? "",
            notes: visit.notes ?? "",
            status: visit.status,
            followUpDate: toDateInputValue(visit.followUpDate),
          }}
        />
      </Card>
    </div>
  );
}
