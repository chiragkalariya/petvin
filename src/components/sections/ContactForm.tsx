"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("file") as File | null;

      let fileUrl = "";
      let fileName = "";

      // Upload the drawing/photo to Vercel Blob first, if one was attached.
      if (file && file.size > 0) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }

        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
        fileName = file.name;
      }

      const payload = {
        name: formData.get("name"),
        company: formData.get("company"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        message: formData.get("message"),
        fileUrl,
        fileName,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setSubmitted(true);
      form.reset();
      toast.success("Inquiry sent — we'll get back to you shortly.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
        <Input label="Full Name" name="name" required />
        <Input label="Company" name="company" />
      </div>
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
        <Input label="Phone" name="phone" type="tel" required />
        <Input label="Email" name="email" type="email" />
      </div>
      <Textarea
        label="What do you need cut/bent?"
        name="message"
        placeholder="Material, thickness, quantity, timeline..."
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="file" className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
          Attach Drawing (DXF / PDF / Image)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".dxf,.pdf,image/*"
          className="border border-dashed border-line bg-bg-alt px-4 py-3.5 text-sm text-ink-dim file:mr-3 file:border-0 file:bg-bg-light file:px-3 file:py-1.5 file:text-ink"
        />
      </div>
      <Button type="submit" isLoading={submitting} className="self-start">
        Send Inquiry
      </Button>
      {submitted && (
        <p className="font-mono text-sm text-accent">
          Thanks — your inquiry has been noted. We&apos;ll get back to you shortly.
        </p>
      )}
    </form>
  );
}
