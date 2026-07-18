import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { InquiryDetailView } from "@/components/admin/InquiryDetailView";

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Link href="/admin/inquiries" className="mb-4 inline-block text-xs uppercase tracking-wide text-ink-dim hover:text-accent">
        ← Back to Inquiries
      </Link>
      <PageHeader title="Inquiry Details" />
      <InquiryDetailView inquiryId={params.id} />
    </div>
  );
}
