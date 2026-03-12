-- Coaching Hub V1 — Supabase Schema
-- Tables: coaches, clients, entries, coaching_plans, exercises, frameworks_library
-- Multi-tenancy via coach_id + RLS from day one

-- ============================================================
-- 1. COACHES
-- ============================================================
create table public.coaches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text unique not null,
  stripe_account_id text,
  created_at    timestamptz default now()
);

alter table public.coaches enable row level security;

create policy "Coaches can read own row"
  on public.coaches for select
  using (id = auth.uid());

create policy "Coaches can update own row"
  on public.coaches for update
  using (id = auth.uid());

-- ============================================================
-- 2. CLIENTS
-- ============================================================
create type public.package_type as enum (
  'international_move',
  'layoff',
  'new_manager',
  'dealing_with_others',
  'general_growth'
);

create type public.subscription_status as enum (
  'active',
  'past_due',
  'canceled',
  'trialing'
);

create table public.clients (
  id                  uuid primary key default gen_random_uuid(),
  coach_id            uuid not null references public.coaches(id),
  email               text not null,
  package             public.package_type,
  subscription_status public.subscription_status default 'trialing',
  created_at          timestamptz default now()
);

alter table public.clients enable row level security;

create policy "Coach sees own clients"
  on public.clients for select
  using (coach_id = auth.uid());

create policy "Coach manages own clients"
  on public.clients for all
  using (coach_id = auth.uid());

-- ============================================================
-- 3. FRAMEWORKS_LIBRARY (coach IP — referenced by exercises)
-- ============================================================
create type public.difficulty_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.graphic_type as enum (
  'static_image',
  'interactive_component',
  'fillable_worksheet',
  'none'
);

create table public.frameworks_library (
  id                uuid primary key default gen_random_uuid(),
  coach_id          uuid not null references public.coaches(id),
  name              text not null,
  description       text,
  instructions      text not null,
  category          text not null,
  target_packages   public.package_type[] default '{}',
  difficulty_level  public.difficulty_level default 'beginner',
  theme_tags        text[] default '{}',
  graphic_asset_url text,
  graphic_type      public.graphic_type default 'none',
  active            boolean default true,
  created_at        timestamptz default now()
);

alter table public.frameworks_library enable row level security;

create policy "Coach sees own frameworks"
  on public.frameworks_library for select
  using (coach_id = auth.uid());

create policy "Coach manages own frameworks"
  on public.frameworks_library for all
  using (coach_id = auth.uid());

-- ============================================================
-- 4. COACHING_PLANS
-- ============================================================
create type public.adjustment_source as enum (
  'system',
  'client',
  'coach'
);

create table public.coaching_plans (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references public.clients(id) on delete cascade,
  coach_id          uuid not null references public.coaches(id),
  version           integer not null default 1,
  goals             jsonb default '[]',
  focus_areas       jsonb default '[]',
  current_phase     text,
  adjusted_at       timestamptz,
  adjustment_source public.adjustment_source,
  last_updated      timestamptz default now(),
  created_at        timestamptz default now()
);

alter table public.coaching_plans enable row level security;

create policy "Coach sees own plans"
  on public.coaching_plans for select
  using (coach_id = auth.uid());

create policy "Coach manages own plans"
  on public.coaching_plans for all
  using (coach_id = auth.uid());

-- ============================================================
-- 5. ENTRIES (journal, one-liner, voice)
-- ============================================================
create type public.entry_type as enum (
  'journal',
  'one_liner',
  'voice'
);

create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  coach_id    uuid not null references public.coaches(id),
  type        public.entry_type not null,
  content     text,
  transcript  text,
  theme_tags  text[] default '{}',
  date        date not null default current_date,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

alter table public.entries enable row level security;

create policy "Coach sees own client entries"
  on public.entries for select
  using (coach_id = auth.uid());

create policy "Coach manages own client entries"
  on public.entries for all
  using (coach_id = auth.uid());

-- ============================================================
-- 6. EXERCISES (daily exercise tied to framework + plan)
-- ============================================================
create table public.exercises (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients(id) on delete cascade,
  coach_id         uuid not null references public.coaches(id),
  coaching_plan_id uuid references public.coaching_plans(id),
  framework_id     uuid references public.frameworks_library(id),
  content          text not null,
  completed        boolean default false,
  date             date not null default current_date,
  created_at       timestamptz default now()
);

alter table public.exercises enable row level security;

create policy "Coach sees own client exercises"
  on public.exercises for select
  using (coach_id = auth.uid());

create policy "Coach manages own client exercises"
  on public.exercises for all
  using (coach_id = auth.uid());

-- ============================================================
-- INDEXES for common queries
-- ============================================================
create index idx_clients_coach        on public.clients(coach_id);
create index idx_entries_client_date   on public.entries(client_id, date);
create index idx_entries_coach         on public.entries(coach_id);
create index idx_exercises_client_date on public.exercises(client_id, date);
create index idx_exercises_framework   on public.exercises(framework_id);
create index idx_coaching_plans_client on public.coaching_plans(client_id);
create index idx_frameworks_coach      on public.frameworks_library(coach_id);
create index idx_frameworks_category   on public.frameworks_library(category);
