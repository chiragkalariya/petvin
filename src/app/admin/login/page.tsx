"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site-content";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5 font-display text-lg uppercase tracking-wide text-ink">
          <span className="h-3 w-3 bg-accent [clip-path:polygon(0_0,100%_0,100%_70%,70%_100%,0_100%)]" />
          {SITE.name}
        </div>
        <div className="border border-line bg-bg-alt p-8">
          <h1 className="mb-1 font-display text-xl uppercase text-ink">Admin Login</h1>
          <p className="mb-6 text-sm text-ink-dim">Sign in to manage inquiries, visits, and quotes.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" name="email" type="email" required autoFocus />
            <Input label="Password" name="password" type="password" required />
            {error && <p className="text-xs text-accent">{error}</p>}
            <Button type="submit" isLoading={loading} className="mt-2 w-full justify-center">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
