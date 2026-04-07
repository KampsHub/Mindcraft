-- Coach availability for Enneagram debrief booking.
--
-- v1: a `blocked_slots` table Stefanie can populate with dates/times she's
-- unavailable. The /api/coach/slots route generates a default grid (next 14
-- weekdays × 3 timeslots in her local timezone) and excludes anything in
-- this table.
--
-- v2 (later): replace with real Google Calendar Free/Busy integration.

create table if not exists coach_blocked_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_time text not null check (slot_time in ('09:00', '12:00', '15:00')),
  reason text,
  created_at timestamptz not null default now(),
  unique (slot_date, slot_time)
);

-- index for fast date-range lookups
create index if not exists idx_coach_blocked_slots_date on coach_blocked_slots(slot_date);

-- Optional: read-only public access via service role only.
-- (No RLS policies needed because this is only read by server routes.)
