import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/Card";
import { formatDate, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    newInquiries,
    inProgress,
    pendingFollowUps,
    recentInquiries,
    jobworkSalesCount,
    jobworkPendingSales,
    recentJobworkSales,
  ] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count({ where: { status: "IN_PROGRESS" } }),
    prisma.companyVisit.count({
      where: { followUpDate: { lte: new Date() }, status: { notIn: ["CONVERTED", "NOT_INTERESTED"] } },
    }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.jobworkSale.count(),
    prisma.jobworkSale.findMany({
      where: { paymentStatus: { in: ["PENDING", "PARTIAL"] } },
      select: { balanceAmount: true },
    }),
    prisma.jobworkSale.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalPendingReceivables = jobworkPendingSales.reduce((acc, s) => acc + s.balanceAmount, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Snapshot of inquiries and jobwork sales." />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New Inquiries" value={newInquiries} hint="Awaiting first response" />
        <StatCard label="In Progress" value={inProgress} hint="Being worked on" />
        <StatCard label="Follow-ups Due" value={pendingFollowUps} hint="Visits to revisit" />
        <StatCard
          label="Pending Receivables"
          value={formatCurrency(totalPendingReceivables)}
          hint={`${jobworkSalesCount} Total jobwork invoices`}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <div className="border border-line bg-bg-alt">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-sm uppercase tracking-wide text-ink">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs uppercase tracking-wide text-accent hover:underline">
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
                    className="flex items-center justify-between px-6 py-4 hover:bg-bg-light transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{inq.name}</p>
                      <p className="text-xs text-ink-dimmer">
                        {inq.company || "—"} · {formatDate(inq.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={inq.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Jobwork Sales */}
        <div className="border border-line bg-bg-alt">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-sm uppercase tracking-wide text-ink">Recent Jobwork Sales</h2>
            <Link href="/admin/jobwork-sales" className="text-xs uppercase tracking-wide text-accent hover:underline">
              View All
            </Link>
          </div>
          {recentJobworkSales.length === 0 ? (
            <div className="px-6 py-8 text-sm text-ink-dimmer">
              No jobwork sales recorded yet.{" "}
              <Link href="/admin/jobwork-sales" className="text-accent underline">
                Create one now
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {recentJobworkSales.map((sale) => (
                <li key={sale.id}>
                  <Link
                    href="/admin/jobwork-sales"
                    className="flex items-center justify-between px-6 py-4 hover:bg-bg-light transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">
                          {sale.invoiceNumber}
                        </span>
                        <span className="text-xs text-ink-dimmer">· {formatDate(sale.invoiceDate)}</span>
                      </div>
                      <p className="text-sm font-semibold text-ink mt-0.5">{sale.customerName}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-bold text-ink">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                      <Badge
                        tone={
                          sale.paymentStatus === "PAID"
                            ? "success"
                            : sale.paymentStatus === "PARTIAL"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

