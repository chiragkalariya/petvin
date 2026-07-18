import { PageHeader } from "@/components/admin/PageHeader";
import { CostingCalculator } from "@/components/admin/CostingCalculator";

export default function CostingPage() {
  return (
    <div>
      <PageHeader
        title="Costing Calculator"
        description="View saved quotes or create a new costing with material, cutting, bending, wastage, margin and GST."
      />
      <CostingCalculator />
    </div>
  );
}
