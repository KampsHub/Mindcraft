require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const uid = "5867b7b5-1747-404e-98a0-ef4bcd69c951";
const enrollmentId = "2f4efc42-4d52-4aad-9f67-ce48396a21ff";

(async () => {
  // Create Day 2 session
  const { data: s2, error: e2 } = await supabase.from("daily_sessions").insert({
    enrollment_id: enrollmentId,
    client_id: uid,
    day_number: 2,
    date: "2026-03-14",
    step_2_journal: "Today I mapped my timeline. The layoff came after months of restructuring signals I chose to ignore. My manager's tone shifted in September. The team reorg in October. I told myself I was safe because of my tenure. Looking back, I see a pattern of ignoring warning signs in relationships too — with my last partner, with a friendship that ended badly. I stay too long because leaving feels like failure.",
    step_1_themes: { summary: "Day 1 revealed identity as the loudest disruption.", themes: ["identity erasure", "physical weight of loss", "hidden shame"] },
    step_3_analysis: { state_analysis: { emotional_state: "Processing denial patterns", cognitive_patterns: "Pattern recognition emerging", somatic_signals: "Tension in shoulders", key_themes: ["avoidance", "denial", "loyalty"], urgency_level: "moderate" } },
    step_5_summary: { today_themes: ["pattern avoidance", "loyalty trap", "timeline clarity"], summary: "Timeline mapping revealed a repeated pattern of staying too long." },
    completed_steps: [1, 2, 3, 4, 5],
    day_rating: 4,
    completed_at: new Date().toISOString(),
  }).select().single();
  
  if (e2) console.error("Day 2 error:", e2);
  else console.log("Day 2 session created:", s2.id);

  // Create Day 2 exercise completion
  await supabase.from("exercise_completions").insert({
    daily_session_id: s2.id,
    enrollment_id: enrollmentId,
    client_id: uid,
    framework_name: "Timeline Mapping",
    exercise_type: "coaching_plan",
    responses: { main: "The timeline shows a clear pattern. September: manager started avoiding 1:1s. October: reorg announcement. November: my project deprioritized. December: laid off. In each case I saw the sign and told myself it didnt mean anything." },
    star_rating: 5,
    completed_at: new Date().toISOString(),
  });

  // Create Day 3 session
  const { data: s3, error: e3 } = await supabase.from("daily_sessions").insert({
    enrollment_id: enrollmentId,
    client_id: uid,
    day_number: 3,
    date: "2026-03-15",
    step_2_journal: "The somatic mapping exercise hit hard. I carry tension in my shoulders and jaw — have for years. My family taught me that work equals worth. My father worked 60-hour weeks and never complained. My mother said 'idle hands are the devil's workshop.' No wonder losing my job feels like losing my value as a person. The body scan showed that the heaviness I feel is concentrated in my chest and throat — grief I havent let myself voice.",
    step_1_themes: { summary: "Day 2 revealed pattern of staying too long and ignoring warning signs.", themes: ["pattern avoidance", "loyalty trap", "timeline clarity"] },
    step_3_analysis: { state_analysis: { emotional_state: "Deep grief emerging through body awareness", cognitive_patterns: "Family origin beliefs about work and worth identified", somatic_signals: "Chest and throat constriction, jaw tension", key_themes: ["inherited beliefs", "somatic grief", "family patterns"], urgency_level: "moderate" } },
    step_5_summary: { today_themes: ["family patterns of worth", "somatic grief", "inherited beliefs about work"], summary: "Somatic mapping connected physical symptoms to family beliefs about work equaling worth." },
    completed_steps: [1, 2, 3, 4, 5],
    day_rating: 5,
    completed_at: new Date().toISOString(),
  }).select().single();
  
  if (e3) console.error("Day 3 error:", e3);
  else console.log("Day 3 session created:", s3.id);

  // Create Day 3 exercise completion
  await supabase.from("exercise_completions").insert({
    daily_session_id: s3.id,
    enrollment_id: enrollmentId,
    client_id: uid,
    framework_name: "Somatic Mapping + Family Patterns",
    exercise_type: "coaching_plan",
    responses: { main: "Tension map: shoulders 8/10, jaw 7/10, chest 6/10, throat 5/10. Family message: work = worth. Dad: never took a sick day. Mom: always busy. The message was clear — you earn your place. Losing my job feels like losing my right to exist in the family system." },
    star_rating: 5,
    completed_at: new Date().toISOString(),
  });

  // Update enrollment to awaiting_goals status and day 4
  const { error: ue } = await supabase
    .from("program_enrollments")
    .update({ current_day: 4, status: "awaiting_goals" })
    .eq("id", enrollmentId);
  
  if (ue) console.error("Enrollment update error:", ue);
  else console.log("Enrollment updated to day 4, status: awaiting_goals");
})();
