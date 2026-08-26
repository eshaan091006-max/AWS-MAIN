# Admin Page — Design

Date: 2026-08-26
Status: awaiting review

## Goal

A working admin area where a club officer can read every event registration,
read and manage contact messages, and create, edit and delete events. Today
`/admin` is a 671-line mockup: it holds seed data in React state, calls no API,
and has no authentication.

## Scope

**In:** admin authentication; registrations (list, filter, CSV export); contact
messages (list, mark read, delete); events (create, edit, delete) backed by the
database.

**Out:** projects, team members and gallery. Each needs its own content
migration, and gallery additionally needs image uploads. They stay static in
`initialData.ts`, and their admin tabs are **removed** rather than left as
mockups. A tab whose "Add" button silently discards the data is worse than no
tab: it invites an officer to enter something and believe it was saved.

---

## 1. Authentication

Username and password, verified against an `admin_users` table in Supabase.

- `public.admin_users`: `id`, `username` (unique, lowercase), `password_hash`,
  `display_name`, `is_active`, `created_at`, `last_login_at`.
- Passwords hashed with `scrypt` from Node's built-in `crypto` — no new
  dependency, and a memory-hard KDF rather than a plain digest. Stored as
  `scrypt:<saltHex>:<hashHex>`; verified with `timingSafeEqual`.
- The table is service-role only. The anon key has no privilege on it and no
  RLS policy grants one, so password hashes are unreachable from the browser
  even if the key leaks.
- `POST /api/admin/login` verifies the credentials, stamps `last_login_at`, and
  sets a signed httpOnly `SameSite=Strict` cookie carrying
  `<username>.<expiresAt>.<hmac>`. The username is inside the signed payload, so
  the server knows *who* is acting without a second lookup, and the value cannot
  be edited to impersonate someone else.
- `middleware.ts` gates `/admin/*` and `/api/admin/*`, redirecting to
  `/admin/login` when the cookie is missing or invalid.
- Usernames are constrained to `[a-z0-9_-]{3,32}` so the dot-delimited token
  cannot be ambiguous.

The cookie is not a database credential and grants nothing on its own; every
privileged read still runs server-side under the service role.

Fails closed: with `ADMIN_SESSION_SECRET` unset, or no active rows in
`admin_users`, the admin area is unreachable rather than open.

**Creating the first account.** `npm run admin:create -- <username> <password>`
hashes the password locally and inserts the row via the service role. Passwords
are never written to `.env`, and the script refuses a password under 10
characters.

**Login attempts are rate limited** — 5 per 15 minutes per address — and the
response never distinguishes an unknown username from a wrong password.

## 2. Events move into the database

Adding an event from the UI cannot persist while events live in a TypeScript
file, so events become a real table.

- New `public.events` table mirroring the `EventData` shape.
- **`event_capacity` is folded in as `events.max_seats` and dropped.** That
  separate table was a stopgap from the seat-limit fix. Once events are rows,
  a separate capacity table is a second source of truth that can drift from the
  event it describes.
- `register_for_event()` and `event_seats()` read `max_seats` from `events`.
- `INITIAL_EVENTS` in `initialData.ts` becomes seed data, used to populate the
  table once and as the offline fallback described below.

**Rendering.** `/events` and `/events/[slug]` move from static generation to
ISR with `revalidate = 60`, plus on-demand `revalidatePath()` when an admin
saves an event, so a change appears immediately rather than after a redeploy.

**Fallback.** If the database is unreachable at render time the pages serve the
seeded events from `initialData.ts` rather than erroring, so the public site
never goes blank. Registration still refuses, because writes have no fallback —
consistent with the existing rule that a form must not report success for data
it dropped.

**One-way.** After migration, `initialData.ts` is no longer where events are
edited. The admin UI is.

## 3. Reading registrations

`GET /api/admin/registrations` — service-role read, admin-gated, optional
`eventId` filter, paginated. CSV export via `?format=csv`.

The anon key still has no read access to this table. Nothing about this feature
relaxes that; the read happens server-side under the service role, behind the
session cookie.

## 4. Caching

Two different kinds of data, deliberately treated differently.

