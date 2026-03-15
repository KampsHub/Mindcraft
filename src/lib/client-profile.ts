import { createClient } from "@supabase/supabase-js";

/**
 * Client Profile helper — fetches personalization documents from client_profiles table.
 *
 * Three depth levels control how much context downstream routes receive:
 * - 'summary'  → client_context only (lightweight, for daily-themes, daily-exercise)
 * - 'edges'    → client_context + growth_edges (for process-journal, daily-summary, reflect)
 * - 'full'     → all three documents (for weekly-insights, framework-analysis)
 *
 * Returns null gracefully if profile doesn't exist yet (Days 1-3).
 */

export type ProfileDepth = "summary" | "edges" | "full";

export interface ClientProfileContext {
  client_context: Record<string, unknown>;
  growth_edges?: Record<string, unknown>;
  development_map?: Record<string, unknown>;
  observations_log?: Record<string, unknown>[];
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getClientProfile(
  enrollmentId: string,
  depth: ProfileDepth = "summary"
): Promise<ClientProfileContext | null> {
  try {
    const admin = getAdminSupabase();

    // Select only the columns we need for this depth
    let selectColumns = "client_context";
    if (depth === "edges") {
      selectColumns = "client_context, growth_edges";
    } else if (depth === "full") {
      selectColumns = "client_context, growth_edges, development_map, observations_log";
    }

    const { data, error } = await admin
      .from("client_profiles")
      .select(selectColumns)
      .eq("enrollment_id", enrollmentId)
      .single();

    if (error || !data) {
      // Profile doesn't exist yet — graceful fallback
      return null;
    }

    return data as unknown as ClientProfileContext;
  } catch {
    // Table may not exist or other error — don't break the calling route
    return null;
  }
}

/**
 * Formats the client profile as a string section to inject into Claude prompts.
 * Returns empty string if no profile exists.
 */
export function formatProfileForPrompt(
  profile: ClientProfileContext | null,
  depth: ProfileDepth = "summary"
): string {
  if (!profile) return "";

  const sections: string[] = [];

  // Always include client context
  const ctx = profile.client_context;
  if (ctx && Object.keys(ctx).length > 0) {
    sections.push(`## Who This Person Is (Client Profile)
${formatContextBrief(ctx)}`);
  }

  // Include growth edges at 'edges' or 'full' depth
  if ((depth === "edges" || depth === "full") && profile.growth_edges) {
    const edges = profile.growth_edges;
    const edgesList = (edges as Record<string, unknown>).edges as Record<string, unknown>[];
    if (edgesList && edgesList.length > 0) {
      const edgeText = edgesList
        .map((e) => `- **${e.name}**: ${e.what_seems_to_happen}`)
        .join("\n");
      sections.push(`## Known Growth Edges
${edgeText}

When you see these patterns in today's work, name them by their edge name. Connect today's journal to these ongoing edges where you see genuine connection — don't force it.`);
    }
  }

  // Include development map at 'full' depth
  if (depth === "full" && profile.development_map) {
    const map = profile.development_map;
    const traits = (map as Record<string, unknown>).traits as Record<string, unknown>[];
    if (traits && traits.length > 0) {
      const traitText = traits
        .map((t) => `- **${t.trait}** (${t.where_they_seem_to_be}): ${t.evidence}`)
        .join("\n");
      sections.push(`## Development Map
${traitText}`);
    }
  }

  // Include recent observations at 'full' depth
  if (depth === "full" && profile.observations_log) {
    const obs = profile.observations_log;
    if (obs.length > 0) {
      // Last 7 observations max
      const recent = obs.slice(-7);
      const obsText = recent
        .map((o) => `- Day ${o.day}: ${o.observation} (${o.evidence})`)
        .join("\n");
      sections.push(`## Recent Observations
${obsText}`);
    }
  }

  return sections.length > 0
    ? `\n\n---\n\n# CLIENT PERSONALIZATION CONTEXT\nThis person has been in the program. Here's what we know about them so far. Use this to personalize your response — reference their patterns, use their language, connect to their edges. But don't recite this back to them. Let it inform how you see what they wrote today.\n\n${sections.join("\n\n")}\n\n---\n\n`
    : "";
}

/**
 * Formats the client_context JSON into readable prose for prompts.
 */
function formatContextBrief(ctx: Record<string, unknown>): string {
  const lines: string[] = [];

  if (ctx.who_they_are) lines.push(`**Who they are:** ${ctx.who_they_are}`);
  if (ctx.presenting_situation) lines.push(`**Why they're here:** ${ctx.presenting_situation}`);
  if (ctx.relational_style) lines.push(`**Relational style:** ${ctx.relational_style}`);
  if (ctx.coping_patterns) lines.push(`**Coping patterns:** ${ctx.coping_patterns}`);
  if (ctx.strengths_visible) lines.push(`**Strengths:** ${ctx.strengths_visible}`);
  if (ctx.active_tensions) lines.push(`**Active tensions:** ${ctx.active_tensions}`);
  if (ctx.voice_notes) lines.push(`**How to talk to them:** ${ctx.voice_notes}`);

  return lines.join("\n");
}

/**
 * Appends a new observation to the client_profiles.observations_log.
 * Uses admin client. Silently fails if profile doesn't exist.
 */
export async function appendObservation(
  enrollmentId: string,
  observation: {
    day: number;
    date: string;
    observation: string;
    evidence: string;
    connects_to: string | null;
  }
): Promise<void> {
  try {
    const admin = getAdminSupabase();

    // Fetch current log
    const { data } = await admin
      .from("client_profiles")
      .select("observations_log")
      .eq("enrollment_id", enrollmentId)
      .single();

    if (!data) return;

    const currentLog = (data.observations_log as Record<string, unknown>[]) || [];
    currentLog.push(observation);

    await admin
      .from("client_profiles")
      .update({ observations_log: currentLog })
      .eq("enrollment_id", enrollmentId);
  } catch {
    // Silently fail — observations are supplementary
  }
}
