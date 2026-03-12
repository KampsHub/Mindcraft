-- Consent settings table
-- Run this in Supabase SQL Editor

create table if not exists public.consent_settings (
  id                    uuid primary key default gen_random_uuid(),
  client_id             uuid not null unique default auth.uid(),
  ai_processing         boolean not null default true,
  coach_sharing         boolean not null default false,
  aggregate_analytics   boolean not null default true,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.consent_settings enable row level security;

create policy "Users can read own consent"
  on public.consent_settings for select
  using (client_id = auth.uid());

create policy "Users can insert own consent"
  on public.consent_settings for insert
  with check (client_id = auth.uid());

create policy "Users can update own consent"
  on public.consent_settings for update
  using (client_id = auth.uid());
