# Admin Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A password-protected admin area where a club officer can read every event registration (with CSV export), manage contact messages, and create/edit/delete events backed by Supabase.

**Architecture:** Events move from `lib/data/initialData.ts` into a `public.events` table, with the public pages switching to ISR plus a seeded fallback. A signed httpOnly cookie set at `/admin/login` gates `/admin/*` and `/api/admin/*` via `middleware.ts`. All privileged reads happen server-side under the service role; the browser never holds a database credential.

**Tech Stack:** Next.js 15 (App Router), TypeScript 5, Tailwind 3, Supabase (`@supabase/supabase-js` v2), Vitest (added in Task 1).

**Spec:** `docs/superpowers/specs/2026-08-26-admin-page-design.md`

## Global Constraints

- Node crypto only for signing — no new auth dependency.
- Admin routes fail closed: unset `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` disables the admin area rather than opening it.
- The anon key may never regain a read privilege on `event_registrations` or `contact_messages`.
- Responses carrying registrant or message data must keep `Cache-Control: no-store`. Never `revalidate`, never a CDN, never an in-memory server cache.
- Seat counts (integers only) may be cached; TTL 20 seconds, invalidated on write.
- Supabase env vars are `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — none prefixed `NEXT_PUBLIC_`.
- Existing visual language: `navy-950/900/800`, `aws-orange`, `font-mono` for labels, `rounded-xl`/`rounded-2xl`, `text-xs` body.
- Every task ends with `npx tsc --noEmit` and `npx next lint` clean.

---

### Task 1: Safety net — version control and a test runner

The repo has no git history and no test framework. This plan performs a one-way
data migration and rewrites a 671-line file, so both are prerequisites, not
niceties.

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/__tests__/smoke.test.ts`
- Modify: `package.json` (scripts, devDependencies)

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` runs Vitest. Later tasks add files under `lib/__tests__/`.

- [ ] **Step 1: Initialise git and take a baseline commit**

`.gitignore` already excludes `node_modules`, `.next`, `.env*.local`, and
`*.tsbuildinfo`. Confirm `.env.local` is ignored before committing — it holds
the service role key.

```bash
git init
git check-ignore -v .env.local
git add -A
git commit -m "chore: baseline before admin work"
```

If `git check-ignore` prints nothing, STOP — `.env.local` is not ignored and
committing would leak the service role key.

- [ ] **Step 2: Install Vitest**

```bash
npm install --save-dev vitest@^2.1.8
```

- [ ] **Step 3: Add the config and test script**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node", include: ["lib/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

In `package.json`, add to `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write a smoke test**

Create `lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("AWS Foundations Event")).toBe("aws-foundations-event");
  });

  it("strips punctuation", () => {
    expect(slugify("Cloud & Code: 2026!")).toBe("cloud-code-2026");
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: 2 passing. If the second fails, read `lib/utils.ts:slugify` and correct
the expectation to match actual behaviour — do not change `slugify`.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/__tests__/smoke.test.ts
git commit -m "chore: add vitest"
```

---

### Task 2: Move Supabase credentials server-side

**Files:**
- Modify: `lib/supabase.ts:1-10, 50-56`
- Modify: `.env.local`, `.env.example`
- Modify: `README.md` (env block)

**Interfaces:**
- Consumes: nothing.
- Produces: unchanged exports — `supabase`, `getServiceSupabase()`, `getWriteSupabase()`, `isSupabaseConfigured`, `hasServiceRole`, `supabaseStatus()`. Only the env var names change.

- [ ] **Step 1: Rename the variables in both env files**

In `.env.local` and `.env.example`, rename:
- `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `SUPABASE_ANON_KEY`

Leave `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN` and `NEXT_PUBLIC_SITE_URL`
alone. `NEXT_PUBLIC_SITE_URL` is genuinely public — it is a URL, not a secret.

- [ ] **Step 2: Read the new names, with a transition warning**

In `lib/supabase.ts`, replace lines 3-4:

```ts
// Server-only. Not NEXT_PUBLIC_: nothing in the browser talks to Supabase
// directly, and the prefix would silently inline these into the client bundle
// the moment any client component imported this module.
const legacyUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const legacyAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const supabaseUrl = (process.env.SUPABASE_URL || legacyUrl).trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || legacyAnonKey).trim();

