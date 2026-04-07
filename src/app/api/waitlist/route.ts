import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  waitlistUserConfirmationSubject,
  waitlistUserConfirmationHtml,
  waitlistFrom,
} from "@/lib/emails/waitlist";

export async function POST(req: NextRequest) {
  try {
    const { email, program } = await req.json();

    if (!email?.trim() || !program?.trim()) {
      return NextResponse.json(
        { error: "Email and program are required" },
        { status: 400 }
      );
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Store in Supabase (use service role to bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("waitlist_signups").upsert(
      { email: email.toLowerCase().trim(), program },
      { onConflict: "email,program" }
    );

    // Send confirmation to user only (team alert removed)
    const resend = new Resend(process.env.RESEND_API_KEY);
    const waitlistOpts = { email, program };
    await resend.emails.send({
      from: waitlistFrom,
      to: email,
      subject: waitlistUserConfirmationSubject(waitlistOpts),
      html: waitlistUserConfirmationHtml(waitlistOpts),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
