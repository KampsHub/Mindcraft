import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // If this is a password recovery flow, redirect to reset page
    if (data?.session?.user?.recovery_sent_at || next === "/reset-password") {
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
