import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { EmployeeManager } from "@/components/admin/EmployeeManager";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  return <EmployeeManager />;
}
