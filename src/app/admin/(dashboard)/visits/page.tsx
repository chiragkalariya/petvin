import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { VisitTable } from "@/components/admin/VisitTable";
import { Button } from "@/components/ui/Button";

export default function VisitsPage() {
  return (
    <div>
      <PageHeader
        title="Company Visit Log"
        description="Field visits logged by the team, with follow-up tracking."
        action={
          <Link href="/admin/visits/new">
            <Button size="sm">+ Log New Visit</Button>
          </Link>
        }
      />
      <VisitTable />
    </div>
  );
}
