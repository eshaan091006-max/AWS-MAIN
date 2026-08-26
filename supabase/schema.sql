-- =================================================================
-- SXC AWS Club — Supabase schema
--
-- Covers the two pieces of the site that write to a database:
--   1. Event registration  (components/events/RegistrationModal.tsx)
--   2. Contact form        (app/contact/page.tsx)
--
-- Everything else on the site (event content, projects, team, gallery)
-- is static content in lib/data/initialData.ts and needs no tables.
--
-- HOW TO RUN
--   Supabase Dashboard > SQL Editor > New query > paste > Run.
--   Safe to re-run: every statement is idempotent.
-- =================================================================


-- =================================================================
-- 1. EVENT REGISTRATIONS
-- =================================================================
create table if not exists public.event_registrations (
  id            uuid primary key default gen_random_uuid(),

  -- Events live in lib/data/initialData.ts, so this is a plain
  -- identifier rather than a foreign key. Title and slug are copied in
  -- so an exported row stands on its own.
  event_id      text not null,
  event_title   text,
  event_slug    text,

  first_name    text not null,
  last_name     text,
  full_name     text generated always as
                  (btrim(first_name || ' ' || coalesce(last_name, ''))) stored,
  uid           text not null,
  email         text not null,
  academic_year text not null,
  stream        text not null,
  college       text not null default 'St. Xavier''s College',

  created_at    timestamptz not null default now()
);

-- One registration per email per event. The API relies on this
-- constraint (Postgres error 23505) to detect duplicates, because the
-- anon key deliberately has no read access to this table.
create unique index if not exists event_registrations_event_email_key
  on public.event_registrations (event_id, lower(email));

create index if not exists event_registrations_event_id_idx
  on public.event_registrations (event_id);

create index if not exists event_registrations_created_at_idx
  on public.event_registrations (created_at desc);


-- =================================================================
-- 2. CONTACT MESSAGES
-- =================================================================
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null default 'General Inquiry',
  category   text not null default 'GENERAL',
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_unread_idx
  on public.contact_messages (created_at desc) where not is_read;




-- =================================================================
-- 3. EVENT CAPACITY
--
-- Seat limits are enforced in the database, so the limit itself has to
-- live in the database. It cannot be passed in by the caller: anyone
-- can invoke the registration function with the public anon key, and a
-- caller-supplied limit is a limit the caller can raise to anything.
--
-- ADDING A NEW EVENT: insert a row here as well, or registration for
-- that event is refused (deliberately — an event with no configured
-- capacity would otherwise accept unlimited signups).
-- =================================================================
create table if not exists public.event_capacity (
  event_id   text primary key,
  max_seats  integer not null check (max_seats > 0),
  updated_at timestamptz not null default now()
);

insert into public.event_capacity (event_id, max_seats)
values ('event-1', 100)
on conflict (event_id) do nothing;


-- =================================================================
-- 4. ROW LEVEL SECURITY
--
-- Both tables are write-only for the public anon key: anyone may submit
-- a registration or a message, nobody may read them back. Registrant
-- emails and UIDs are personal data and the anon key ships to the
-- browser, so reads are reserved for the service role, which bypasses
-- RLS entirely and is only ever used server-side.
-- =================================================================
alter table public.event_registrations enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.event_capacity      enable row level security;

-- Registrations are NOT insertable directly. Every signup goes through
-- register_for_event() below, which holds a lock while it checks the
-- seat count. A direct insert would skip that check, so the policy that
-- used to allow one is dropped here — re-running this file removes it.
drop policy if exists "Anyone can submit a registration" on public.event_registrations;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages
  for insert to anon, authenticated
  with check (true);

-- Defense in depth: the public roles hold no privileges of their own on
-- these tables, so even a mistakenly added policy grants nothing.
revoke all on public.event_registrations from anon, authenticated;
revoke all on public.event_capacity      from anon, authenticated;
revoke select, update, delete on public.contact_messages from anon, authenticated;
grant  insert on public.contact_messages to anon, authenticated;


-- =================================================================
-- 5. SEAT COUNT RPC
--
-- The site shows "X / Y seats reserved". The anon key cannot read the
-- registrations table, but this returns only an integer — no personal
-- data — so it is safe to expose.
-- =================================================================
create or replace function public.event_registration_count(p_event_id text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.event_registrations
  where event_id = p_event_id;
$$;

grant execute on function public.event_registration_count(text) to anon, authenticated;

-- Seats taken AND the configured limit, in one call.
--
-- The limit has to come from here rather than from initialData.ts: the
-- database is what enforces it, so if the page compared against its own
-- constant the two could disagree and the form would invite signups for an
-- event the database will refuse. max_seats is null when no capacity row
-- exists. Returns integers only, so it is safe for the anon key.
create or replace function public.event_seats(p_event_id text)
returns table (registered integer, max_seats integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::integer
       from public.event_registrations r
      where r.event_id = p_event_id),
    (select c.max_seats
       from public.event_capacity c
      where c.event_id = p_event_id);
$$;

grant execute on function public.event_seats(text) to anon, authenticated;


-- =================================================================
-- 6. ATOMIC REGISTRATION
--
-- THE POINT OF THIS FUNCTION: counting seats in the application and
-- then inserting is two round-trips. Two people clicking "register" on
-- the last seat at the same moment both read 99, both decide there is
-- room, and both insert — 101 registrations on a 100-seat event. That
-- is not hypothetical during a signup rush.
--
-- Here the count and the insert happen inside one transaction, behind a
-- lock keyed on the event, so the second caller waits for the first to
-- finish and then sees the true count.
--
-- Raises:
--   SXC01 — event is full
--   SXC02 — no capacity configured for this event
--   23505 — this email already registered for this event (unique index)
-- =================================================================
create or replace function public.register_for_event(
  p_event_id      text,
  p_event_title   text,
  p_event_slug    text,
  p_first_name    text,
  p_last_name     text,
  p_uid           text,
  p_email         text,
  p_academic_year text,
  p_stream        text,
  p_college       text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max   integer;
  v_taken integer;
  v_id    uuid;
begin
  select max_seats into v_max
  from public.event_capacity
  where event_id = p_event_id;

  if v_max is null then
    raise exception 'No capacity configured for event %. Add a row to public.event_capacity.', p_event_id
      using errcode = 'SXC02';
  end if;

  -- Transaction-scoped, and keyed on this event only: registrations for
  -- other events are unaffected. Released automatically when the function
  -- returns or raises.
  perform pg_advisory_xact_lock(hashtext(p_event_id));

  select count(*) into v_taken
  from public.event_registrations
  where event_id = p_event_id;

  if v_taken >= v_max then
    raise exception 'Event % is full (% of % seats taken)', p_event_id, v_taken, v_max
      using errcode = 'SXC01';
  end if;

  insert into public.event_registrations (
    event_id, event_title, event_slug,
    first_name, last_name, uid, email,
    academic_year, stream, college
  ) values (
    p_event_id, p_event_title, p_event_slug,
    p_first_name, nullif(p_last_name, ''), p_uid, lower(btrim(p_email)),
    p_academic_year, p_stream,
    coalesce(nullif(btrim(p_college), ''), 'St. Xavier''s College')
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.register_for_event(
  text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;


-- =================================================================
-- 7. REFRESH THE API SCHEMA CACHE
--
-- PostgREST caches the schema, so a freshly created function can 404 on
-- first call until it reloads. Supabase usually reloads on its own; this
-- makes it immediate.
-- =================================================================
notify pgrst, 'reload schema';
