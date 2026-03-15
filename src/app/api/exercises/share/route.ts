import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ExercisePayload {
  framework_name: string;
  exercise_type: string;
  modality: string | null;
  custom_framing: string | null;
  responses: Record<string, string>;
  star_rating: number | null;
  feedback: string | null;
  completed_at: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { email, exercise, weekNumber, programName } = await request.json() as {
      email: string;
      exercise: ExercisePayload;
      weekNumber: number;
      programName?: string;
    };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!exercise || !exercise.framework_name) {
      return NextResponse.json({ error: "Exercise data is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Build response rows
    const responseRows = Object.entries(exercise.responses || {})
      .map(([question, answer]) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a30;">
            <p style="font-size: 12px; font-weight: 600; color: #99929b; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">
              ${esc(String(question))}
            </p>
            <p style="font-size: 14px; color: #d4cdd2; line-height: 1.6; margin: 0;">
              ${esc(String(answer))}
            </p>
          </td>
        </tr>`)
      .join("");

    const completedDate = exercise.completed_at
      ? new Date(exercise.completed_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      : "In progress";

    const ratingDisplay = exercise.star_rating
      ? `${"★".repeat(exercise.star_rating)}${"☆".repeat(5 - exercise.star_rating)}`
      : "Not rated";

    const html = `
    <div style="background-color: #1c1917; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: 700; color: #e4dde2; margin: 0 0 6px 0; letter-spacing: -0.03em;">
          ${esc(exercise.framework_name)}
        </h1>
        <p style="font-size: 14px; color: #99929b; margin: 0 0 24px 0;">
          ${programName || "Mindcraft"} — Week ${weekNumber} | ${esc(exercise.exercise_type)}${exercise.modality ? ` · ${esc(exercise.modality)}` : ""} | ${completedDate}
        </p>
        ${exercise.custom_framing ? `
        <div style="background-color: #27272c; border-radius: 10px; border-left: 3px solid #e09585; padding: 14px 16px; margin-bottom: 16px;">
          <p style="font-size: 13px; color: #b5adb6; margin: 0; line-height: 1.5;">
            ${esc(exercise.custom_framing)}
          </p>
        </div>` : ""}
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #27272c; border-radius: 14px; border: 1px solid #333339; overflow: hidden;">
          ${responseRows}
        </table>
        <div style="margin-top: 16px; display: flex; gap: 16px;">
          <span style="font-size: 13px; color: #99929b;">Rating: ${ratingDisplay}</span>
          ${exercise.feedback ? `<span style="font-size: 13px; color: #99929b;">Feedback: ${esc(exercise.feedback)}</span>` : ""}
        </div>
        <p style="font-size: 12px; color: #6b6570; margin: 24px 0 0 0; text-align: center;">
          Shared from Mindcraft by All Minds on Deck LLC
        </p>
      </div>
    </div>`;

    await resend.emails.send({
      from: "Mindcraft <noreply@allmindsondeck.org>",
      to: email,
      subject: `Mindcraft — ${exercise.framework_name} (Week ${weekNumber})`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Share exercise error:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
