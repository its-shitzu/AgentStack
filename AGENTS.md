# AGENTS.md — AgentStack architecture map

This file orients AI coding agents (Claude Code, Cursor, etc.) working in this repo. Read it before making non-trivial changes. For step-by-step generators, see `.claude/skills/` — most "add X" requests should go through one of them instead of being improvised.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Shadcn UI · Drizzle ORM · PostgreSQL (Neon-compatible) · Better Auth · Stripe · React Email + Resend.

## Where things live

| Concern | Location |
|---|---|
| DB tables | `src/db/schema/*.ts` (one file per domain, re-exported from `index.ts`) |
| DB client | `src/db/index.ts` |
| Auth config (server) | `src/lib/auth.ts` |
| Auth client (React hooks) | `src/lib/auth-client.ts` |
| Session/org helpers | `src/lib/session.ts` (`getCurrentUser`, `requireUser`, `requireOrganization`) |
| Stripe client | `src/lib/stripe.ts` |
| Email sending | `src/lib/email.ts` (one `send<X>Email()` per template) |
| Email templates | `src/emails/*.tsx` (React Email) |
| Marketing pages | `src/app/page.tsx`, `src/app/(marketing)/` |
| Auth pages | `src/app/(auth)/login`, `src/app/(auth)/signup` |
| Dashboard pages | `src/app/(dashboard)/**` (auth-gated by `(dashboard)/layout.tsx`) |
| API routes | `src/app/api/**` (auth handler, Stripe checkout/portal/webhook) |
| Shadcn primitives | `src/components/ui/*` (do not hand-roll a new primitive if one exists here) |
| Shared dashboard chrome | `src/components/dashboard/*` (sidebar, topbar, nav registry) |
| Config | `src/config/site.ts`, `src/config/pricing.ts` |

## Data model

`users` / `sessions` / `accounts` / `verifications` — owned by Better Auth, defined in `src/db/schema/auth.ts`. Don't hand-edit rows in these tables outside of Better Auth's own APIs.

`organizations` / `organization_members` — every user gets a personal `organization` automatically on signup (see `databaseHooks.user.create.after` in `src/lib/auth.ts`). This is a lightweight multi-tenant model: one user can belong to multiple orgs via `organization_members`, but the UI currently assumes "first org" (`getCurrentOrganization()` in `src/lib/session.ts`). If you add an org switcher, update that helper.

`subscriptions` — one-to-one with `organizations`, synced from Stripe via `src/app/api/stripe/webhook/route.ts`. Never write subscription status from anywhere else; the webhook is the single source of truth.

**Every business resource you add must include an `organizationId` column and be scoped through `requireOrganization()`.** There is no global/unscoped data in this app.

## Conventions (enforced, not optional)

- **Files**: kebab-case. **Components/types**: PascalCase. **DB tables/columns**: snake_case (Drizzle maps `camelCase` JS fields to snake_case columns automatically — keep JS-side fields camelCase).
- **Mutations**: prefer Server Actions (`"use server"`, colocated in `actions.ts` next to the page that uses them) over API routes. API routes are reserved for things that need a stable HTTP contract: the Better Auth catch-all, Stripe endpoints, and webhooks.
- **Validation**: every Server Action and API route validates its input with Zod before touching the database. No exceptions.
- **Types**: no `any`. Derive row types from Drizzle with `typeof table.$inferSelect`.
- **Auth/data access**: use `requireUser()` / `requireOrganization()` from `src/lib/session.ts` in every server component or action that touches user/org data — never query the DB with a client-supplied ID without checking it belongs to the current session.
- **UI**: reuse `src/components/ui/*` before adding a new Shadcn primitive; reuse `src/components/shared/data-table.tsx` for any tabular resource listing.
- **Scope discipline**: don't add abstractions, pagination, soft-deletes, or audit logs unless explicitly requested. Three similar lines beat a premature helper.

## Common commands

```bash
pnpm install
pnpm db:generate   # generate a migration from schema changes
pnpm db:push       # push schema directly (fast local iteration)
pnpm db:studio     # browse the DB
pnpm dev
pnpm test
pnpm typecheck
```

## Skill routing — use these instead of improvising

| If the user asks to... | Use |
|---|---|
| Add a new business resource/entity (model + API + UI) | `.claude/skills/add-crud-feature` |
| Add a new page inside the dashboard | `.claude/skills/add-dashboard-page` |
| Add or trigger a transactional email | `.claude/skills/add-email-template` |

Each skill's `SKILL.md` names the exact reference files to read before generating code, so output stays consistent with the rest of the codebase.
