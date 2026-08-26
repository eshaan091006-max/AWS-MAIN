-- =================================================================
-- SXC AWS Club — Supabase schema
--
-- Tables:
--   events               event content, managed from /admin
--   event_registrations  signups, write-only for the public key
--   contact_messages     contact form submissions
--   admin_users          admin credentials (scrypt hashes)
--
-- Projects, team and gallery are still static content in
-- lib/data/initialData.ts and need no tables.
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
-- 3. EVENTS
--
-- Events used to be static content in lib/data/initialData.ts, which meant an
-- event created from the admin UI existed only in that browser tab. They are
-- rows now, so creating one actually persists.
--
-- max_seats lives on the event rather than in a separate capacity table: one
-- row per event means the seat limit cannot drift from the event it describes.
-- It must stay server-authoritative — anyone can call the registration function
-- with the public anon key, and a caller-supplied limit is one the caller can
-- raise to anything.
-- =================================================================
create table if not exists public.events (
  id            text primary key,
  title         text not null,
  slug          text unique not null,
  description   text not null,
  full_details  text,
  date          timestamptz not null,
  time          text not null,
  venue         text not null,
  category      text not null default 'WORKSHOP'
                  check (category in ('WORKSHOP','HACKATHON','SEMINAR','BOOTCAMP')),
  status        text not null default 'UPCOMING'
                  check (status in ('UPCOMING','ONGOING','COMPLETED')),
  is_featured   boolean not null default false,
  image_url     text,
  banner_url    text,
  speaker_names text[] not null default '{}',
  prerequisites text[] not null default '{}',
  agenda        jsonb not null default '[]'::jsonb,
  max_seats     integer not null default 100 check (max_seats > 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (date desc);

-- Seed the one event that previously lived in initialData.ts, so the site has
-- content the moment this runs. ON CONFLICT DO NOTHING keeps re-runs safe and
-- never overwrites an edit made in the admin UI.
insert into public.events (
  id, title, slug, description, full_details, date, time, venue,
  category, status, is_featured, image_url, banner_url,
  speaker_names, prerequisites, agenda, max_seats
) values (
  'event-1',
  'AWS Foundations Event',
  'aws-foundations',
  'An introductory event to AWS and Cloud Computing.',
  'Learn the basics of cloud computing and AWS services with hands-on labs and real-world examples.',
  '2026-08-30T02:00:00Z',
  '02:00 PM - 04:00 PM IST',
  'Bonet Lab, St. Xavier''s College',
  'BOOTCAMP', 'UPCOMING', true,
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
  ARRAY['Dr. Rajesh Kulkarni (AWS Principal Architect)','Aarav Sharma (SXC AWS Lead)','Sneha Mukherjee (AI Researcher)'],
  ARRAY['Basic understanding of programming','Laptop with modern web browser','AWS Free Tier account (optional)'],
  '[{"time":"09:30 AM","title":"Registration & Welcome Keynote","description":"Opening address on the state of global cloud infrastructure in 2026."},
    {"time":"10:30 AM","title":"Hands-on: Serverless Microservices with AWS Lambda & CDK","description":"Live code-along: build and deploy an API from scratch."},
    {"time":"01:00 PM","title":"Networking Lunch & AWS Architecture Showcase","description":"Explore student projects and chat with AWS certified mentors."},
    {"time":"02:15 PM","title":"Generative AI on AWS: Building with Amazon Bedrock","description":"Deploying production LLM applications with Vector search on RDS Aurora."},
    {"time":"04:30 PM","title":"AWS Cloud Jam Competition & Award Ceremony","description":"Speed troubleshooting challenge with AWS merchandise prizes."}]'::jsonb,
  100
) on conflict (id) do nothing;

-- Carry over any capacity rows created by the earlier design, then retire it.
--
-- Guarded by to_regclass: a plain SELECT against public.event_capacity is a
-- parse-time reference, so on any project where that table was never created
-- (or was already dropped by a previous run of this file) the whole script
-- would abort here with 42P01 before creating anything. The DO block only
-- plans its body when the table actually exists.
do $$
begin
  if to_regclass('public.event_capacity') is not null then
    insert into public.events (id, title, slug, description, date, time, venue, max_seats)
    select c.event_id,
           'Untitled event (imported)',
           'imported-' || c.event_id,
           'Imported from event_capacity. Edit this in the admin area.',
           now(), 'TBC', 'TBC', c.max_seats
    from public.event_capacity c
    on conflict (id) do nothing;

    drop table public.event_capacity;
  end if;
end $$;


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
alter table public.events              enable row level security;

-- Events are public content, unlike registrations: the site has to render them.
-- Reads are open; writes stay service-role only, so nobody can create or edit
-- an event (or raise its max_seats) with the anon key.
drop policy if exists "Events are publicly readable" on public.events;
create policy "Events are publicly readable"
  on public.events for select to anon, authenticated using (true);

grant select on public.events to anon, authenticated;
revoke insert, update, delete on public.events from anon, authenticated;

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
revoke select, update, delete on public.contact_messages from anon, authenticated;
grant  insert on public.contact_messages to anon, authenticated;


-- =================================================================
-- 5. FUNCTIONS
--
-- Dropped by name before being recreated. CREATE OR REPLACE cannot change a
-- function's return type or argument list — it raises 42P13, or worse, leaves
-- an old signature behind as a second overload that PostgREST then reports as
-- ambiguous. Clearing every overload first makes this file safe to re-run
-- after any signature change.
-- =================================================================
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'event_seats',
        'event_registration_count',
        'register_for_event'
      )
  loop
    execute format('drop function if exists %s', fn.signature);
  end loop;
end $$;


-- =================================================================
-- 5a. SEAT COUNT RPC
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
    (select e.max_seats
       from public.events e
      where e.id = p_event_id);
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
  from public.events
  where id = p_event_id;

  if v_max is null then
    raise exception 'Unknown event %. Create it in the admin area first.', p_event_id
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
-- 7. ADMIN USERS
--
-- Credentials for the admin area. Passwords are stored as scrypt digests
-- (`scrypt:<saltHex>:<hashHex>`) produced by lib/password.ts — never plaintext,
-- never a bare SHA.
--
-- This table is service-role only. No RLS policy is created for it and every
-- privilege is revoked from the public roles, so the password hashes are
-- unreachable with the anon key even if that key is read out of a bundle.
--
-- Create the first account with:  npm run admin:create -- <username> <password>
-- =================================================================
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null check (username ~ '^[a-z0-9_-]{3,32}$'),
  password_hash text not null,
  display_name  text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;


-- =================================================================
-- 8. REFRESH THE API SCHEMA CACHE
--
-- PostgREST caches the schema, so a freshly created function can 404 on
-- first call until it reloads. Supabase usually reloads on its own; this
-- makes it immediate.
-- =================================================================
notify pgrst, 'reload schema';
