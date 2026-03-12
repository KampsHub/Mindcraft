-- Coaching plans table
-- Run this in Supabase SQL Editor

create table if not exists public.coaching_plans (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null default auth.uid(),
  version           integer not null default 1,
  package           text,
  goals             jsonb default '[]',
  focus_areas       jsonb default '[]',
  weekly_themes     jsonb default '[]',
  current_phase     text,
  summary           text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.coaching_plans enable row level security;

create policy "Users can read own plans"
  on public.coaching_plans for select
  using (client_id = auth.uid());

create policy "Users can insert own plans"
  on public.coaching_plans for insert
  with check (client_id = auth.uid());

create policy "Users can update own plans"
  on public.coaching_plans for update
  using (client_id = auth.uid());
