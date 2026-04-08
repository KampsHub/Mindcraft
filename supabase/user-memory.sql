-- BIG IDEA A — Journal that remembers.
--
-- A queryable memory store the AI journal loop can reference across
-- sessions so the voice stops feeling generic. Each row is one small
-- fact about the user — a pattern, a commitment, a saboteur, a value,
-- or a turning point — that the AI can recall and reference in later
-- process-journal calls.
--
-- Usage:
--   1. /api/process-journal fetches the top ~8 rows for the user,
--      ranked by (active=true, last_referenced_at DESC, type diversity).
--   2. These rows are injected into the system prompt as "here's what
--      you already know about this person."
--   3. The AI response includes a `memory_update` JSON block with
--      new rows to insert and existing rows to mark `active = false`.
--   4. /api/process-journal writes those updates back.
--
-- v2 (later): vector embeddings for relevance-based retrieval.

create table if not exists user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in (
    'pattern',       -- a recurring behavioral or emotional pattern
    'commitment',    -- something they committed to doing
    'saboteur',      -- a named inner critic / sabotage voice
    'value',         -- a value they named or ranked
    'turning_point'  -- a significant moment or decision
  )),
  content text not null,              -- 1 sentence, hedged voice
  source_day integer,                 -- which day it came from
  source_kind text check (source_kind in ('journal', 'exercise', 'rating')),
  last_referenced_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_memory_user on user_memory(user_id);
create index if not exists idx_user_memory_user_active on user_memory(user_id, active) where active = true;
create index if not exists idx_user_memory_user_type on user_memory(user_id, type);

-- RLS: users can only read their own memory; writes happen via
-- server routes using the service role.
alter table user_memory enable row level security;

drop policy if exists "users read own memory" on user_memory;
create policy "users read own memory" on user_memory
  for select using (auth.uid() = user_id);
