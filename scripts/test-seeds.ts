/**
 * Quick verification that all programs, days, and exercises are seeded correctly.
 * Run: npx tsx scripts/test-seeds.ts
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Programs
  const { data: programs, error: pErr } = await sb
    .from("programs")
    .select("id, slug, name, active, duration_days")
    .order("slug");

  console.log("=== PROGRAMS ===");
  if (pErr) {
    console.log("ERROR:", pErr.message);
  } else {
    for (const p of programs || []) {
      console.log(`  ${p.active ? "✓" : "✗"} ${p.slug} — ${p.name} (${p.duration_days} days)`);
    }
  }

  // 2. Program days per program
  console.log("\n=== PROGRAM DAYS ===");
  for (const p of programs || []) {
    const { count, error } = await sb
      .from("program_days")
      .select("*", { count: "exact", head: true })
      .eq("program_id", p.id);

    if (error) {
      console.log(`  ${p.slug}: ERROR — ${error.message}`);
    } else {
      console.log(`  ${p.slug}: ${count} days`);
    }
  }

  // 3. Exercises per program_slug
  console.log("\n=== PROGRAM-SPECIFIC EXERCISES ===");
  for (const slug of ["layoff", "new_role", "performance_plan"]) {
    const { count, error } = await sb
      .from("frameworks_library")
      .select("*", { count: "exact", head: true })
      .eq("program_slug", slug);

    if (error) {
      console.log(`  ${slug}: ERROR — ${error.message}`);
    } else {
      console.log(`  ${slug}: ${count} exercises`);
    }
  }

  // 4. Sample a few days to check content
  console.log("\n=== SAMPLE DAYS (spot check) ===");
  for (const slug of ["new_role", "performance_plan"]) {
    const prog = programs?.find((p) => p.slug === slug);
    if (!prog) continue;

    const { data: days } = await sb
      .from("program_days")
      .select("day_number, title")
      .eq("program_id", prog.id)
      .in("day_number", [1, 15, 30])
      .order("day_number");

    console.log(`  ${slug}:`);
    for (const d of days || []) {
      console.log(`    Day ${d.day_number}: ${d.title}`);
    }
  }

  // 5. Check target_packages on common frameworks
  console.log("\n=== COMMON FRAMEWORKS — target_packages ===");
  const { data: frameworks } = await sb
    .from("frameworks_library")
    .select("name, target_packages")
    .is("program_slug", null)
    .not("target_packages", "is", null)
    .limit(5);

  for (const f of frameworks || []) {
    console.log(`  ${f.name}: [${f.target_packages?.join(", ")}]`);
  }
}

main().catch(console.error);
