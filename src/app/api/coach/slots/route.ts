import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Returns the next 14 weekdays × 3 fixed slots (9:00, 12:00, 15:00 PT),
// minus any rows in coach_blocked_slots that Stefanie has marked unavailable.
//
// v2 (follow-up): replace this generator with a real Google Calendar
// Free/Busy lookup so the slots reflect her actual calendar.

const SLOT_TIMES = ["09:00", "12:00", "15:00"] as const;
type SlotTime = (typeof SLOT_TIMES)[number];

const SLOT_LABELS: Record<SlotTime, string> = {
  "09:00": "9:00 AM PT",
  "12:00": "12:00 PM PT",
  "15:00": "3:00 PM PT",
};

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function generateSlots(daysAhead = 14) {
  const slots: Array<{ id: string; date: string; time: SlotTime; dayLabel: string; timeLabel: string }> = [];

  // Per Stefanie's calendar rule: no bookings within the next 72 hours.
  // (This rule is also enforced inside her Google Calendar appointment schedule.)
  const earliest = new Date();
  earliest.setTime(earliest.getTime() + 72 * 60 * 60 * 1000);

  // Walk forward day by day until we have `daysAhead` calendar days past the cutoff.
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead + 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay(); // 0 = Sun, 6 = Sat
    if (dow === 0 || dow === 6) continue;

    for (const time of SLOT_TIMES) {
      // Build the actual datetime for this slot in PT and skip if before the 72h cutoff.
      const [hh, mm] = time.split(":").map(Number);
      const slotDate = new Date(d);
      slotDate.setHours(hh, mm, 0, 0);
      if (slotDate.getTime() < earliest.getTime()) continue;

      slots.push({
        id: `${formatDate(d)}_${time}`,
        date: formatDate(d),
        time,
        dayLabel: dayLabel(d),
        timeLabel: SLOT_LABELS[time],
      });
    }
    if (slots.length >= daysAhead * 3) break;
  }
  return slots;
}

export async function GET() {
  try {
    const slots = generateSlots(14);

    // Fetch blocked slots from Supabase. Use the public anon client — this
    // table is read-only and contains no PII.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let blockedKeys = new Set<string>();
    if (url && key) {
      try {
        const supa = createClient(url, key);
        const earliest = slots[0]?.date;
        const latest = slots[slots.length - 1]?.date;
        if (earliest && latest) {
          const { data } = await supa
            .from("coach_blocked_slots")
            .select("slot_date, slot_time")
            .gte("slot_date", earliest)
            .lte("slot_date", latest);
          blockedKeys = new Set((data ?? []).map((r: { slot_date: string; slot_time: string }) => `${r.slot_date}_${r.slot_time}`));
        }
      } catch {
        // If the table doesn't exist yet (migration not run), fall through with no blocks.
      }
    }

    const available = slots.filter((s) => !blockedKeys.has(s.id));
    return NextResponse.json({ slots: available });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message, slots: [] }, { status: 500 });
  }
}
