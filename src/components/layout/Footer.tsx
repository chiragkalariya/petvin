import { SITE } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="border-t border-line py-9">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3.5 px-6">
        <div className="flex items-center gap-2.5">
          <img src="/images/petvin_febtech_updated.svg" alt="Petvin Logo" className="w-24 h-auto grayscale opacity-80 transition-all hover:grayscale-0 hover:opacity-100" />
        </div>
        <p className="text-xs text-ink-dimmer">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
