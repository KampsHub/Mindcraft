-- BIG IDEA B — Opt-in coach inbox.
--
-- Users can tap "Share this with Stefanie" on any journal entry or
-- insight. The entry is flagged, added to an admin queue, and Stefanie
-- writes a 2-3 sentence written reply that appears attached to the
-- original entry in the user's app. No audio, no auto-forwarding —
-- every share is an explicit user action.

-- 1. Flag column on journal_entries (or daily_sessions — adjust to
--    whatever the actual journal storage table is in production).
alter table daily_sessions
  add column if not exists shared_with_coach boolean not null default false;

alter table daily_sessions
  add column if not exists shared_with_coach_at timestamptz;

create index if not exists idx_daily_sessions_shared
  on daily_sessions(shared_with_coach, shared_with_coach_at desc)
  where shared_with_coach = true;

-- 2. Coach replies table.
create table if not exists coach_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_session_id uuid not null references daily_sessions(id) on delete cascade,
  coach_user_id uuid references auth.users(id), -- which coach replied (Stefanie for now)
  reply_text text not null,
  created_at timestamptz not null default now(),
  read_by_user_at timestamptz
);

create index if not exists idx_coach_replies_user on coach_replies(user_id, created_at desc);
create index if not exists idx_coach_replies_session on coach_replies(daily_session_id);

alter table coach_replies enable row level security;

drop policy if exists "users read own coach replies" on coach_replies;
create policy "users read own coach replies" on coach_replies
  for select using (auth.uid() = user_id);