if (legacyUrl || legacyAnonKey) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are deprecated. Rename them to SUPABASE_URL/SUPABASE_ANON_KEY so they cannot reach the browser bundle."
  );
}
```

Update the two strings in `supabaseStatus()` (lines ~52-53) to name
`SUPABASE_URL` and `SUPABASE_ANON_KEY`.

- [ ] **Step 3: Verify the app still reaches the database**

```bash
npm run dev
```

Then in another shell:

```bash
curl -s "http://localhost:3000/api/register?eventId=event-1"
```

Expected: `"connected":true` and a numeric `registered`. If `registered` is
`null`, the rename broke credential loading — check for a typo before continuing.

- [ ] **Step 4: Prove the keys are absent from the browser bundle**

Stop the dev server first — `next dev` and `next build` share `.next` and
corrupt each other.

```bash
rm -rf .next && npm run build
grep -rl "$(grep -oP '(?<=^SUPABASE_ANON_KEY=")[^"]*' .env.local)" .next/static | head
```

Expected: no output. Then confirm the search itself works:

```bash
grep -rl "Slots Booked" .next/static | head -2
```

Expected: at least one file. A negative result is only meaningful once this
control passes.

- [ ] **Step 5: Update the README env block, then commit**

```bash
git add lib/supabase.ts .env.example README.md
git commit -m "refactor: make supabase credentials server-only"
```

---

### Task 3: Password hashing and signed session tokens

**Files:**
- Create: `lib/password.ts`, `lib/adminSession.ts`
- Create: `lib/__tests__/password.test.ts`, `lib/__tests__/adminSession.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `hashPassword(password: string): Promise<string>` → `scrypt:<saltHex>:<hashHex>`
  - `verifyPassword(password: string, stored: string): Promise<boolean>`
  - `ADMIN_COOKIE = "sxc_admin_session"`, `SESSION_TTL_MS`
  - `createSessionToken(secret, username, expiresAt): string` → `<username>.<expiresAt>.<hmac>`
  - `readSessionToken(secret, token, now?): string | null` — returns the username, or null
  - `isValidUsername(u: string): boolean` — `/^[a-z0-9_-]{3,32}$/`

- [ ] **Step 1: Write the failing tests**

`password.test.ts` must cover: a hash verifies against its own password; a
different password fails; two hashes of the same password differ (random salt);
malformed stored values return false rather than throwing.

`adminSession.test.ts` must cover: a freshly issued token reads back the
username; a different secret returns null; an expired token returns null; a
token whose expiry was edited returns null; a token whose *username* was swapped
returns null; malformed input returns null.

- [ ] **Step 2: Run to verify they fail**

Run: `npm test` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement both modules**

`lib/password.ts` uses `randomBytes(16)` for salt and `scrypt(password, salt, 64)`,
comparing with `timingSafeEqual`. `lib/adminSession.ts` signs
`` `${username}.${expiresAt}` `` with HMAC-SHA256 and returns the username only
when the signature matches AND the expiry is in the future.

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add lib/password.ts lib/adminSession.ts lib/__tests__
git commit -m "feat: password hashing and session tokens"
```

---

### Task 4: Admin users, login, and route gating

**Files:**
- Modify: `supabase/schema.sql` (admin_users table)
- Create: `scripts/create-admin.mjs`
- Create: `middleware.ts`
- Create: `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`, `app/api/admin/me/route.ts`
- Create: `app/admin/login/page.tsx`
- Modify: `package.json` (`admin:create` script), `.env.local`, `.env.example`

**Interfaces:**
- Consumes: everything from Task 3; `getServiceSupabase`; `clientKey`/`rateLimit`.
- Produces: `/admin/*` and `/api/admin/*` require a valid session. `GET /api/admin/me` returns `{ username, displayName }` for the UI header.

- [ ] **Step 1: Add the admin_users table**

```sql
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null check (username ~ '^[a-z0-9_-]{3,32}$'),
  password_hash text not null,
  display_name  text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- Service role only. No policy is created, and the public roles are stripped of
-- every privilege: password hashes must be unreachable with the anon key.
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
```

- [ ] **Step 2: Add `ADMIN_SESSION_SECRET`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local` as `ADMIN_SESSION_SECRET`. Remove the now-unused
`ADMIN_API_TOKEN`. There is no `ADMIN_PASSWORD` — passwords live only as hashes
in the database.

- [ ] **Step 3: Write `scripts/create-admin.mjs`**

Reads `.env.local`, takes `<username> <password> [displayName]`, refuses a
password under 10 characters or a username failing `isValidUsername`, hashes with
scrypt, and upserts via the service role. Wire it as
`"admin:create": "node scripts/create-admin.mjs"`.

- [ ] **Step 4: Write middleware, login, logout, and me routes**

Middleware allows `/admin/login` and `/api/admin/login` through, otherwise
requires `readSessionToken` to return a username; API paths get `401`, page
paths redirect to `/admin/login`.

Login: rate limited 5/15min per address; looks up the username; verifies the
hash; **returns the same "Incorrect username or password." for an unknown user
and a wrong password**, so the response cannot be used to enumerate accounts;
runs `verifyPassword` even when the user is missing, against a dummy hash, so
the timing does not leak existence either. Stamps `last_login_at`, sets the
cookie.

- [ ] **Step 5: Write the login page**

`app/admin/login/page.tsx` — client component with **username and password**
fields, matching the site's visual language (`navy-900/80` panel,
`aws-orange` accents, `font-mono` labels).

- [ ] **Step 6: Verify**

Create an account, then confirm: wrong password → 401 with the generic message;
unknown username → the identical message; correct credentials → `Set-Cookie`
with `HttpOnly` and `SameSite=Strict`; `/admin` redirects to `/admin/login`
without a cookie; `/api/admin/registrations` returns 401 without a cookie.

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql scripts middleware.ts app/api/admin app/admin/login package.json .env.example
git commit -m "feat: credential login for admin"
```

---

### Task 5: TTL cache for seat counts

**Files:**
- Create: `lib/cache.ts`
- Create: `lib/__tests__/cache.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `getCached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T>`
  - `invalidate(key: string): void`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/cache.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCached, invalidate } from "@/lib/cache";

describe("getCached", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls the loader once within the TTL", async () => {
    const load = vi.fn().mockResolvedValue(1);
    expect(await getCached("k1", 1000, load)).toBe(1);
    expect(await getCached("k1", 1000, load)).toBe(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL expires", async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await getCached("k2", 1000, load)).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(await getCached("k2", 1000, load)).toBe(2);
  });

  it("reloads after invalidate", async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await getCached("k3", 60_000, load)).toBe(1);
    invalidate("k3");
    expect(await getCached("k3", 60_000, load)).toBe(2);
  });

  it("does not cache a rejected loader", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(7);
    await expect(getCached("k4", 60_000, load)).rejects.toThrow("boom");
    expect(await getCached("k4", 60_000, load)).toBe(7);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/cache`.

- [ ] **Step 3: Implement**

Create `lib/cache.ts`:

```ts
/**
 * Tiny in-process TTL cache.
 *
 * Only for values that are safe to serve slightly stale AND carry no personal
 * data. Seat counts qualify: they are integers, and a listing page otherwise
 * makes one database round-trip per event card per visitor.
 *
 * Registrations and contact messages do NOT qualify and must never be stored
 * here.
 */
interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export async function getCached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  // Awaited before storing, so a rejected load leaves no entry behind and the
  // next caller retries rather than inheriting a failure.
  const value = await load();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidate(key: string): void {
  store.delete(key);
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add lib/cache.ts lib/__tests__/cache.test.ts
git commit -m "feat: ttl cache helper"
```

---

### Task 6: Events table in Supabase

**Files:**
- Modify: `supabase/schema.sql` (add events table before the RLS section; drop `event_capacity`)

**Interfaces:**
- Consumes: nothing.
- Produces: `public.events` with `max_seats`; `event_seats()` and `register_for_event()` read capacity from it; `public.event_capacity` no longer exists.

- [ ] **Step 1: Add the events table**

Insert into `supabase/schema.sql`, replacing the entire "3. EVENT CAPACITY"
section:

```sql
-- =================================================================
-- 3. EVENTS
--
-- Events used to be static content in lib/data/initialData.ts. They are rows
-- now so the admin UI can create and edit them. max_seats lives here rather
-- than in a separate capacity table: one row per event means the limit cannot
-- drift from the event it describes.
-- =================================================================
create table if not exists public.events (
  id                   text primary key,
  title                text not null,
  slug                 text unique not null,
  description          text not null,
  full_details         text,
  date                 timestamptz not null,
  time                 text not null,
  venue                text not null,
  category             text not null default 'WORKSHOP'
                         check (category in ('WORKSHOP','HACKATHON','SEMINAR','BOOTCAMP')),
  status               text not null default 'UPCOMING'
                         check (status in ('UPCOMING','ONGOING','COMPLETED')),
  is_featured          boolean not null default false,
  image_url            text,
  banner_url           text,
  speaker_names        text[] not null default '{}',
  prerequisites        text[] not null default '{}',
  agenda               jsonb not null default '[]'::jsonb,
  max_seats            integer not null default 100 check (max_seats > 0),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (date desc);

-- Carry over any capacity rows from the previous design, then retire the table.
insert into public.events (id, title, slug, description, date, time, venue, max_seats)
select c.event_id,
       'Untitled event (imported)',
       'imported-' || c.event_id,
       'Imported from event_capacity. Edit in the admin area.',
       now(), 'TBC', 'TBC', c.max_seats
from public.event_capacity c
on conflict (id) do nothing;

drop table if exists public.event_capacity;
```

- [ ] **Step 2: Point the two functions at `events`**

In `event_seats()`, replace the capacity subquery:

```sql
    (select e.max_seats
       from public.events e
      where e.id = p_event_id);
```

In `register_for_event()`, replace the capacity lookup:

```sql
  select max_seats into v_max
  from public.events
  where id = p_event_id;
```

Update its `SXC02` message to say "Add the event in the admin area." rather than
referring to `event_capacity`.

- [ ] **Step 3: Grant public read on events, keep everything else locked**

In the RLS section, add:

```sql
alter table public.events enable row level security;

drop policy if exists "Events are publicly readable" on public.events;
create policy "Events are publicly readable"
  on public.events for select to anon, authenticated using (true);

grant select on public.events to anon, authenticated;
revoke insert, update, delete on public.events from anon, authenticated;
```

Events are public content, so read access is correct here — unlike
registrations. Writes stay service-role only.

- [ ] **Step 4: Apply and verify**

Run the whole file in the Supabase SQL Editor. Then:

```bash
URL=$(grep -oP '(?<=^SUPABASE_URL=")[^"]*' .env.local)
SK=$(grep -oP '(?<=^SUPABASE_SERVICE_ROLE_KEY=")[^"]*' .env.local)
curl -s "$URL/rest/v1/events?select=id,slug,max_seats" -H "apikey: $SK" -H "Authorization: Bearer $SK"
```

Expected: the imported `event-1` row with `max_seats` 100. Confirm
`event_capacity` is gone:

```bash
curl -s -o /dev/null -w "event_capacity -> %{http_code}\n" "$URL/rest/v1/event_capacity?select=*" -H "apikey: $SK" -H "Authorization: Bearer $SK"
```

Expected: 404.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: events table, fold in max_seats"
```

---

### Task 7: Read and write events through Supabase

**Files:**
- Modify: `lib/db/index.ts`
- Create: `lib/db/eventMapper.ts`
- Create: `lib/__tests__/eventMapper.test.ts`

**Interfaces:**
- Consumes: `getWriteSupabase`, `getServiceSupabase`, `isSupabaseConfigured` from `lib/supabase`; `getCached`/`invalidate` from Task 5.
- Produces:
  - `rowToEvent(row: EventRow): EventData` and `eventToRow(e: Partial<EventData>): Partial<EventRow>` from `lib/db/eventMapper`
  - `db.listEvents(): Promise<EventData[]>` — database first, seeded fallback
  - `db.findEvent(idOrSlug: string): Promise<EventData | null>`
  - `db.createEvent(input: Omit<EventData, "id" | "currentRegistrations">): Promise<EventData>`
  - `db.updateEvent(id: string, patch: Partial<EventData>): Promise<EventData>`
  - `db.removeEvent(id: string): Promise<boolean>`

**REPLACES existing synchronous methods.** `lib/db/index.ts` already defines
`getEvents()`, `getEventBySlug()`, `addEvent()`, `updateEvent()` and
`deleteEvent()` over the in-memory `this.events` array. `updateEvent` collides
by name and changes from sync to async. Delete all five and update every caller:

| Caller | Was | Becomes |
|---|---|---|
| `app/page.tsx:17` | `db.getEvents()` | `await db.listEvents()` |
| `app/events/[slug]/page.tsx:17,39` | `db.getEvents()` | `await db.listEvents()` |
| `app/events/[slug]/page.tsx:23,33` | `db.getEventBySlug(slug)` | `await db.findEvent(slug)` |
| `app/api/events/route.ts:34` | `db.getEvents()` | `await db.listEvents()` |
| `app/api/register/route.ts:114` | `db.getEventBySlug(id)` | `await db.findEvent(id)` |

Two callers are *inside* `lib/db/index.ts` itself and are easy to miss:
`getSeatInfo()` calls `this.getEventBySlug(eventId)`, and `registerForEvent()`
does `this.events.find(...)`. Both must become `await this.findEvent(...)`,
which makes `getSeatInfo` and `registerForEvent` depend on an async lookup they
previously did synchronously. `this.events` stops existing; keep the seed
available as a private `seedEvents = [...INITIAL_EVENTS]` for the fallback only.

- [ ] **Step 1: Write the mapper tests**

Create `lib/__tests__/eventMapper.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { rowToEvent, eventToRow } from "@/lib/db/eventMapper";

const row = {
  id: "event-1",
  title: "AWS Foundations",
  slug: "aws-foundations",
  description: "Intro",
  full_details: "Details",
  date: "2026-08-30T02:00:00Z",
  time: "2-4 PM",
  venue: "Bonet Lab",
  category: "BOOTCAMP",
  status: "UPCOMING",
  is_featured: true,
  image_url: "https://images.unsplash.com/a",
  banner_url: "https://images.unsplash.com/b",
  speaker_names: ["A"],
  prerequisites: ["Laptop"],
  agenda: [{ time: "10:00", title: "Kickoff", description: "Welcome" }],
  max_seats: 100,
};

describe("event mapping", () => {
  it("maps snake_case columns onto the camelCase shape the UI uses", () => {
    const e = rowToEvent(row as any);
    expect(e.isFeatured).toBe(true);
    expect(e.maxSeats).toBe(100);
    expect(e.fullDetails).toBe("Details");
    expect(e.imageUrl).toBe("https://images.unsplash.com/a");
    expect(e.speakerNames).toEqual(["A"]);
  });

  it("defaults currentRegistrations, which is not a column", () => {
    expect(rowToEvent(row as any).currentRegistrations).toBe(0);
  });

  it("survives null array and jsonb columns", () => {
    const sparse = { ...row, speaker_names: null, prerequisites: null, agenda: null };
    const e = rowToEvent(sparse as any);
    expect(e.speakerNames).toEqual([]);
    expect(e.prerequisites).toEqual([]);
    expect(e.agenda).toEqual([]);
  });

  it("round-trips back to columns", () => {
    expect(eventToRow(rowToEvent(row as any))).toMatchObject({
      is_featured: true,
      max_seats: 100,
      image_url: "https://images.unsplash.com/a",
    });
  });

  it("omits undefined fields so a patch does not blank columns", () => {
    expect(eventToRow({ title: "New" })).toEqual({ title: "New" });
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/db/eventMapper`.

- [ ] **Step 3: Implement the mapper**

Create `lib/db/eventMapper.ts`:

```ts
import { EventData } from "@/lib/data/initialData";

export interface EventRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_details: string | null;
  date: string;
  time: string;
  venue: string;
  category: EventData["category"];
  status: EventData["status"];
  is_featured: boolean;
  image_url: string | null;
  banner_url: string | null;
  speaker_names: string[] | null;
  prerequisites: string[] | null;
  agenda: EventData["agenda"] | null;
  max_seats: number;
}

export function rowToEvent(row: EventRow): EventData {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    fullDetails: row.full_details ?? row.description,
    date: row.date,
    time: row.time,
    venue: row.venue,
    category: row.category,
    status: row.status,
    isFeatured: row.is_featured,
    imageUrl: row.image_url ?? "",
    bannerUrl: row.banner_url ?? "",
    speakerNames: row.speaker_names ?? [],
    prerequisites: row.prerequisites ?? [],
    agenda: row.agenda ?? [],
    maxSeats: row.max_seats,
    // Not a column: seats taken is counted from event_registrations via the
    // event_seats RPC, never denormalised onto the event row.
    currentRegistrations: 0,
  };
}

const TO_COLUMN: Record<string, keyof EventRow> = {
  id: "id",
  title: "title",
  slug: "slug",
  description: "description",
  fullDetails: "full_details",
  date: "date",
  time: "time",
  venue: "venue",
  category: "category",
  status: "status",
  isFeatured: "is_featured",
  imageUrl: "image_url",
  bannerUrl: "banner_url",
  speakerNames: "speaker_names",
  prerequisites: "prerequisites",
  agenda: "agenda",
  maxSeats: "max_seats",
};

/** Undefined keys are dropped so a PATCH never blanks a column it omitted. */
export function eventToRow(event: Partial<EventData>): Partial<EventRow> {
  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(TO_COLUMN)) {
    const value = (event as Record<string, unknown>)[key];
    if (value !== undefined) row[column] = value;
  }
  return row as Partial<EventRow>;
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`
Expected: 5 passing.

- [ ] **Step 5: Add the database-backed event methods**

In `lib/db/index.ts`, add the five methods from the Interfaces block.
`listEvents()` wraps its query in `getCached("events:all", 60_000, …)` and
returns `INITIAL_EVENTS` when the query errors — logging the error, because a
silent fallback hides an outage. Every mutation calls `invalidate("events:all")`.

`getSeatInfo` keeps working unchanged; wrap its RPC call in
`getCached(\`seats:${id}\`, 20_000, …)` and call
`invalidate(\`seats:${id}\`)` at the end of a successful `registerForEvent`.

- [ ] **Step 6: Verify the fallback**

Temporarily set `SUPABASE_URL` to `https://unreachable000000.supabase.co`,
restart dev, and load `/events`. Expected: the seeded event still renders and
the server log shows the fallback warning. Restore the real URL afterwards.

- [ ] **Step 7: Commit**

```bash
git add lib/db lib/__tests__/eventMapper.test.ts
git commit -m "feat: read and write events through supabase"
```

---

### Task 8: Public event pages on ISR with fallback

**Files:**
- Modify: `app/events/page.tsx`
- Modify: `app/events/[slug]/page.tsx`
- Modify: `app/page.tsx:17` — the homepage lists events too and breaks if missed

**Interfaces:**
- Consumes: `db.listEvents()`, `db.findEvent()` from Task 7.
- Produces: both pages render database events, revalidating every 60s.

- [ ] **Step 1: Switch both pages to the async database reads**

Add to each file:

```ts
export const revalidate = 60;
```

Replace `db.getEvents()` with `await db.listEvents()` and
`db.getEventBySlug(slug)` with `await db.findEvent(slug)`, making the page
components `async`.

In `app/events/[slug]/page.tsx`, `generateStaticParams` should call
`db.listEvents()` and return the slugs; add `export const dynamicParams = true;`
so an event created later renders on first request rather than 404ing.

- [ ] **Step 2: Verify**

```bash
rm -rf .next && npm run build
```

Expected: `/events` and `/events/[slug]` listed as ISR. Then `npm run dev` and
confirm both pages render, and that the seat bar still shows live counts.

- [ ] **Step 3: Commit**

```bash
git add app/events
git commit -m "feat: event pages read from the database via ISR"
```

---

### Task 9: Registrations API with CSV export

**Files:**
- Create: `app/api/admin/registrations/route.ts`
- Create: `lib/csv.ts`
- Create: `lib/__tests__/csv.test.ts`
- Modify: `lib/db/index.ts` (add `listRegistrations`)

**Interfaces:**
- Consumes: `getServiceSupabase`; middleware from Task 4 already enforced auth.
- Produces:
  - `toCsv(rows: Record<string, unknown>[], columns: string[]): string`
  - `RegistrationRow = { id: string; event_id: string; event_title: string | null; full_name: string; uid: string; email: string; academic_year: string; stream: string; college: string; created_at: string }`
  - `db.listRegistrations(opts: { eventId?: string; limit?: number; offset?: number }): Promise<RegistrationRow[]>`
  - `GET /api/admin/registrations` → JSON, or CSV with `?format=csv`

- [ ] **Step 1: Write the CSV tests**

Create `lib/__tests__/csv.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("writes a header row from the column list", () => {
    expect(toCsv([], ["name", "email"])).toBe("name,email");
  });

  it("quotes values containing a comma", () => {
    const csv = toCsv([{ name: "Sinha, Eshaan" }], ["name"]);
    expect(csv.split("\n")[1]).toBe('"Sinha, Eshaan"');
  });

  it("doubles embedded quotes", () => {
    const csv = toCsv([{ name: 'He said "hi"' }], ["name"]);
    expect(csv.split("\n")[1]).toBe('"He said ""hi"""');
  });

  it("quotes values containing newlines", () => {
    const csv = toCsv([{ note: "line1\nline2" }], ["note"]);
    expect(csv.split("\n")[1]).toBe('"line1');
  });

  it("renders null and undefined as empty", () => {
    expect(toCsv([{ a: null, b: undefined }], ["a", "b"]).split("\n")[1]).toBe(",");
  });

  it("neutralises values that spreadsheets would treat as formulas", () => {
    // A leading = + - @ makes Excel/Sheets execute the cell.
    expect(toCsv([{ a: "=CMD()" }], ["a"]).split("\n")[1]).toBe("'=CMD()");
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/csv`.

- [ ] **Step 3: Implement**

Create `lib/csv.ts`:

```ts
const NEEDS_QUOTING = /[",\n\r]/;
// Excel and Google Sheets execute a cell beginning with any of these.
const FORMULA_PREFIX = /^[=+\-@]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (FORMULA_PREFIX.test(s)) s = `'${s}`;
  if (NEEDS_QUOTING.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const lines = [columns.map(cell).join(",")];
  for (const row of rows) lines.push(columns.map((c) => cell(row[c])).join(","));
  return lines.join("\n");
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`
Expected: 6 passing.

- [ ] **Step 5: Add `db.listRegistrations` and the route**

`listRegistrations` uses `getServiceSupabase()` (returns `[]` and logs if
absent), selects
`id,event_id,event_title,full_name,uid,email,academic_year,stream,college,created_at`,
orders by `created_at` descending, applies an optional `eventId` filter and a
`limit`/`offset`.

The route returns JSON by default. With `?format=csv` it returns `toCsv(...)`
with `Content-Type: text/csv; charset=utf-8` and
`Content-Disposition: attachment; filename="registrations-<date>.csv"`.
Both responses set `Cache-Control: no-store` — this is the PII path, so it is
never cached anywhere, and `getCached` must not be used here.

- [ ] **Step 6: Verify**

```bash
COOKIE=$(curl -s -i -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"password\":\"$(grep -oP '(?<=^ADMIN_PASSWORD=")[^"]*' .env.local)\"}" | grep -i '^set-cookie' | sed 's/set-cookie: //I' | cut -d';' -f1)
curl -s -H "Cookie: $COOKIE" "http://localhost:3000/api/admin/registrations" | head -c 300; echo
curl -s -H "Cookie: $COOKIE" "http://localhost:3000/api/admin/registrations?format=csv"
curl -s -o /dev/null -w "no cookie -> %{http_code}\n" "http://localhost:3000/api/admin/registrations"
```

Expected: the real registration in JSON and CSV; `401` without the cookie.

- [ ] **Step 7: Commit**

```bash
git add lib/csv.ts lib/__tests__/csv.test.ts app/api/admin/registrations lib/db/index.ts
git commit -m "feat: admin registrations api with csv export"
```

---

### Task 10: Messages API

**Files:**
- Create: `app/api/admin/messages/route.ts`
- Modify: `app/api/contact/route.ts` (remove the admin GET)
- Modify: `lib/db/index.ts` (add `markMessageRead`, `deleteMessage`)

**Interfaces:**
- Consumes: `db.getMessages()` (exists), `getServiceSupabase`.
- Produces: `GET`, `PATCH` (`{id, isRead}`), `DELETE` (`?id=`) on `/api/admin/messages`.

- [ ] **Step 1: Move the admin read**

Delete the `GET` handler from `app/api/contact/route.ts` along with its now-unused
`requireAdmin` and `hasServiceRole` imports. The public `POST` stays.

- [ ] **Step 2: Add the mutations to `lib/db/index.ts`**

```ts
async markMessageRead(id: string, isRead: boolean): Promise<boolean> {
  const admin = getServiceSupabase();
  if (!admin) return false;
  const { error } = await admin.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) { console.error("[supabase] mark read failed:", error.message); return false; }
  return true;
}

async deleteMessage(id: string): Promise<boolean> {
  const admin = getServiceSupabase();
  if (!admin) return false;
  const { error } = await admin.from("contact_messages").delete().eq("id", id);
  if (error) { console.error("[supabase] delete message failed:", error.message); return false; }
  return true;
}
```

- [ ] **Step 3: Write the route**

`GET` returns `await db.getMessages()`; `PATCH` reads `{id, isRead}` from the
body; `DELETE` reads `?id=`. All three set `Cache-Control: no-store` and
`export const dynamic = "force-dynamic"`. Auth is already handled by middleware.

- [ ] **Step 4: Verify**

Using `$COOKIE` from Task 9: `GET` lists messages, `PATCH` flips `is_read`,
`DELETE` removes a message, and all three return `401` without the cookie.
Confirm `GET /api/contact` now returns `405`.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/messages app/api/contact lib/db/index.ts
git commit -m "feat: admin messages api"
```

---

### Task 11: Events admin API

**Files:**
- Create: `app/api/admin/events/route.ts`
- Modify: `app/api/events/route.ts` (strip POST/DELETE, leave the public GET)

**Interfaces:**
- Consumes: `db.createEvent`, `db.updateEvent`, `db.removeEvent` from Task 7.
- Produces: `POST`, `PATCH`, `DELETE` on `/api/admin/events`, each revalidating the public pages.

- [ ] **Step 1: Strip the old admin handlers**

Remove `POST` and `DELETE` from `app/api/events/route.ts` along with the
`requireAdmin`, `slugify` and image-allowlist code they used. Keep the public
`GET`, switching it to `await db.listEvents()`.

- [ ] **Step 2: Write the admin route**

Validate as `/api/events` used to: required title/description/venue, length
caps, category against the four allowed values, `max_seats` a positive integer,
and image URLs restricted to the https allowlist (`images.unsplash.com`,
`avatars.githubusercontent.com`, `a0.awsstatic.com`, `raw.githubusercontent.com`,
`upload.wikimedia.org`) — the same hosts as `next.config.mjs`, since an image
from anywhere else will not render anyway.

After every successful mutation:

```ts
import { revalidatePath } from "next/cache";
revalidatePath("/events");
revalidatePath(`/events/${event.slug}`);
```

- [ ] **Step 3: Verify end to end**

Create an event via `POST`, confirm it appears at `/events` without a rebuild,
`PATCH` its title and confirm the change, then `DELETE` it and confirm it is
gone. Confirm all three return `401` without the cookie.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/events app/api/events
git commit -m "feat: admin events api"
```

---

### Task 12: Rebuild the admin UI

**Files:**
- Create: `components/admin/AdminShell.tsx`, `OverviewTab.tsx`, `RegistrationsTab.tsx`, `MessagesTab.tsx`, `EventsTab.tsx`, `useAdminData.ts`
- Modify: `app/admin/page.tsx` (rewrite as a shell)

**Interfaces:**
- Consumes: every `/api/admin/*` route from Tasks 9-11.
- Produces: the working dashboard.

- [ ] **Step 1: Write `useAdminData.ts`**

One hook per resource — `useRegistrations()`, `useMessages()`, `useAdminEvents()`
— each returning `{ data, loading, error, refresh }`, fetching with
`cache: "no-store"`, and redirecting to `/admin/login` on a `401`. Data lives in
React state only; there is no HTTP caching on this path by design.

- [ ] **Step 2: Build the tabs**

- `RegistrationsTab` — table of name, UID, email, year, stream, event, date; a
  filter by event; a "Download CSV" button linking to
  `/api/admin/registrations?format=csv`; a row count; a Refresh button.
- `MessagesTab` — list with unread emphasis, mark read/unread, delete with a
  confirm.
- `EventsTab` — list with edit and delete; a create/edit form covering title,
  description, date, time, venue, category, status, max seats, image URL.
- `OverviewTab` — counts of registrations, unread messages, upcoming events.

Reuse the existing visual language: `navy-900/80` panels, `aws-orange` accents,
`font-mono` labels, `rounded-2xl`.

- [ ] **Step 3: Rewrite `app/admin/page.tsx`**

A client component holding only tab state and rendering `AdminShell` plus the
active tab. It must no longer import `INITIAL_*` seed data — all four tabs read
from the API. Add a Sign out button posting to `/api/admin/logout` then
redirecting to `/admin/login`.

- [ ] **Step 4: Verify in a browser**

Sign in at `/admin/login`; confirm each tab loads real data; download the CSV
and open it; create an event and confirm it appears on `/events`; mark a message
read; sign out and confirm `/admin` redirects to the login page.

- [ ] **Step 5: Full verification**

```bash
npm test && npx tsc --noEmit && npx next lint && rm -rf .next && npm run build
```

Expected: tests pass, no type errors, no lint errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/admin components/admin
git commit -m "feat: rebuild admin dashboard on real data"
```

---

## Deferred

Projects, team members and gallery remain static in `initialData.ts`; their
admin tabs are removed rather than left as non-functional mockups, so nothing in
the UI claims to save data that it drops. Migrating them is a separate plan.
