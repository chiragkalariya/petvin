import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeManager } from "@/components/admin/EmployeeManager";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div>
      <PageHeader title="Employees" description="Manage who has access to the admin panel." />
      <EmployeeManager />
    </div>
  );
}
