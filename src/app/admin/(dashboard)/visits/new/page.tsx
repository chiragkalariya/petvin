import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyVisitForm } from "@/components/admin/CompanyVisitForm";
import { Card } from "@/components/ui/Card";

export default function NewVisitPage() {
  return (
    <div>
      <Link href="/admin/visits" className="mb-4 inline-block text-xs uppercase tracking-wide text-ink-dim hover:text-accent">
        ← Back to Visits
      </Link>
      <PageHeader title="Log a Company Visit" description="Fill this in right after visiting a prospect or client." />
      <Card className="max-w-2xl p-6">
        <CompanyVisitForm />
      </Card>
    </div>
  );
}
