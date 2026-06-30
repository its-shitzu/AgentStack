---
name: add-email-template
description: Generate a new transactional email (React Email component) and wire its send call into the right trigger point. Use when the user asks for a new transactional/notification email (e.g. "add an email when an invoice is overdue", "send a password-changed notification").
---

# add-email-template

Creates a React Email template and registers a typed sender function, then asks for (or infers) where it should be triggered. Read [AGENTS.md](../../../AGENTS.md) for project-wide conventions.

## Reference files (read these before generating anything)

- `src/emails/welcome-email.tsx` — canonical template structure (`Html`/`Head`/`Preview`/`Body`/`Container`/`Heading`/`Text` from `@react-email/components`, inline styles, typed props interface, default export).
- `src/emails/subscription-confirmation-email.tsx` — second example, shows multiple props.
- `src/lib/email.ts` — the single place that owns the Resend client and exposes one `send<X>Email()` function per template. Every template must have a corresponding function here, not be sent ad hoc from call sites.
- `src/lib/auth.ts` (`databaseHooks.user.create.after`) — example of a trigger point calling `sendWelcomeEmail(...)` after a DB write.
- `src/app/api/stripe/webhook/route.ts` (`notifyOrganizationOwner`) — example of a trigger point inside a webhook handler.

## Steps

1. Name the template in PascalCase ending in `Email` (e.g. `InvoiceOverdueEmail`) and the file in kebab-case (e.g. `invoice-overdue-email.tsx`) under `src/emails/`.
2. Build the component following the exact structure of `welcome-email.tsx`: typed props interface, `Html`/`Head`/`Preview`/`Body`/`Container` wrapper, plain inline `style` objects (no Tailwind — React Email clients don't reliably support it), default export.
3. Add a `send<Name>Email({...})` function to `src/lib/email.ts`: guard on `resend` being configured (same `if (!resend) { console.warn(...); return; }` pattern as the existing functions), call `resend.emails.send({ from: FROM_ADDRESS, to, subject, react: <Component {...props} /> })`.
4. **Determine the trigger point.** Ask the user if it's ambiguous; otherwise infer from context (e.g. "after a user is created" → `lib/auth.ts` hook; "after a Stripe event" → the relevant `case` in `api/stripe/webhook/route.ts`; "after a CRUD action" → the relevant server action in that resource's `actions.ts`). Insert the `await send<Name>Email(...)` call at that exact point, after the triggering DB write succeeds.
5. State explicitly in your final summary: which file holds the template, which function sends it, and which file/line now triggers it — so the user can verify the wiring at a glance.

## Conventions to enforce

- Never send email directly with the Resend SDK from a route/action — always go through a named function in `lib/email.ts`.
- Keep templates self-contained (no shared layout component yet) — if asked to add a third+ template that shares structure, propose extracting a shared `EmailLayout` rather than copy-pasting, but only after confirming with the user.
- Subject lines are set where the email is sent (in `lib/email.ts`), not inside the component.
