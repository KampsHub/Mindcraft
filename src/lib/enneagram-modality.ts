/**
 * Enneagram → modality weighting.
 *
 * Each exercise in frameworks_library is tagged with a `modality`. When we
 * pick today's exercise, we multiply its relevance by a per-type preference
 * weight — the same pool, smarter selection.
 *
 * Why per type:
 *   - Type 4 (feeling, already interior) → needs somatic/narrative to drop out of the loop
 *   - Type 6 (head/fear) → needs grounding + cognitive structure, not open-ended prompts
 *   - Type 9 (merging/collapsing) → needs agency-naming + small-action, not vague reflection
 *   - Type 5 (withdrawing) → needs brief + low-intensity first, high friction pushes them away
 *
 * This is a bias, not a filter. Every modality still gets non-zero weight so the matcher
 * can pull in counter-modalities when the journal really calls for it.
 */

export type Modality = "somatic" | "cognitive" | "narrative" | "relational" | "guided";

// Neutral fallback weight
const NEUTRAL: Record<Modality, number> = {
  somatic: 1.0,
  cognitive: 1.0,
  narrative: 1.0,
  relational: 1.0,
  guided: 1.0,
};

// Per-type preference map. Values are multipliers (>1 = preferred, <1 = de-emphasized).
// Weights kept in the 0.7–1.4 range so the nudge is meaningful but not absolute.
const WEIGHTS_BY_TYPE: Record<string, Record<Modality, number>> = {
  "1": { somatic: 1.25, cognitive: 0.85, narrative: 1.05, relational: 1.05, guided: 1.1 },   // Perfectionist — tight inner critic; needs body relief + permission
  "2": { somatic: 1.05, cognitive: 1.0,  narrative: 1.15, relational: 0.85, guided: 1.1 },   // Helper — over-relational; needs own-voice narrative + self-return
  "3": { somatic: 1.25, cognitive: 0.9,  narrative: 1.1,  relational: 0.95, guided: 1.0 },   // Achiever — performs through; needs somatic + honest narrative
  "4": { somatic: 1.35, cognitive: 1.0,  narrative: 1.3,  relational: 0.9,  guided: 0.95 },  // Individualist — stuck in feeling loop; needs body + story out of interpretation
  "5": { somatic: 0.95, cognitive: 1.15, narrative: 1.1,  relational: 0.8,  guided: 1.3 },   // Observer — withdrawal + low-friction; brief guided wins
  "6": { somatic: 1.2,  cognitive: 1.3,  narrative: 1.0,  relational: 1.0,  guided: 1.25 },  // Loyalist — fear loops; grounding + structured cognitive
  "7": { somatic: 1.3,  cognitive: 1.05, narrative: 1.1,  relational: 1.0,  guided: 0.9 },   // Enthusiast — escape via planning; needs body + stillness
  "8": { somatic: 1.2,  cognitive: 0.95, narrative: 1.1,  relational: 1.15, guided: 0.95 },  // Challenger — armored; needs body softening + vulnerability in relation
  "9": { somatic: 1.05, cognitive: 1.15, narrative: 1.0,  relational: 1.1,  guided: 1.3 },   // Peacemaker — stalls on open prompts; needs agency-naming + small-action
};

/** Parses type from messy input ("4", 4, "4w5", "Type 4") into "1"–"9" or null. */
export function normalizeType(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  const match = s.match(/[1-9]/);
  return match ? match[0] : null;
}

/**
 * Returns the modality weight for a given type. If type is unknown,
 * returns the neutral map so the caller can always multiply safely.
 */
export function getModalityWeights(type: string | null): Record<Modality, number> {
  if (!type) return NEUTRAL;
  return WEIGHTS_BY_TYPE[type] ?? NEUTRAL;
}

/**
 * Score a framework's modality for a user's type. Returns 1.0 if either
 * the modality or the type isn't recognized.
 */
export function scoreFrameworkForType(
  modality: string | null | undefined,
  type: string | null
): number {
  if (!modality) return 1.0;
  const weights = getModalityWeights(type);
  const key = modality.toLowerCase() as Modality;
  return weights[key] ?? 1.0;
}

/**
 * Sort candidate frameworks by modality preference for the given type.
 * Stable — preserves original order within equal scores.
 */
export function rankByType<T extends { modality?: string | null }>(
  candidates: T[],
  type: string | null
): T[] {
  if (!type) return candidates;
  return [...candidates]
    .map((c, i) => ({ c, score: scoreFrameworkForType(c.modality, type), i }))
    .sort((a, b) => (b.score - a.score) || (a.i - b.i))
    .map((x) => x.c);
}

/**
 * Per-type × per-modality rationale lines. Used in the Claude prompt so the
 * delivered exercise's "what_this_is" / introduction can reference *why* this
 * modality tends to help this type. Keep each line to one sentence.
 *
 * Only the top-preferred modalities per type are filled in — others return "".
 */
const RATIONALE: Record<string, Partial<Record<Modality, string>>> = {
  "1": {
    somatic: "Ones often hold criticism in the body before it surfaces as thought — this exercise gives the body a place to set it down.",
    guided: "Ones benefit from structure that temporarily relieves them of self-monitoring — the container does the work so you don't have to.",
  },
  "2": {
    narrative: "Twos spend so much time tuned to other people that their own voice can go faint — this exercise is a place to hear yourself without an audience.",
    guided: "Twos do well with a structure that gives them permission to receive instead of give.",
  },
  "3": {
    somatic: "Threes tend to outrun what their body is telling them. This exercise slows the loop enough for sensation to land.",
    narrative: "Threes default to the polished version. This exercise invites a less-curated story.",
  },
  "4": {
    somatic: "Fours often stay in the feeling loop — this exercise drops you out of interpretation and into sensation, where the actual shift happens.",
    narrative: "Fours make meaning fast. This exercise uses that strength by asking for a specific story, not a general mood.",
  },
  "5": {
    guided: "Fives conserve. A short, structured exercise lets you engage without feeling drained — the frame is the permission.",
    cognitive: "Fives prefer ideas they can walk around before committing. This exercise gives you something to think with, not respond to.",
  },
  "6": {
    cognitive: "Sixes run fear forward until it becomes a story. This exercise interrupts the story with a concrete structure your mind can use.",
    guided: "Sixes do better when the ground is named up front. The structure of this exercise is the grounding.",
    somatic: "For Sixes, fear tends to live in the body before it becomes thought. This exercise catches it earlier.",
  },
  "7": {
    somatic: "Sevens escape through planning. This exercise asks the body to stay, which is where the actual information lives.",
    narrative: "Sevens collect experiences faster than they integrate them. This is a place to digest one.",
  },
  "8": {
    somatic: "Eights lead with armor. This exercise gives the body a chance to soften before the mind has to catch up.",
    relational: "Eights often protect by isolating. This exercise re-introduces a small, safe contact point.",
  },
  "9": {
    guided: "Nines tend to collapse into 'I don't know.' This exercise asks for one specific thing — small enough not to trigger the stall, big enough to register as a choice.",
    cognitive: "Nines benefit from naming what they actually want, on the page, in words. This exercise makes the naming concrete.",
  },
};

/**
 * Returns a one-sentence rationale for why this modality helps this type,
 * or empty string if we don't have tailored copy.
 */
export function getTypeRationale(
  type: string | null,
  modality: string | null | undefined
): string {
  if (!type || !modality) return "";
  const key = modality.toLowerCase() as Modality;
  return RATIONALE[type]?.[key] ?? "";
}
