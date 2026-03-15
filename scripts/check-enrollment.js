require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find((u) => u.email === "stefanie.kamps@gmail.com");
  if (!user) {
    console.log("No user found");
    return;
  }
  console.log("User ID:", user.id);

  const { data: enrollments } = await supabase
    .from("program_enrollments")
    .select("*, programs(name, slug)")
    .eq("client_id", user.id);
  console.log("Enrollments:", JSON.stringify(enrollments, null, 2));

  const { data: goals } = await supabase
    .from("client_goals")
    .select("*")
    .eq("client_id", user.id);
  console.log("Goals:", goals ? goals.length : 0);

  const { data: sessions } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("client_id", user.id);
  console.log("Daily sessions:", sessions ? sessions.length : 0);
})();
