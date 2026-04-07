import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendServerEvent, syntheticClientId } from "@/lib/ga-measurement-protocol";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      // Fire silent failure signal so we can detect broken OAuth round-trips.
      await sendServerEvent(
        syntheticClientId(`auth_callback.${Date.now()}`),
        "auth_callback_failed",
        { error_message: exchangeError.message },
      );
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }

    // If this is a password recovery flow, redirect to reset page
    // Use AMR claim (most reliable), fall back to next param or recovery_sent_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = data?.session as Record<string, any> | undefined;
    const isRecovery =
      next === "/reset-password" ||
      session?.amr?.some((a: { method: string }) => a.method === "recovery");
    if (isRecovery) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    // Fire welcome email (non-blocking — don't let it delay the redirect)
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    fetch(`${origin}/api/welcome-email`, {
      method: "POST",
      headers: { cookie: cookieHeader },
    }).catch(() => {
      // Silently ignore — welcome email is best-effort
    });
  }

  // Honor the `next` param if provided, otherwise default to journal
  const redirectTo = next || "/mindful-journal";
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
