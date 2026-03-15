require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from("program_enrollments")
    .update({ status: "onboarding", current_day: 1 })
    .eq("client_id", "5867b7b5-1747-404e-98a0-ef4bcd69c951")
    .eq("status", "pre_start")
    .select();
  
  if (error) console.error("Error:", error);
  else console.log("Updated enrollment:", JSON.stringify(data, null, 2));
})();
