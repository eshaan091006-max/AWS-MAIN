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

-- Attendance, marked from the admin area on the day of the event.
--
-- Separate from the registration itself: signing up and turning up are
-- different facts, and the club needs both — who reserved a seat, and who
-- actually attended. attended_by records which admin marked it, so an
-- attendance sheet is accountable rather than anonymous.
--
-- Added after the table shipped, so CREATE TABLE IF NOT EXISTS above is a
-- no-op on an existing project and would skip these.
alter table public.event_registrations
  add column if not exists attended boolean not null default false;
alter table public.event_registrations
  add column if not exists attended_at timestamptz;
alter table public.event_registrations
  add column if not exists attended_by text;


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
  -- Extra Co-curricular Credits awarded for attending.
  ecc_points    integer not null default 0 check (ecc_points >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Added after the table shipped, so CREATE TABLE IF NOT EXISTS above is a
-- no-op on an existing project and would silently skip it.
alter table public.events
  add column if not exists ecc_points integer not null default 0;

create index if not exists events_date_idx on public.events (date desc);

-- Seed the one event that previously lived in initialData.ts, so the site has
-- content the moment this runs. ON CONFLICT DO NOTHING keeps re-runs safe and
-- never overwrites an edit made in the admin UI.
insert into public.events (
  id, title, slug, description, full_details, date, time, venue,
  category, status, is_featured, image_url, banner_url,
  speaker_names, prerequisites, agenda, max_seats, ecc_points
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
  100,
  2
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
-- 3a. GALLERY
--
-- Photo entries, managed from the admin area. Public content like events, so
-- readable by anyone and writable only by the service role.
-- =================================================================
create table if not exists public.gallery (
  id          text primary key,
  title       text not null,
  description text not null default '',
  category    text not null default 'EVENTS'
                check (category in ('WORKSHOPS','HACKATHONS','TEAM','EVENTS','COMMUNITY')),
  image_url   text not null,
  date        timestamptz not null default now(),
  featured    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists gallery_date_idx on public.gallery (date desc);

-- Seeded from lib/data/initialData.ts, generated rather than retyped so the
-- two cannot drift. ON CONFLICT DO NOTHING keeps re-runs safe and never
-- overwrites an edit made in the admin area.
insert into public.gallery (id, title, description, category, image_url, date, featured)
values
  ('gal-1', 'AWS Cloud Day Inauguration Keynote', 'Over 350 students gathered at the Xavier auditorium for the annual cloud kickoff.', 'EVENTS', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop', '2026-03-12', true),
  ('gal-2', 'Hands-on Serverless Lab Session', 'Students building live Lambda functions and API Gateway endpoints.', 'WORKSHOPS', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop', '2026-02-18', true),
  ('gal-3', 'CloudHacks Grand Finale Judging', 'Jury evaluating architecture diagrams and high-availability setups.', 'HACKATHONS', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop', '2025-11-20', true),
  ('gal-4', 'Core Executive Team Strategy Meeting', 'Planning upcoming certification study cohorts and industrial guest lectures.', 'TEAM', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop', '2026-01-10', false),
  ('gal-5', 'AWS Community Mixer & Mentorship', 'Senior cloud engineers reviewing resumes and offering architecture tips.', 'COMMUNITY', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop', '2025-12-05', false),
  ('gal-6', 'Container & Kubernetes Bootcamp', 'Deep dive into Docker images, microservices, and cluster management.', 'WORKSHOPS', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop', '2025-10-15', false),
  ('gal-7', 'Hackathon Winning Team Celebration', 'Awarding AWS exam vouchers and prizes to the top 3 innovating teams.', 'HACKATHONS', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop', '2025-11-21', false),
  ('gal-8', 'Student Induction & Welcome Drive', 'Welcoming 150+ new cloud enthusiasts into the SXC AWS family.', 'COMMUNITY', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop', '2025-08-25', false)
on conflict (id) do nothing;



-- =================================================================
-- 3b. PROJECTS
-- =================================================================
create table if not exists public.projects (
  id            text primary key,
  title         text not null,
  slug          text unique not null,
  short_desc    text not null default '',
  problem       text not null default '',
  solution      text not null default '',
  technologies  text[] not null default '{}',
  aws_services  text[] not null default '{}',
  image_url     text not null default '',
  github_url    text not null default '',
  live_demo_url text not null default '',
  is_featured   boolean not null default false,
  -- Team credits are a list of {name, role, avatarUrl}. jsonb rather than a
  -- join table: they are only ever read and written whole, with the project.
  members       jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Seeded from lib/data/initialData.ts, generated rather than retyped.
insert into public.projects (
  id, title, slug, short_desc, problem, solution, technologies, aws_services,
  image_url, github_url, live_demo_url, is_featured, members
) values
  ('proj-1', 'CloudPulse: Multi-Region Distributed Observability', 'cloudpulse-observability', 'Real-time automated telemetry and drift detection engine for multi-region AWS cloud infrastructures.', 'Student and startup teams often suffer unexpected cloud bill spikes and unmonitored infrastructure downtime due to complex CloudWatch configurations.', 'CloudPulse aggregates CloudWatch metrics, AWS Cost Explorer API, and VPC Flow Logs into a unified high-speed dashboard with Telegram & Discord alerting bots.', ARRAY['Next.js','TypeScript','Python','Tailwind CSS','Terraform']::text[], ARRAY['AWS Lambda','Amazon DynamoDB','Amazon CloudWatch','Amazon SNS','Amazon S3','AWS EventBridge']::text[], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop', 'https://github.com/sxc-aws-club/cloudpulse', 'https://cloudpulse.sxcaws.club', true, '[{"name": "Aarav Sharma", "role": "Cloud Architect", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"}, {"name": "Vikramaditya Banerjee", "role": "Backend Engineer", "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"}, {"name": "Ishita Bose", "role": "UI/UX Designer", "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"}]'::jsonb),
  ('proj-2', 'AutoScalerX: Smart EKS Kubernetes Auto-Tuner', 'autoscaler-x-eks', 'Reinforcement-learning driven predictive pod autoscaler that cuts AWS EC2 cluster compute costs by 42%.', 'Standard Kubernetes HPA (Horizontal Pod Autoscaler) relies on reactive CPU metrics, resulting in slow scale-ups during sudden traffic surges and wasted compute idle time.', 'AutoScalerX uses machine learning time-series forecasting on historical traffic to pre-provision EC2 spot instances 3 minutes ahead of demand bursts.', ARRAY['Python','PySpark','Docker','FastAPI','Kubernetes','Prometheus']::text[], ARRAY['Amazon EKS','Amazon EC2 Spot','Amazon Athena','Amazon S3','AWS Glue']::text[], 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop', 'https://github.com/sxc-aws-club/autoscaler-x', 'https://autoscalerx.sxcaws.club', true, '[{"name": "Devanshu Patel", "role": "DevOps Lead", "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop"}, {"name": "Rhea Sen", "role": "Systems Engineer", "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"}]'::jsonb),
  ('proj-3', 'CloudDocs AI: Serverless Knowledge Intelligence Engine', 'clouddocs-ai-knowledge-engine', 'Intelligent document retrieval and automated compliance auditor powered by Amazon Bedrock and Claude 3.5.', 'Navigating thousands of pages of college syllabus, academic research, and AWS documentation manually takes hours of tedious searching.', 'CloudDocs AI automatically parses PDFs using Amazon Textract, creates high-dimensional vector embeddings, and delivers instant, cited semantic answers.', ARRAY['Next.js','TypeScript','LangChain','Python','Tailwind CSS']::text[], ARRAY['Amazon Bedrock','Amazon Textract','Amazon Aurora PostgreSQL (pgvector)','AWS Lambda','Amazon S3']::text[], 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', 'https://github.com/sxc-aws-club/clouddocs-ai', 'https://clouddocs.sxcaws.club', true, '[{"name": "Sneha Mukherjee", "role": "AI Lead", "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"}, {"name": "Aarav Sharma", "role": "Full-Stack Dev", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"}]'::jsonb),
  ('proj-4', 'EduCloud: Instant Sandbox Labs for Students', 'educloud-student-sandbox', 'Ephemeral, cost-governed cloud lab environments provisioned on-demand with automatic teardown.', 'Students frequently incur accidental charges on personal cloud accounts while practicing for AWS certifications.', 'EduCloud allocates isolated sandbox AWS accounts with pre-budgeted $5 limits, active IAM permission boundaries, and 2-hour auto-destruction triggers.', ARRAY['Next.js','Go','AWS CDK','PostgreSQL','Docker']::text[], ARRAY['AWS Organizations','AWS IAM','AWS Lambda','Amazon DynamoDB','Amazon API Gateway']::text[], 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', 'https://github.com/sxc-aws-club/educloud', 'https://educloud.sxcaws.club', false, '[{"name": "Kabir Mehta", "role": "Project Lead", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"}, {"name": "Ananya Roy", "role": "FinOps & Security", "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"}]'::jsonb)
on conflict (id) do nothing;


-- =================================================================
-- 3c. TEAM MEMBERS
-- =================================================================
create table if not exists public.team_members (
  id              text primary key,
  name            text not null,
  position        text not null default '',
  department_id   text not null default '',
  department_name text not null default '',
  bio             text not null default '',
  photo_url       text not null default '',
  linkedin        text not null default '',
  github          text not null default '',
  email           text not null default '',
  is_executive    boolean not null default false,
  skills          text[] not null default '{}',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists team_members_order_idx
  on public.team_members (sort_order, name);

-- Seeded from lib/data/initialData.ts, generated rather than retyped.
insert into public.team_members (
  id, name, position, department_id, department_name, bio, photo_url,
  linkedin, github, email, is_executive, skills, sort_order
) values
  ('member-1', 'Aarav Sharma', 'President & AWS Community Lead', 'dept-1', 'Executive Board', 'AWS Certified Solutions Architect with a passion for serverless microservices and distributed computing. Leading 500+ student innovators.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/aaravsharma-aws', 'https://github.com/aaravsharma-cloud', 'president@sxcaws.club', true, ARRAY['AWS Solutions Architecture','Terraform','Kubernetes','Next.js']::text[], 1),
  ('member-2', 'Rhea Sen', 'Vice President', 'dept-1', 'Executive Board', 'DevOps specialist and cloud-native researcher. Driving student certification programs and industry hackathons.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/rheasen-cloud', 'https://github.com/rheasen', 'vp@sxcaws.club', true, ARRAY['CI/CD Pipelines','Docker','AWS Lambda','Python']::text[], 2),
  ('member-3', 'Kabir Mehta', 'Secretary & Operations Head', 'dept-1', 'Executive Board', 'Managing institutional partnerships, AWS Academy curricula, and inter-collegiate tech symposiums.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/kabirmehta', 'https://github.com/kabirmehta', 'secretary@sxcaws.club', true, ARRAY['Cloud Economics','Event Strategy','PostgreSQL','AWS IAM']::text[], 3),
  ('member-4', 'Ananya Roy', 'Treasurer & Cloud FinOps Lead', 'dept-1', 'Executive Board', 'Focused on AWS Cost Optimization, AWS Budgets, and financial management for club hackathons and cloud credits.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/ananyaroy', 'https://github.com/ananyaroy', 'treasurer@sxcaws.club', true, ARRAY['AWS Cost Explorer','CloudWatch','FinOps','Python']::text[], 4),
  ('member-5', 'Vikramaditya Banerjee', 'Technical Head & Cloud Architect', 'dept-2', 'Technical Department', 'Specializing in high-throughput distributed systems, event-driven backends, and multi-tenant AWS architectures.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/vikram-banerjee', 'https://github.com/vikrambanerjee', 'tech@sxcaws.club', false, ARRAY['Amazon ECS/EKS','DynamoDB','EventBridge','Go','TypeScript']::text[], 5),
  ('member-6', 'Sneha Mukherjee', 'AI/ML Lead & Cloud Researcher', 'dept-2', 'Technical Department', 'Building generative AI pipelines on Amazon Bedrock, SageMaker distributed training, and LLM orchestration.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/snehamukherjee', 'https://github.com/snehamukherjee', 'aiml@sxcaws.club', false, ARRAY['Amazon Bedrock','SageMaker','PyTorch','LangChain','Vector DBs']::text[], 6),
  ('member-7', 'Devanshu Patel', 'DevOps & Infrastructure Subhead', 'dept-2', 'Technical Department', 'Automating cloud infrastructure with Terraform, AWS CDK, GitHub Actions, and Prometheus monitoring.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/devanshupatel', 'https://github.com/devanshupatel', 'devops@sxcaws.club', false, ARRAY['Terraform','AWS CDK','Docker','GitHub Actions','Grafana']::text[], 7),
  ('member-8', 'Ishita Bose', 'Design & Creative Head', 'dept-3', 'Marketing & Design', 'Crafting futuristic UI/UX aesthetics, 3D cloud visuals, and cyberpunk branding for SXC AWS Club.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/ishitabose', 'https://github.com/ishitabose', 'design@sxcaws.club', false, ARRAY['Figma','Three.js','Motion Graphics','Tailwind CSS']::text[], 8),
  ('member-9', 'Rohan Varma', 'Events & Hackathons Head', 'dept-4', 'Events & Operations', 'Directing large-scale technical hackathons, AWS game days, and interactive hands-on coding challenges.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/rohanvarma', 'https://github.com/rohanvarma', 'events@sxcaws.club', false, ARRAY['AWS GameDay','Hackathon Organization','Public Speaking']::text[], 9),
  ('member-10', 'Pooja Hegde', 'PR & Industry Outreach Head', 'dept-5', 'PR & Corporate Outreach', 'Fostering relations with AWS Heroes, AWS User Groups, and leading tech employers for internships.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop', 'https://linkedin.com/in/poojahegde-pr', 'https://github.com/poojahegde', 'pr@sxcaws.club', false, ARRAY['Corporate Relations','Sponsorships','AWS User Groups']::text[], 10)
on conflict (id) do nothing;



-- =================================================================
-- 3d. GALLERY IMAGE STORAGE
--
-- Uploaded photos live in Supabase Storage rather than the database. The
-- bucket is public-read so the site can render the images without signing every
-- URL; writes go through the service role from /api/admin/gallery/upload, so
-- nothing anonymous can put a file here.
-- =================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- HEIC is deliberately absent from the list above: browsers other than Safari
-- cannot display it, so an .heic straight from an iPhone would upload happily
-- and then render as a broken image for most visitors. The upload route decodes
-- it and stores JPEG instead, so only web-safe types ever reach the bucket.

drop policy if exists "Gallery images are publicly readable" on storage.objects;
create policy "Gallery images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');


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

alter table public.gallery enable row level security;

drop policy if exists "Gallery is publicly readable" on public.gallery;
create policy "Gallery is publicly readable"
  on public.gallery for select to anon, authenticated using (true);

grant select on public.gallery to anon, authenticated;
revoke insert, update, delete on public.gallery from anon, authenticated;

alter table public.projects enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "Projects are publicly readable" on public.projects;
create policy "Projects are publicly readable"
  on public.projects for select to anon, authenticated using (true);

drop policy if exists "Team members are publicly readable" on public.team_members;
create policy "Team members are publicly readable"
  on public.team_members for select to anon, authenticated using (true);

grant select on public.projects to anon, authenticated;
grant select on public.team_members to anon, authenticated;
revoke insert, update, delete on public.projects from anon, authenticated;
revoke insert, update, delete on public.team_members from anon, authenticated;

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
