"use client";

import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { VisitTable } from "@/components/admin/VisitTable";
import { Button } from "@/components/ui/Button";

export default function VisitsPage() {
  return (
    <div>
      <PageHeader
        title="Visit History"
        description="Track and log all company visits and follow-ups."
        action={
          <Link href="/admin/visits/new">
            <Button size="sm">+ Log Visit</Button>
          </Link>
        }
      />

      <div className="animate-in fade-in duration-300">
        <VisitTable />
      </div>
    </div>
  );
}
