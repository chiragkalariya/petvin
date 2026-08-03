"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { User, Building2, Phone, Mail, UploadCloud } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-sm bg-bg-alt/50 border border-line p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input 
          label="Full Name" 
          name="name" 
          icon={<User className="h-4 w-4" />} 
          placeholder="John Doe"
          required 
        />
        <Input 
          label="Company" 
          name="company" 
          icon={<Building2 className="h-4 w-4" />} 
          placeholder="Acme Corp"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input 
          label="Phone" 
          name="phone" 
          type="tel" 
          icon={<Phone className="h-4 w-4" />} 
          placeholder="+1 234 567 8900"
          required 
        />
        <Input 
          label="Email" 
          name="email" 
          type="email" 
          icon={<Mail className="h-4 w-4" />} 
          placeholder="john@example.com"
        />
      </div>
      <Textarea
        label="What do you need cut/bent?"
        name="message"
        placeholder="Material, thickness, quantity, timeline..."
        className="min-h-[120px]"
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="file" className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
          Attach Drawing (DXF / PDF / Image)
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dimmer transition-colors group-focus-within:text-accent group-hover:text-ink">
            <UploadCloud className="h-5 w-5" />
          </div>
          <input
            id="file"
            name="file"
            type="file"
            accept=".dxf,.pdf,image/*"
            className="w-full cursor-pointer border border-dashed border-line bg-bg-alt/50 pl-12 pr-4 py-4 text-sm text-ink-dim transition-all hover:border-accent/50 hover:bg-bg-alt focus:border-accent focus:outline-none file:mr-4 file:border-0 file:bg-bg file:px-4 file:py-1 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-ink file:hover:bg-bg-light file:transition-colors file:cursor-pointer"
          />
        </div>
      </div>
      <Button type="submit" isLoading={submitting} className="mt-2 w-full sm:w-auto sm:self-start">
        Send Inquiry
      </Button>
      {submitted && (
        <div className="mt-2 flex items-center gap-2 rounded-sm bg-accent/10 p-3 text-accent border border-accent/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-mono text-sm">Thanks — your inquiry has been noted. We&apos;ll get back to you shortly.</span>
        </div>
      )}
    </form>
  );
}
