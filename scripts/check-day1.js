require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const uid = "5867b7b5-1747-404e-98a0-ef4bcd69c951";

(async () => {
  // Check enrollment
  const { data: enr } = await supabase
    .from("program_enrollments")
    .select("current_day, status")
    .eq("client_id", uid)
    .single();
  console.log("Enrollment:", enr);

  // Check daily sessions
  const { data: sessions } = await supabase
    .from("daily_sessions")
    .select("id, day_number, completed_steps, day_rating, completed_at")
    .eq("client_id", uid);
  console.log("Sessions:", JSON.stringify(sessions, null, 2));

  // Check exercise completions
  const { data: exercises } = await supabase
    .from("exercise_completions")
    .select("framework_name, exercise_type, star_rating, completed_at")
    .eq("client_id", uid);
  console.log("Exercise completions:", JSON.stringify(exercises, null, 2));

  // Check free flow entries
  const { data: freeFlow } = await supabase
    .from("free_flow_entries")
    .select("id, content")
    .eq("client_id", uid);
  console.log("Free flow entries:", freeFlow ? freeFlow.length : 0);
})();
