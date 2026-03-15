import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface Insight {
  insight: string;
  source: string;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, insights, weekNumber, programName } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return NextResponse.json({ error: "At least one insight is required." }, { status: 400 });
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

    const typeLabels: Record<string, string> = {
      pattern: "Pattern",
      shift: "Shift",
      sticking_point: "Sticking Point",
      breakthrough: "Breakthrough",
      connection: "Connection",
    };

    const insightRows = (insights as Insight[])
      .map(
        (ins) => `
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #2a2a30;">
            <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 100px; background-color: rgba(224,149,133,0.12); color: #e09585; margin-bottom: 8px;">
              ${typeLabels[ins.type] || ins.type}
            </span>
            <p style="font-size: 14px; color: #d4cdd2; line-height: 1.6; margin: 6px 0 0 0;">
              ${ins.insight.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </p>
            <p style="font-size: 12px; color: #99929b; margin: 6px 0 0 0;">
              Source: ${ins.source.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </p>
          </td>
        </tr>`
      )
      .join("");

    const html = `
    <div style="background-color: #1c1917; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: 700; color: #e4dde2; margin: 0 0 6px 0; letter-spacing: -0.03em;">
          Weekly Insights — Week ${weekNumber}
        </h1>
        <p style="font-size: 14px; color: #99929b; margin: 0 0 24px 0;">
          ${programName || "Mindcraft"} coaching program
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #27272c; border-radius: 14px; border: 1px solid #333339; overflow: hidden;">
          ${insightRows}
        </table>
        <p style="font-size: 12px; color: #6b6570; margin: 24px 0 0 0; text-align: center;">
          Shared from Mindcraft by All Minds on Deck LLC
        </p>
      </div>
    </div>`;

    await resend.emails.send({
      from: "Mindcraft <noreply@allmindsondeck.org>",
      to: email,
      subject: `Mindcraft — Week ${weekNumber} Insights`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Share insights error:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
