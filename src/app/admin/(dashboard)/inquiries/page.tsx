import { PageHeader } from "@/components/admin/PageHeader";
import { InquiryTable } from "@/components/admin/InquiryTable";

export default function InquiriesPage() {
  return (
    <div>
      <PageHeader title="Contact Inquiries" description="All submissions from the website contact form." />
      <InquiryTable />
    </div>
  );
}
