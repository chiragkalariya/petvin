import { PageHeader } from "@/components/admin/PageHeader";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export default function PortfolioAdminPage() {
  return (
    <div>
      <PageHeader
        title="Our Work"
        description="Manage categories and add finished jobs to the public portfolio."
      />
      <PortfolioManager />
    </div>
  );
}
