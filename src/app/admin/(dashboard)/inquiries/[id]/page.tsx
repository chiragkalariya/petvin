import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { InquiryDetailView } from "@/components/admin/InquiryDetailView";
import { Button } from "@/components/ui/Button";

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <PageHeader 
        title="Inquiry Details" 
        action={
          <Link href="/admin/inquiries">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Inquiries
            </Button>
          </Link>
        }
      />
      <InquiryDetailView inquiryId={params.id} />
    </div>
  );
}
