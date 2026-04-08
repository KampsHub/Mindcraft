import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Slot rules mirror Stefanie's real Google Appointment Schedule
// (AcZssZ1GvZttZdK4XHfuoTQ0LRKf0IVVPjxJV4XRkKLdQ7_wS5fK4WR-Wjjn95OyMp-lpcy8QtqOT-zs):
//   • 60-minute appointments
//   • 6 slots per day at 8:00, 9:30, 11:00, 12:30, 14:00, 15:30 PT
//   • Weekdays only (Mon–Fri)
//   • 72-hour minimum advance booking
//   • Timezone: America/Los_Angeles
//
// These constants are verified against the live public booking page. If
// Stefanie changes her Google Appointment Schedule, update SLOT_TIMES +
// SLOT_LABELS here to match. Real-time sync would require the Google
// Calendar Appointment Schedules API (restricted availability, OAuth only)
// or scraping the public page (slot data is not in the anonymous HTML —
// it loads client-side with cookies, so server-side scraping isn't viable).
//
// Write-back: when a customer pays, they are redirected through
// /enneagram/book to Stefanie's public appointment schedule URL, where
// Google handles the calendar insert natively. No OAuth needed on our end.

const SLOT_TIMES = ["08:00", "09:30", "11:00", "12:30", "14:00", "15:30"] as const;
type SlotTime = (typeof SLOT_TIMES)[number];

const SLOT_LABELS: Record<SlotTime, string> = {
  "08:00": "8:00 AM PT",
  "09:30": "9:30 AM PT",
  "11:00": "11:00 AM PT",
  "12:30": "12:30 PM PT",
  "14:00": "2:00 PM PT",
  "15:30": "3:30 PM PT",
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

  // 72-hour advance rule (matches Stefanie's Google Appointment Schedule).
  const earliest = new Date();
  earliest.setTime(earliest.getTime() + 72 * 60 * 60 * 1000);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead + 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay(); // 0 = Sun, 6 = Sat
    if (dow === 0 || dow === 6) continue;

    for (const time of SLOT_TIMES) {
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
    if (slots.length >= daysAhead * SLOT_TIMES.length) break;
  }
  return slots;
}

export async function GET() {
  try {
    const slots = generateSlots(14);

    // Fetch blocked slots from Supabase. Stefanie can insert rows here
    // to manually block times she doesn't want to offer (one-off admin
    // holds beyond her standard availability).
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
