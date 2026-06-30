---
name: add-dashboard-page
description: Generate a new page under the authenticated dashboard that matches the existing layout, sidebar, and design system. Use when the user asks to add a new dashboard screen/page (e.g. "add an Analytics page to the dashboard", "create a Team page under settings").
---

# add-dashboard-page

Adds a new route inside the `(dashboard)` route group, reusing the existing layout/sidebar/topbar and Shadcn UI primitives so the result is visually indistinguishable from hand-written pages. Read [AGENTS.md](../../../AGENTS.md) for project-wide conventions.

## Reference files (read these before generating anything)

- `src/app/(dashboard)/layout.tsx` — the shared layout (auth guard via `getCurrentUser`, `Sidebar` + `Topbar`). New pages do NOT need to repeat this — they automatically inherit it by living under `(dashboard)/`.
- `src/app/(dashboard)/dashboard/page.tsx` — canonical example of a server component page: heading + description block, then a grid of `Card`s.
- `src/app/(dashboard)/settings/organization/page.tsx` — example of a page that fetches data server-side with Drizzle, scoped by `requireOrganization()`.
- `src/components/dashboard/nav-items.ts` — sidebar registry.

## Steps

1. Determine the route path from the request (e.g. "Analytics page" → `/dashboard/analytics`, "Team page under settings" → `/dashboard/settings/team`).
2. Create `src/app/(dashboard)/<path>/page.tsx` as an `async` server component. Always start with:
   ```tsx
   const user = await requireUser(); // or requireOrganization() if org-scoped data is needed
   ```
   from `@/lib/session`.
3. Structure the page body using the established pattern: a heading block (`<h1 className="text-2xl font-semibold">` + a `text-sm text-neutral-500` description paragraph), followed by content in `Card`/`CardHeader`/`CardContent` from `@/components/ui/card`. Use a `grid gap-4 sm:grid-cols-*` wrapper for multi-card layouts, matching `dashboard/page.tsx`.
4. If the page needs interactivity (forms, buttons with client state), split it: keep `page.tsx` a server component for data fetching, and put the interactive part in a colocated `"use client"` component (mirror `settings/billing/billing-actions.tsx`).
5. Register the page in `src/components/dashboard/nav-items.ts` with a `lucide-react` icon, unless the user explicitly says it's a sub-page that shouldn't appear in the sidebar (e.g. a detail/edit view).
6. Do not duplicate the sidebar, topbar, or auth check — those are inherited from `(dashboard)/layout.tsx`.

## Conventions to enforce

- Server Components by default; only mark a file `"use client"` when it needs state, effects, or event handlers.
- Reuse existing `src/components/ui/*` primitives before creating new ones. If a needed primitive doesn't exist yet (e.g. `Tabs`, `Tooltip`), say so explicitly and ask whether to add it via shadcn rather than hand-rolling it.
- Keep the page focused on what was requested — no placeholder analytics charts or fake data unless asked for.