**Seat counts — cached.** Every `EventCard` and event page calls
`/api/register?eventId=…` on mount, so a listing page with N events makes N
database round-trips per visitor. A short in-memory TTL cache (20s) sits in
front of `event_seats()`, invalidated immediately on a successful registration
so the seat bar never shows a stale number after someone signs up. Counts are
integers with no personal data, so caching them is safe.

**Registrations and messages — never cached in any shared store.** These carry
student names, emails and UIDs. Responses keep `Cache-Control: no-store`, which
the existing `/api/:path*` header rule already applies. "Caching" here means
only holding the fetched list in React state for the life of the page, with an
explicit Refresh control — never an HTTP cache, a CDN, or `revalidate`.

## 5. Supabase credentials become server-only

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are renamed to
`SUPABASE_URL` and `SUPABASE_ANON_KEY`.

Verified against a production build: the anon key currently appears only in
`.next/server/*`, never in `.next/static/*`, because no client component
imports `lib/supabase`. So it is not exposed today — but the `NEXT_PUBLIC_`
prefix means it *would* be inlined into the browser bundle the moment any client
component imported that module, with no error and no warning. Dropping the
prefix makes server-only a structural guarantee instead of a coincidence.

This is what can actually be done about keys in dev tools. RLS does not hide a
public key; it makes a public key useless. Both matter, and RLS stays exactly as
strict as it is: anon may insert a contact message and execute the two
count/registration functions, and may read nothing.

If client-side Supabase is ever needed (realtime, for instance), the public
prefix comes back for the anon key only — never for the service role key.

## 6. Component structure

`app/admin/page.tsx` becomes a shell holding tab state and shared data
fetching. Each tab moves to its own file:

```
components/admin/
  AdminShell.tsx        chrome, tab bar, session/logout
  OverviewTab.tsx       counts and recent activity
  RegistrationsTab.tsx  table, event filter, CSV export
  MessagesTab.tsx       list, mark read, delete
  EventsTab.tsx         list, create/edit form, delete
  useAdminData.ts       fetching, refresh, error state
```

Rewriting 671 lines as one file would make it worse. Each tab should be
readable on its own and testable without mounting the whole dashboard.

## 7. Files

```
middleware.ts                        gate /admin and /api/admin/*
lib/adminSession.ts                  sign/verify the session cookie
lib/cache.ts                         TTL cache for seat counts
app/admin/login/page.tsx             password form
app/admin/page.tsx                   rewritten shell
components/admin/*                   tab components
app/api/admin/login/route.ts         set cookie
app/api/admin/logout/route.ts        clear cookie
app/api/admin/registrations/route.ts list + CSV
app/api/admin/messages/route.ts      list, PATCH read, DELETE
app/api/admin/events/route.ts        POST, PATCH, DELETE
lib/db/index.ts                      events read/write against Supabase
supabase/schema.sql                  events table, fold in max_seats, migrate
.env.example / .env.local            renamed vars, new admin secrets
```

`app/api/contact` keeps its public POST; its admin GET moves to
`/api/admin/messages`. The admin-gated POST/DELETE on `/api/events` move to
`/api/admin/events`, leaving `/api/events` a public read.

## 8. Testing

- Middleware: no cookie, bad cookie, expired cookie, valid cookie.
- Login: wrong password rejected; correct password sets an httpOnly cookie.
- Registrations: admin-gated; CSV escapes commas and quotes in names.
- Events: create appears on the public page after revalidation; delete removes it.
- Seat cache: expires; invalidated by a registration.
- Fallback: with the database unreachable, event pages still render seeded content.
- Bundle check: after renaming, confirm neither key appears in `.next/static`.

## 9. Risks

| Risk | Handling |
|---|---|
| Migration is one-way | Documented; `initialData.ts` becomes seed only |
| Public pages depend on the database | Seeded fallback so the site never goes blank |
| Shared password, no audit trail | Accepted for now; Supabase Auth is the upgrade |
| Renaming env vars breaks a deploy | Both names read during transition, old one warns |
| Cached seat count goes stale | 20s TTL, invalidated on write |
