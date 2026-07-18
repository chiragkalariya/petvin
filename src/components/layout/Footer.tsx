import { SITE } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="border-t border-line py-9">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3.5 px-6">
        <div className="flex items-center gap-2.5 font-display text-sm uppercase tracking-wide text-ink">
          <span className="h-3 w-3 bg-accent [clip-path:polygon(0_0,100%_0,100%_70%,70%_100%,0_100%)]" />
          {SITE.name}
        </div>
        <p className="text-xs text-ink-dimmer">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
