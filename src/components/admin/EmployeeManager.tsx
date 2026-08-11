"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
    if (res.ok) load();
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
            {employees.map((emp) => (
              <TRow key={emp.id}>
                <TD className="text-ink font-medium">{emp.name}</TD>
                <TD>{emp.email}</TD>
                <TD>
                  <Badge tone={emp.role === "ADMIN" ? "accent" : "neutral"}>{emp.role}</Badge>
                </TD>
                <TD>
                  <Badge tone={emp.active ? "success" : "danger"}>{emp.active ? "Active" : "Disabled"}</Badge>
                </TD>
                <TD>{formatDate(emp.createdAt)}</TD>
                <TD className="text-right">
                  <button
                    onClick={() => toggleActive(emp.id, emp.active)}
                    className="text-xs uppercase tracking-wide text-ink-dim hover:text-accent font-mono"
                  >
                    {emp.active ? "Disable" : "Enable"}
                  </button>
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-line bg-bg p-6 shadow-2xl animate-in zoom-in-95 duration-200"
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
              <Input label="Full Name" name="name" autoFocus required />
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
          </div>
        </div>
      )}
    </div>
  );
}
