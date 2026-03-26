import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const CONTACT_EMAIL = "crew@allmindsondeck.com";

    // If Supabase service role is available, store the message
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("contact_messages").insert({
        name,
        email,
        message,
        to_email: CONTACT_EMAIL,
        created_at: new Date().toISOString(),
      });
    } else {
      console.log("\n=== CONTACT FORM ===\nFrom: " + name + " <" + email + ">\nTo: " + CONTACT_EMAIL + "\nMessage: " + message + "\n====================\n");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
