import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appendObservation } from "@/lib/client-profile";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { enrollmentId, dayNumber, exerciseName, modality, rating } = body;

    if (!enrollmentId || !exerciseName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Build observation
    const observation = {
      day: dayNumber,
      date: new Date().toISOString().split("T")[0],
      observation: `Completed "${exerciseName}" (${modality || "mixed"})${rating ? ` — rated ${rating}/5` : ""}`,
      evidence: rating && rating <= 2 ? "Low rating may indicate poor fit or resistance" : rating && rating >= 4 ? "High rating suggests good resonance" : "",
      connects_to: modality || "general",
    };

    await appendObservation(enrollmentId, observation);

    return NextResponse.json({ logged: true });
  } catch (error) {
    // Non-blocking — don't fail the user flow
    console.error("Observation log error:", error);
    return NextResponse.json({ logged: false });
  }
}
