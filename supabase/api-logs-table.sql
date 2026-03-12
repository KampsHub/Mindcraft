-- API logs table for tracking all Claude API calls
-- Run this in Supabase SQL Editor

create table public.api_logs (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid,
  endpoint      text not null,
  model         text,
  input_prompt  text,
  output        text,
  input_tokens  integer,
  output_tokens integer,
  latency_ms    integer,
  error         text,
  created_at    timestamptz default now()
);

-- No RLS on logs — coach/admin access only
alter table public.api_logs enable row level security;

create policy "Service role only"
  on public.api_logs for all
  using (true);
