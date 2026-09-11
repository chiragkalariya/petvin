"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TrashIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  active: boolean;
  createdAt: string;
}

export function EmployeeManager() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setEmployees(data.users ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add employee");
      }

      toast.success("Employee added");
      form.reset();
      setShowAddModal(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      toast.success(active ? "Employee disabled" : "Employee enabled");
      load();
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleConfirmDelete() {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${deletingEmployee.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete employee");
      }

      toast.success(`Employee ${deletingEmployee.name} deleted`);
      setDeletingEmployee(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage who has access to the admin panel."
        action={
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            + Add Employee
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-dimmer">Loading…</p>
      ) : (
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH>Joined</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <tbody>
            {employees.map((emp) => {
              const currentUserId = (session?.user as { id?: string })?.id;
              const currentUserEmail = session?.user?.email;
              const isSelf =
                (currentUserId && emp.id === currentUserId) ||
                (currentUserEmail && emp.email.toLowerCase() === currentUserEmail.toLowerCase());

              return (
                <TRow key={emp.id}>
                  <TD className="text-ink font-medium">
                    <div className="flex items-center gap-2">
                      <span>{emp.name}</span>
                      {isSelf && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                          You
                        </span>
                      )}
                    </div>
                  </TD>
                  <TD>{emp.email}</TD>
                  <TD>
                    <Badge tone={emp.role === "ADMIN" ? "accent" : "neutral"}>{emp.role}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={emp.active ? "success" : "danger"}>{emp.active ? "Active" : "Disabled"}</Badge>
                  </TD>
                  <TD>{formatDate(emp.createdAt)}</TD>
                  <TD className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggleActive(emp.id, emp.active)}
                        className="text-xs uppercase tracking-wide text-ink-dim hover:text-accent font-mono transition-colors"
                        title={emp.active ? "Disable employee account" : "Enable employee account"}
                      >
                        {emp.active ? "Disable" : "Enable"}
                      </button>

                      {isSelf ? (
                        <span
                          className="text-ink-dimmer/30 cursor-not-allowed p-1 inline-flex"
                          title="You cannot delete your own account"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeletingEmployee(emp)}
                          className="text-ink-dim hover:text-red-400 transition-colors p-1"
                          title={`Delete ${emp.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TD>
                </TRow>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="max-w-md"
      >
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <h3 className="font-display text-base uppercase text-ink tracking-wide">
            Add Employee
          </h3>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-ink-dimmer hover:text-ink transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Full Name" name="name" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Temporary Password" name="password" type="password" required minLength={6} />
          <Select
            label="Role"
            name="role"
            defaultValue="EMPLOYEE"
            options={[
              { value: "EMPLOYEE", label: "Employee" },
              { value: "ADMIN", label: "Admin" },
            ]}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={creating}>
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Employee Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingEmployee}
        title="Delete Employee"
        message={
          deletingEmployee
            ? `Are you sure you want to delete ${deletingEmployee.name} (${deletingEmployee.email})? This action cannot be undone.`
            : "Are you sure you want to delete this employee?"
        }
        confirmLabel="Delete Employee"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingEmployee(null)}
      />
    </div>
  );
}
