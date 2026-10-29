---
name: fast-dev
description: High-velocity development runbook and architecture cheatsheet for Petvin Febtech Next.js codebase. Use whenever implementing changes, UI adjustments, admin CRUD features, print layout updates, or database schema changes for fast response times.
---

# Fast Development Runbook (Petvin Febtech)

This skill provides direct shortcuts and guidelines to achieve rapid turnaround on modifications across the Petvin Febtech Next.js application.

---

## 1. High-Speed Operating Principles

1. **Surgical File Inspection**:
   - Never read entire 1000+ line files.
   - Use `grep_search` with specific identifiers, or `view_file` with precise `StartLine` and `EndLine` ranges (max 40–80 lines at a time).
2. **Targeted In-Place Editing**:
   - Use `replace_file_content` for single contiguous changes and `multi_replace_file_content` for coordinated edits.
   - Never replace entire files.
3. **Single Verification Pass**:
   - Run `npx tsc --noEmit` once after edits are completed to verify zero type/syntax errors.
4. **Concise Communication**:
   - Do not summarize what code does line-by-line.
   - Present completed changes directly with clickable file links.

---

## 2. Admin UI Component Map & Conventions

| Purpose | Component Path | Import & Usage Pattern |
| :--- | :--- | :--- |
| **Page Header** | `@/components/admin/PageHeader` | `<PageHeader title="..." description="..." action={<Button size="sm">...</Button>} />` |
| **List Table** | `@/components/ui/Table` | `<Table><THead><TH>...</TH></THead><tbody><TRow><TD>...</TD></TRow></tbody></Table>` |
| **Action Icons** | `@/components/ui/Icons` | `<PencilIcon />`, `<TrashIcon />` |
| **Buttons** | `@/components/ui/Button` | `<Button size="sm" variant="primary \| outline" className="gap-1.5">` |
| **Confirmation**| `@/components/ui/ConfirmModal` | `<ConfirmModal isOpen={...} onConfirm={...} onClose={...} />` |
| **Card / Badge** | `@/components/ui/Card` | `<Badge tone="success \| warning \| danger">` |

### Form / Add Page Header Pattern:
Every admin Add/Edit form follows the **Costing Calculator** pattern:
- **`PageHeader` Action**: Contains the Back Button:
  ```tsx
  <Button size="sm" variant="outline" onClick={() => setView("list")} className="gap-1.5">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to List
  </Button>
  ```
- **Form Top Bar**:
  - Left: Status tag (`New ... Draft` or `Editing ...: #ID`).
  - Right: Action buttons (`Button size="sm" className="gap-1.5"` with SVG icons).

---

## 3. Print System Reference (`src/lib/jobwork-print.ts`)

- **GST Tax Invoice Print**: Handles both Full Page & Pad Print (pre-printed letterhead).
- **Dynamic Site Settings**: Fetched from `/api/settings` (Company name, Address, GST, Bank Details, Signature Image).
- **Print Layout**:
  - Standard invoice table columns: S.No, Description of Goods/Services, HSN/SAC, Qty, Rate, Taxable Value, CGST/SGST/IGST, Total.
  - Bank details & Terms & Conditions dynamically rendered.
  - Signatory block with optional uploaded signature image.

---

## 4. Prisma & Database Updates

- Models reside in `prisma/schema.prisma`.
- When modifying schema:
  ```bash
  npx prisma db push
  npx prisma generate
  ```
- Re-use singleton client from `@/lib/prisma`.
