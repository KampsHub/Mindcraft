import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";

interface DayPayload {
  day_number: number;
  title: string;
  summary: string;
  themes: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, days, programName } = body as {
      email: string;
      days: DayPayload[];
      programName: string;
    };

    if (!email || !days || days.length === 0) {
      return NextResponse.json({ error: "Email and at least one day required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch { /* Server Component context */ }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dayRows = days
      .sort((a, b) => a.day_number - b.day_number)
      .map((d) => `
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #333339; vertical-align: top;">
            <div style="font-size: 13px; font-weight: 700; color: #E09585; margin-bottom: 4px;">
              Day ${d.day_number}${d.title ? `: ${d.title}` : ""}
            </div>
            ${d.themes.length > 0 ? `<div style="font-size: 11px; color: #999; margin-bottom: 8px;">${d.themes.join(" · ")}</div>` : ""}
            <div style="font-size: 14px; color: #E0E0E0; line-height: 1.6;">
              ${d.summary}
            </div>
          </td>
        </tr>
      `)
      .join("");

    const html = `
      <div style="background-color: #18181C; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">
              ${programName} — Daily Insights
            </h1>
            <p style="font-size: 14px; color: #999; margin: 0;">
              ${days.length} day${days.length !== 1 ? "s" : ""} shared from Mindcraft
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; background-color: #22222A; border-radius: 12px; overflow: hidden;">
            ${dayRows}
          </table>
          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 24px;">
            Shared via <a href="https://mindcraft.ing" style="color: #E09585; text-decoration: none;">Mindcraft</a> by All Minds On Deck
          </p>
        </div>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Mindcraft <noreply@allmindsondeck.org>",
      to: email,
      subject: `${programName} — ${days.length} Day${days.length !== 1 ? "s" : ""} of Insights`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error sharing daily summaries:", error);
    return NextResponse.json({ error: "Failed to share" }, { status: 500 });
  }
}
