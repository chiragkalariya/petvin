# Petvin Febtech — Fast Development & Architecture Rules

## 1. Fast Response Protocol
To deliver rapid turnaround on user requests:
- **Avoid scanning entire large files**: Use `grep_search` or slice-reading (`view_file` with `StartLine`/`EndLine` ranges of 40–80 lines).
- **Targeted edits**: Make focused modifications using `replace_file_content` or `multi_replace_file_content`. Avoid replacing entire files.
- **Single compile check**: Run `npx tsc --noEmit` once at the end of file changes to ensure 0 build errors.
- **Concise answers**: Avoid lengthy explanations of self-evident code; link to modified files and summarize key decisions in 2–3 sentences.

## 2. Admin UI Standards
- **Page Header**: Unconditionally use `PageHeader` from `@/components/admin/PageHeader`:
  - List View: `action={<Button size="sm" onClick={...}>+ Add Item</Button>}`
  - Form View: `action={<Button size="sm" variant="outline" onClick={...} className="gap-1.5"><BackIcon /> Back to List</Button>}`
- **Form Top Bar**: Status badge on the left (`Editing ...` or `New ... Draft`), action buttons on the right (`Button size="sm" className="gap-1.5"`).
- **Table View**: Use `@/components/ui/Table` (`Table`, `THead`, `TH`, `TRow`, `TD`) and icons from `@/components/ui/Icons` (`PencilIcon`, `TrashIcon`).
- **Confirmation Modals**: Use `@/components/ui/ConfirmModal`.

## 3. Database & Print References
- Database: Neon PostgreSQL via Prisma (`prisma/schema.prisma`). Run `npx prisma db push && npx prisma generate` upon schema edits.
- Print Templates: Located in `src/lib/jobwork-print.ts`. Dynamic company settings are loaded from `SiteSettings` via `/api/settings`.
