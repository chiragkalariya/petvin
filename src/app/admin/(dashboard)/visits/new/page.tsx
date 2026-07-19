import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyVisitForm } from "@/components/admin/CompanyVisitForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NewVisitPage({
  searchParams,
}: {
  searchParams: { prospect?: string };
}) {
  return (
    <div>
      <PageHeader 
        title="Log a Company Visit" 
        description="Fill this in right after visiting a prospect or client." 
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
        <CompanyVisitForm preselectedProspectId={searchParams.prospect} />
      </Card>
    </div>
  );
}
