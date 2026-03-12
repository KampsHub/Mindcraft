-- Weekly reviews table
-- Run this in Supabase SQL Editor

create table if not exists public.weekly_reviews (
  id                    uuid primary key default gen_random_uuid(),
  client_id             uuid not null default auth.uid(),
  week_start            date not null,
  accountability_rating integer not null check (accountability_rating between 1 and 5),
  reflection            text,
  plan_adjustments      text,
  entries_count         integer default 0,
  exercises_completed   integer default 0,
  top_themes            text[] default '{}',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (client_id, week_start)
);

alter table public.weekly_reviews enable row level security;

create policy "Users can read own reviews"
  on public.weekly_reviews for select
  using (client_id = auth.uid());

create policy "Users can insert own reviews"
  on public.weekly_reviews for insert
  with check (client_id = auth.uid());

create policy "Users can update own reviews"
  on public.weekly_reviews for update
  using (client_id = auth.uid());
