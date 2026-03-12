-- Client assessments table (enneagram, MBTI, Leadership Circle, etc.)
-- Run this in Supabase SQL Editor

create table if not exists public.client_assessments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null default auth.uid(),
  type        text not null,  -- 'enneagram', 'mbti', 'leadership_circle', etc.
  data        jsonb default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),

  unique (client_id, type)
);

alter table public.client_assessments enable row level security;

-- Clients can read their own assessments
create policy "Users can read own assessments"
  on public.client_assessments for select
  using (client_id = auth.uid());

-- Coach can read all assessments (for coach view)
-- In production, filter by coach_id relationship
create policy "Authenticated users can read assessments"
  on public.client_assessments for select
  using (auth.role() = 'authenticated');

-- Allow inserts and updates
create policy "Users can insert assessments"
  on public.client_assessments for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update assessments"
  on public.client_assessments for update
  using (auth.role() = 'authenticated');
