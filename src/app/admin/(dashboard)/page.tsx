import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [newInquiries, inProgress, pendingFollowUps, recentInquiries] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count({ where: { status: "IN_PROGRESS" } }),
    prisma.companyVisit.count({
      where: { followUpDate: { lte: new Date() }, status: { notIn: ["CONVERTED", "NOT_INTERESTED"] } },
    }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Snapshot of what needs attention today." />

      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="New Inquiries" value={newInquiries} hint="Awaiting first response" />
        <StatCard label="In Progress" value={inProgress} hint="Being worked on" />
        <StatCard label="Follow-ups Due" value={pendingFollowUps} hint="Company visits to revisit" />
      </div>

      <div className="border border-line bg-bg-alt">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-sm uppercase tracking-wide text-ink">Recent Inquiries</h2>
          <Link href="/admin/inquiries" className="text-xs uppercase tracking-wide text-accent">
            View All
          </Link>
        </div>
        {recentInquiries.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-dimmer">No inquiries yet.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {recentInquiries.map((inq) => (
              <li key={inq.id}>
                <Link
                  href={`/admin/inquiries/${inq.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-bg-light"
                >
                  <div>
                    <p className="text-sm text-ink">{inq.name}</p>
                    <p className="text-xs text-ink-dimmer">{inq.company || "—"} · {formatDate(inq.createdAt)}</p>
                  </div>
                  <StatusBadge status={inq.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
