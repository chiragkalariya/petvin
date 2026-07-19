import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyVisitForm } from "@/components/admin/CompanyVisitForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
      <PageHeader 
        title={`Edit Visit — ${visit.companyName}`} 
        action={
          <Link href="/admin/visits">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Visits
            </Button>
          </Link>
        }
      />
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
