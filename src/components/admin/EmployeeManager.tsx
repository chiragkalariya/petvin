"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Table, THead, TH, TRow, TD } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
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
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
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
              <TH></TH>
            </THead>
            <tbody>
              {employees.map((emp) => (
                <TRow key={emp.id}>
                  <TD className="text-ink">{emp.name}</TD>
                  <TD>{emp.email}</TD>
                  <TD>
                    <Badge tone={emp.role === "ADMIN" ? "accent" : "neutral"}>{emp.role}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={emp.active ? "success" : "danger"}>{emp.active ? "Active" : "Disabled"}</Badge>
                  </TD>
                  <TD>{formatDate(emp.createdAt)}</TD>
                  <TD>
                    <button
                      onClick={() => toggleActive(emp.id, emp.active)}
                      className="text-xs uppercase tracking-wide text-ink-dim hover:text-accent"
                    >
                      {emp.active ? "Disable" : "Enable"}
                    </button>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Card className="h-fit p-6">
        <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-ink">Add Employee</h3>
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
          <Button type="submit" isLoading={creating}>
            Add Employee
          </Button>
        </form>
      </Card>
    </div>
  );
}
