-- Simplified entries table for auth testing
-- Run this in Supabase SQL Editor

-- Drop the old entries table if it exists (from schema.sql)
drop table if exists public.entries cascade;

-- Recreate entries with client_id as the auth user
create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null default auth.uid(),
  coach_id    uuid not null default auth.uid(),
  type        text not null default 'journal',
  content     text,
  transcript  text,
  theme_tags  text[] default '{}',
  date        date not null default current_date,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.entries enable row level security;

-- Users can only read their own entries
create policy "Users can read own entries"
  on public.entries for select
  using (client_id = auth.uid());

-- Users can only insert their own entries
create policy "Users can insert own entries"
  on public.entries for insert
  with check (client_id = auth.uid());

-- Users can only update their own entries
create policy "Users can update own entries"
  on public.entries for update
  using (client_id = auth.uid());

-- Users can only delete their own entries
create policy "Users can delete own entries"
  on public.entries for delete
  using (client_id = auth.uid());
