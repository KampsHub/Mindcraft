-- Intake responses table
-- Run this in Supabase SQL Editor

create table public.intake_responses (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null default auth.uid(),
  package         text not null,
  universal       jsonb not null default '{}',
  package_specific jsonb not null default '{}',
  completed       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Enable RLS
alter table public.intake_responses enable row level security;

-- Users can only read their own intake
create policy "Users can read own intake"
  on public.intake_responses for select
  using (client_id = auth.uid());

-- Users can insert their own intake
create policy "Users can insert own intake"
  on public.intake_responses for insert
  with check (client_id = auth.uid());

-- Users can update their own intake
create policy "Users can update own intake"
  on public.intake_responses for update
  using (client_id = auth.uid());
