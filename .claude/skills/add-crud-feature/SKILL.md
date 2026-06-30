---
name: add-crud-feature
description: Generate a complete CRUD resource (Drizzle model + server actions + dashboard table/form UI) from a natural-language description, following AgentStack's conventions. Use when the user asks to add a new resource/entity to the app (e.g. "add an Invoice resource", "I need a Task model with title, status, due date").
---

# add-crud-feature

Generates a full vertical slice for a new business resource: database table, server actions, dashboard page, table, and form — wired into navigation. Read [AGENTS.md](../../../AGENTS.md) first for the project-wide conventions this skill assumes.

## Inputs

Parse from the user's natural-language request:
- **Resource name** (singular, PascalCase for types, kebab-case for files/routes, snake_case for the DB table). E.g. "Invoice" → `Invoice`, `invoice`, `invoices`.
- **Fields**: name, type (text/number/boolean/date/enum), required/optional. Infer reasonable types if the user is vague (e.g. "amount" → numeric in cents, "status" → enum).
- Always add `organizationId` (FK to `organizations.id`) — every resource in this app is scoped to an organization. Never create a resource without it.

## Reference files (read these before generating anything)

- `src/db/schema/organizations.ts` — table definition pattern (pgTable, id as text PK via `createId()`, timestamps, FK with `onDelete: "cascade"`).
- `src/app/(dashboard)/settings/organization/page.tsx` — server component reading data with Drizzle + `requireOrganization()`.
- `src/app/(dashboard)/settings/billing/billing-actions.tsx` + `billing/page.tsx` — pattern for a server page + a `"use client"` actions component.
- `src/components/shared/data-table.tsx` — generic `DataTable` component to reuse for the listing table.
- `src/components/dashboard/nav-items.ts` — where to register the new nav entry.

## Steps

1. **Schema**: create `src/db/schema/<resource-plural>.ts` exporting a `pgTable` named `<resourcePlural>`. Columns: `id text primaryKey`, the requested fields, `organizationId text notNull references(() => organizations.id, { onDelete: "cascade" })`, `createdAt`/`updatedAt timestamps notNull defaultNow()`. Re-export it from `src/db/schema/index.ts`.

2. **Migration**: after writing the schema, tell the user to run `pnpm db:generate` then `pnpm db:push` (or run it yourself if you have shell access and a `DATABASE_URL` is configured) — do not hand-write SQL migrations.

3. **Server actions**: create `src/app/(dashboard)/<resource-plural>/actions.ts` with a `"use server"` directive. Implement `create<Resource>`, `update<Resource>`, `delete<Resource>`, `list<Resource>s`. Every query/mutation must:
   - Call `requireOrganization()` from `@/lib/session` and filter/scope by `organizationId`.
   - Validate input with a Zod schema before touching the DB.
   - Use `createId()` from `@/lib/id` for new primary keys.

4. **UI**:
   - `src/app/(dashboard)/<resource-plural>/page.tsx` — server component, fetches rows via the list action, renders `<<Resource>Table>`.
   - `src/components/<resource-plural>/<resource>-table.tsx` — uses the shared `DataTable` component, one column per field plus an actions column (edit/delete via a dialog using `src/components/ui/dialog.tsx`).
   - `src/components/<resource-plural>/<resource>-form.tsx` — `"use client"` form using `Input`/`Label`/`Select`/`Switch` from `src/components/ui/*` matched to field types, calling the server actions, with `useState` for pending/error state (mirror `billing-actions.tsx`'s fetch+loading pattern, but call server actions directly via `startTransition` instead of `fetch`).

5. **Navigation**: add an entry to `src/components/dashboard/nav-items.ts` pointing at `/dashboard/<resource-plural>`, with a sensible `lucide-react` icon.

6. **Report back**: list every file created/modified and the exact migration commands the user still needs to run.

## Conventions to enforce

- No `any`. Derive row types with `typeof <table>.$inferSelect` / `$inferInsert`.
- Files: kebab-case. Component names inside files: PascalCase.
- Server actions live in `actions.ts` colocated with the page, never in `lib/`.
- Don't add features beyond what was asked (no soft-delete, no audit log, no pagination) unless the user requested it.
