/**
 * Seed PARACHUTE (layoff) program-specific exercises into frameworks_library.
 * These are the required coaching plan exercises unique to the layoff program arc.
 *
 * Run: npx tsx scripts/seed-layoff-exercises.ts
 *
 * Requires: frameworks-library-v2.sql migration applied first
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

// Use service role key to bypass RLS for seeding
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("Get it from: Supabase Dashboard → Settings → API → service_role key");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey
);

const COACH_ID = "00000000-0000-0000-0000-000000000001";

interface LayoffExercise {
  name: string;
  day: number;
  week: number;
  weekName: string;
  duration: number;
  isOnboarding: boolean;
  description: string;
  instructions: string;
  howToRun: string;
  themeTags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

const exercises: LayoffExercise[] = [
  // ── Week 1: GROUND ──
  {
    name: "Seven Disruptions Inventory",
    day: 1,
    week: 1,
    weekName: "GROUND",
    duration: 5,
    isOnboarding: true,
    description:
      "Map all seven disruptions of job loss on a 1-10 scale. Financial runway estimate. Support system inventory. Honest baseline that extends pre-start intake.",
    instructions: `Map all seven disruptions on a scale of 1–10. This is your baseline.

Rate each disruption 1–10 (10 = most intense):
- Income and Financial Security
- Routine and Structure
- Identity
- Social Belonging
- Sense of Competence
- Future Uncertainty
- Skill Confidence

Financial runway estimate: How many months can you sustain current spending?
Support system: Who knows? Who have you told? Who do you lean on?
What have you tried so far to process this?
Honest baseline. No reframing. Just where you are.`,
    howToRun:
      "Rate each disruption 1-10. Financial runway estimate. Support system inventory. What you've tried. Extends pre-start intake.",
    themeTags: ["grief_loss", "transition_grief", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "Timeline Mapping",
    day: 2,
    week: 1,
    weekName: "GROUND",
    duration: 5,
    isOnboarding: true,
    description:
      "Map the last 6-12 months: key events, emotional shifts, relationship dynamics, decision points. Captures narrative context for pattern detection.",
    instructions: `Map the last 6–12 months. Not just events — the emotional subtext underneath.

1. Draw a timeline: last 6–12 months
2. Mark key events: first warning signs, conversations, decisions, the day itself
3. For each event: what were you feeling? What did you tell yourself?
4. Relationship dynamics: who was involved? What shifted between you and key people?
5. Decision points: where did you have agency? Where didn't you?`,
    howToRun:
      "Timeline of last 6-12 months. Key events, emotional subtext, relationship dynamics, decision points.",
    themeTags: ["self_awareness", "grief_loss", "interpersonal_conflict"],
    difficulty: "intermediate",
  },
  {
    name: "Somatic Mapping + Family Patterns",
    day: 3,
    week: 1,
    weekName: "GROUND",
    duration: 5,
    isOnboarding: true,
    description:
      "Where stress lives physically. Family teachings on work, achievement, unemployment, worth. Physical stress mapping combined with family-of-origin exploration.",
    instructions: `Where does the loss live in your body? What did your family teach you about work and worth?

1. Body scan: where is tension, numbness, activation related to the job loss?
2. Map it: chest, stomach, shoulders, jaw, hands — name what you find
3. Family patterns:
   - What did your family believe about people who lose their jobs?
   - What was the message about professional achievement?
   - What happened when someone in your family struggled professionally?
   - What was rewarded? What was punished?
4. Connect: how do these family teachings show up in how you're processing this?`,
    howToRun:
      "Body scan for physical stress. Map family teachings on work, achievement, unemployment. Connect patterns.",
    themeTags: ["identity_self_worth", "self_awareness", "grief_loss"],
    difficulty: "intermediate",
  },
  {
    name: "Saboteur Identification",
    day: 4,
    week: 1,
    weekName: "GROUND",
    duration: 5,
    isOnboarding: false,
    description:
      "Identify top 2-3 saboteur patterns: what each says, when it's loudest, what it protects you from. Name them to create distance.",
    instructions: `Identify the top 2–3 inner critic patterns that are loudest right now.

1. What are the top 2–3 critical voices about your job loss?
2. For each saboteur:
   - What does it say? (Exact words)
   - When is it loudest? (Time of day, triggers, situations)
   - What is it trying to protect you from?
3. Give each a name that creates distance (The Prosecutor, The Perfectionist, etc.)
4. Notice: these voices predate this job. When did you first hear them?`,
    howToRun:
      "Identify 2-3 saboteur patterns. Exact words, triggers, protection function. Name each for distance.",
    themeTags: ["inner_critic", "fear_of_failure", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Financial Ground Truth",
    day: 5,
    week: 1,
    weekName: "GROUND",
    duration: 5,
    isOnboarding: false,
    description:
      "Separate financial facts from financial fear. Burn rate, runway, insurance facts. Three controllable actions. Three fear-based projections.",
    instructions: `Separate financial facts from financial fear.

1. Burn rate: monthly essential expenses (actual numbers)
2. Runway: months of savings at current burn rate
3. Insurance: status and timeline
4. Severance: amount and timeline
5. Three actions in your control right now
6. Three fears that are projections, not facts
7. The feeling underneath the financial anxiety — what is money representing?`,
    howToRun:
      "Burn rate, runway, insurance, severance facts. Three controllable actions. Three projections. What money represents.",
    themeTags: ["performance_anxiety", "control", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "Minimal Structure Design",
    day: 6,
    week: 1,
    weekName: "GROUND",
    duration: 3,
    isOnboarding: false,
    description:
      "Design three daily anchors: one physical, one reflective, one connective. A floor against dissolving into anxiety, not a productivity system.",
    instructions: `Design the smallest structure that would help — not a productivity system.

1. Choose three daily anchors:
   - One physical (walk, workout, cooking)
   - One reflective (this program)
   - One connective (call someone, text, be with people)
2. When? Assign rough times. Not rigid.
3. This is a floor, not a ceiling. It prevents dissolving into anxiety.
4. What old routine do you miss? What routine are you free of?`,
    howToRun:
      "Three daily anchors: physical, reflective, connective. Rough timing. Floor, not ceiling.",
    themeTags: ["resilience", "autonomy", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "Acceptance Curve Placement",
    day: 7,
    week: 1,
    weekName: "GROUND",
    duration: 3,
    isOnboarding: false,
    description:
      "Place yourself on the acceptance spectrum. What pulls backward? What creates forward movement? Week 1 check-in without pressure.",
    instructions: `Where are you? Not where you should be.

1. Place yourself on the acceptance spectrum:
   - Denial / Shock
   - Anger / Frustration
   - Bargaining / Replaying
   - Sadness / Grief
   - Acceptance / Integration
2. What keeps pulling you backward?
3. What creates forward movement?
4. What shifted since Day 1?
5. No pressure to be further along. Placement is awareness, not judgment.`,
    howToRun:
      "Place yourself on acceptance spectrum. What pulls backward, what creates forward movement. Compare to Day 1.",
    themeTags: ["grief_loss", "self_awareness", "transition_grief"],
    difficulty: "beginner",
  },

  // ── Week 2: DIG ──
  {
    name: "Role Identity Transition",
    day: 8,
    week: 2,
    weekName: "DIG",
    duration: 5,
    isOnboarding: false,
    description:
      "Explore who you were in the role vs. who you are without it. Based on Herminia Ibarra's Working Identity and IFS parts work.",
    instructions: `Who were you in that role? Who are you without it?

1. "In my last role I was known as ___"
2. "My status came from ___"
3. Which parts of you mourn that identity?
4. Which parts are relieved?
5. "The competency that matters beyond any role is ___"
6. "Emerging: what I'm noticing about myself without the title is ___"`,
    howToRun:
      "Role identity exploration. Known as, status from, parts mourning/relieved, emerging competency.",
    themeTags: ["identity_self_worth", "transition_grief", "grief_loss"],
    difficulty: "intermediate",
  },
  {
    name: "Belonging Inventory",
    day: 9,
    week: 2,
    weekName: "DIG",
    duration: 3,
    isOnboarding: false,
    description:
      "Map where you still belong. Separate work belonging from life belonging. Identify gaps and reconnection opportunities.",
    instructions: `Where do you still belong?

1. List: groups, people, places where you experience belonging
2. Separate work belonging from life belonging
3. Where are the gaps? What communities did you lose access to?
4. One place you could reconnect this week
5. Social connection regulates the nervous system — isolation after job loss is dysregulating`,
    howToRun:
      "List belonging sources. Separate work vs life belonging. Identify gaps. One reconnection this week.",
    themeTags: ["belonging", "grief_loss", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "Belief Inventory",
    day: 10,
    week: 2,
    weekName: "DIG",
    duration: 5,
    isOnboarding: false,
    description:
      "Map 5-10 professional beliefs: their origin, pre/post job loss status, which serve you and which are loud but unhelpful.",
    instructions: `Map the beliefs you carry about yourself as a professional.

1. List 5–10 beliefs about yourself as a professional
2. For each: where did it originate? (Family, first boss, specific experience)
3. Which existed before this job? Which are new since the loss?
4. Which serve you? Which are loud but not helpful?
5. Star the ones that feel most like facts. Those are the ones to examine.`,
    howToRun:
      "List 5-10 professional beliefs. Trace origin. Pre/post loss. Serving vs loud. Star the 'facts'.",
    themeTags: ["inner_critic", "identity_self_worth", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Family Patterns: Work and Worth",
    day: 11,
    week: 2,
    weekName: "DIG",
    duration: 5,
    isOnboarding: false,
    description:
      "Explore inherited achievement equations. Family teachings on unemployment. Company reward systems internalized as identity.",
    instructions: `The achievement equation you inherited.

1. What did your family believe about unemployed people?
2. What company reward systems did you internalize as identity?
3. When did work = worth get installed? Specific memory if possible.
4. Separate: what you believe when the inherited voice is quiet vs. when it's loud
5. Self-worth attached to title — be precise about what's attached to what`,
    howToRun:
      "Family beliefs about unemployment. Internalized reward systems. When work=worth was installed. Separate inherited voice from own.",
    themeTags: ["identity_self_worth", "inner_critic", "self_awareness"],
    difficulty: "advanced",
  },
  {
    name: "Saboteur Patterns in Action",
    day: 12,
    week: 2,
    weekName: "DIG",
    duration: 3,
    isOnboarding: false,
    description:
      "Track saboteurs from Day 4 in real situations this week. Practice the gap between noticing and being run by the pattern.",
    instructions: `Track your saboteurs in the wild.

1. For each saboteur identified on Day 4:
   - When did it show up this week?
   - What specific situation triggered it?
   - What did it drive you to do (or avoid)?
2. Practice the gap: the space between noticing the saboteur and being run by it
3. The saboteur as a colleague with bad data — how would you respond to that colleague?`,
    howToRun:
      "For each saboteur: when it showed up, trigger, what it drove. Practice the gap. Saboteur as colleague with bad data.",
    themeTags: ["inner_critic", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Values Excavation Part 1",
    day: 13,
    week: 2,
    weekName: "DIG",
    duration: 5,
    isOnboarding: false,
    description:
      "Extract values from three career moments of alignment — from lived experience, not a menu. Values exist in your history.",
    instructions: `Find your values in your actual experience — not from a menu.

1. Three career moments when you felt fully yourself — aligned, energized, real
2. For each moment:
   - What was happening?
   - Who was there?
   - What made it feel right?
3. Extract the values present in those moments
4. Your values exist in your history. They are not aspirational. They are patterns.`,
    howToRun:
      "Three aligned career moments. What was happening, who was there, what made it right. Extract values.",
    themeTags: ["purpose_alignment", "identity_self_worth", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Values Stack Ranking",
    day: 14,
    week: 2,
    weekName: "DIG",
    duration: 5,
    isOnboarding: false,
    description:
      "Force-rank values from Day 13: only three non-negotiables. When two conflict, which wins? Uncomfortable by design.",
    instructions: `Force the tradeoffs.

1. Take the values from Day 13 and any others that surfaced
2. Forced rank: only three can be non-negotiable
3. When two conflict, which wins? (Autonomy vs. security? Impact vs. stability?)
4. Look at your last job through these three: which were honored? Which violated?
5. Uncomfortable by design. The difficulty IS the exercise.`,
    howToRun:
      "Force-rank to 3 non-negotiables. Conflict resolution between values. Last job through this lens.",
    themeTags: ["purpose_alignment", "autonomy", "self_awareness"],
    difficulty: "intermediate",
  },

  // ── Week 3: BUILD ──
  {
    name: "Values Pressure Test",
    day: 15,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Run values against real job scenarios with real tradeoffs. Test where values hold firm vs where they bend.",
    instructions: `Run your values against real scenarios.

1. A role that pays well but violates your top value — what do you do?
2. A role that honors all three values but requires relocation — what do you do?
3. A role with a lower title but with a team and culture you'd love — what do you do?
4. How do your values actually guide decisions when there's real cost?
5. Where values hold firm = conviction. Where they bend = competing commitment.`,
    howToRun:
      "Three real scenarios with values tradeoffs. How values guide with real cost. Conviction vs competing commitment.",
    themeTags: ["purpose_alignment", "autonomy", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Structural Perspective",
    day: 16,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Locate your loss inside the system. Tech layoffs, AI restructuring. Structural, not just personal. Locating, not minimizing.",
    instructions: `Your loss inside a system.

1. Tech layoffs in the last 2 years — not just yours
2. AI restructuring — roles being redefined, not just eliminated
3. Your loss inside a system that routinely discards people while calling it optimization
4. This is locating, not minimizing. Your pain is real AND the system produced it.
5. What changes when you see your experience as structural, not just personal?`,
    howToRun:
      "Industry context for personal experience. Tech layoffs, AI restructuring. Locating, not minimizing.",
    themeTags: ["identity_self_worth", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Evidence Collection",
    day: 17,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "10 specific things you did well. Not strengths — specific accomplishments. Counter-record against the saboteur's narrative.",
    instructions: `Build the counter-record.

1. List 10 specific things you did well in your career
2. Not strengths. Specific things. "I redesigned the onboarding flow and reduced churn by 12%"
3. Include things nobody thanked you for
4. Include things that came naturally to you (these are often your strongest competencies)
5. This is a counter-record against the story your saboteur tells`,
    howToRun:
      "10 specific accomplishments. Include unthanked work and natural competencies. Counter-record.",
    themeTags: ["identity_self_worth", "resilience", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "Narrative Construction Part 1",
    day: 18,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Write three versions of your story: acquaintance, close friend, 3am. Compare which is closest to true.",
    instructions: `Three versions of the story.

1. Write the acquaintance version — what you say at a party
2. Write the close friend version — what you say after two glasses of wine
3. Write the 3am version — what you say to yourself at night
4. Compare. Which is closest to true?
5. Which version are you most attached to? Why?`,
    howToRun:
      "Three story versions: acquaintance, close friend, 3am. Compare for truth. Examine attachment.",
    themeTags: ["identity_self_worth", "vulnerability_avoidance", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Structural Perspective: AI and Market",
    day: 19,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Industry context for personal shame. Separate what's about you from what's about the market. Neither all-your-fault nor none-of-it.",
    instructions: `Industry context for personal experience.

1. What's happening in your industry right now?
2. What roles are being redefined by AI?
3. Separate personal shame from systemic factors
4. What part of your situation is about you? What part is about the market?
5. Locating yourself accurately: neither all-your-fault nor none-of-it`,
    howToRun:
      "Industry analysis. AI impact on roles. Separate personal from systemic. Accurate self-location.",
    themeTags: ["identity_self_worth", "fear_of_failure", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Narrative Refinement",
    day: 20,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Write the story you can stand behind. True, not self-punishing, not performatively positive. Yours.",
    instructions: `The story you can stand behind.

1. Take Day 18's three versions
2. Write one version that is:
   - True
   - Not self-punishing
   - Not performatively positive
   - Yours
3. Read it aloud. Does it sound like you?
4. This is not final. There is no final. This is where you are today.`,
    howToRun:
      "Synthesize three versions into one true narrative. Read aloud. Not final — where you are today.",
    themeTags: ["identity_self_worth", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Skill Audit",
    day: 21,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Separate real skill gaps from fear-driven projections. Confident skills, atrophied skills, feared-obsolete skills.",
    instructions: `What's real and what's fear about your capabilities.

1. Skills you're confident in — specific, demonstrable
2. Skills that have atrophied — when did you last use them?
3. Skills you're afraid are obsolete — is that fear or fact?
4. Separate real gaps from fear-driven projections
5. One skill you could sharpen this week that would build confidence`,
    howToRun:
      "Confident skills, atrophied skills, feared-obsolete skills. Separate real from projected. One to sharpen.",
    themeTags: ["fear_of_failure", "identity_self_worth", "self_awareness"],
    difficulty: "intermediate",
  },

  // ── Week 4: INTEGRATE ──
  {
    name: "Emergence Mapping",
    day: 22,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "What wants to emerge behind the old role mask? Follow it 10% — not commit, just explore.",
    instructions: `What wants to emerge behind the old role mask?

1. What interest, direction, or energy has surfaced during these three weeks?
2. What would it look like to follow it 10% — not commit, just explore?
3. What part of you is excited? What part is terrified?
4. The old role was a container. What's pushing through the cracks?`,
    howToRun:
      "Emerging interests from three weeks. Follow 10%. Excited/terrified parts. What's pushing through.",
    themeTags: ["growth_momentum", "purpose_alignment", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Integration Review",
    day: 23,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Three-week anchor. What shifted, what surprised, what's still working on you, what would you tell Day 1 you.",
    instructions: `The anchor day.

1. Three weeks in. What shifted?
2. What surprised you about yourself?
3. What's still working on you — themes that won't resolve?
4. What tool or exercise hit hardest?
5. What would you tell Day 1 you?`,
    howToRun:
      "Three-week review. Shifts, surprises, unresolved themes, hardest exercise, message to Day 1 self.",
    themeTags: ["self_awareness", "growth_momentum", "resilience"],
    difficulty: "beginner",
  },
  {
    name: "Seven Disruptions Reassessment",
    day: 24,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Same seven disruptions, same 1-10 scale. Compare Day 1 baseline. Movement is data. Non-movement is also data.",
    instructions: `Same instrument. Different person.

1. Rate each disruption 1–10 again:
   - Income and Financial Security
   - Routine and Structure
   - Identity
   - Social Belonging
   - Sense of Competence
   - Future Uncertainty
   - Skill Confidence
2. Compare with Day 1 ratings
3. Where did you move? Where are you stuck?
4. Movement is data. Non-movement is also data.`,
    howToRun:
      "Re-rate seven disruptions 1-10. Compare Day 1. Identify movement and stuckness.",
    themeTags: ["self_awareness", "growth_momentum", "transition_grief"],
    difficulty: "beginner",
  },
  {
    name: "Saboteur Contingency Plan",
    day: 25,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "For each saboteur: if it activates, I will ___. Written, specific, rehearsed plans. Not elimination — not being run by it.",
    instructions: `Plans for when the saboteurs activate.

1. For each saboteur identified on Day 4:
   - When it activates, I will ___
   - The regulation tool I'll use is ___
   - The truth I'll remind myself of is ___
2. Written. Specific. Rehearsed.
3. Not about eliminating the saboteur. About not being run by it.`,
    howToRun:
      "Contingency per saboteur: activation response, regulation tool, truth reminder. Written and rehearsed.",
    themeTags: ["inner_critic", "resilience", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Values Decision Framework",
    day: 26,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Run values against real scenarios with real tradeoffs. Decision tools, not abstract reflection.",
    instructions: `Values as decision tools.

1. Run your top 3 values against real scenarios:
   - Role that pays well but violates top value
   - Great culture but title step-down
   - Remote but isolated from industry
2. How do values guide when there's real cost?
3. Decision tools, not abstract reflection`,
    howToRun:
      "Three real scenarios against top 3 values. Real cost tradeoffs. Decision tools.",
    themeTags: ["purpose_alignment", "autonomy", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Narrative Under Conditions",
    day: 27,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Pressure-test the Day 20 narrative. Say it aloud, record if willing. Where does it feel forced vs true?",
    instructions: `Pressure-test the story.

1. Say the Day 20 narrative out loud
2. Record yourself if willing
3. Does it sound like you?
4. Where does it feel forced? Where does it feel true?
5. Not final. There is no final. This is where you are today.`,
    howToRun:
      "Say narrative aloud. Record optional. Assess forced vs true. Update if needed.",
    themeTags: ["identity_self_worth", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Open Threads Inventory",
    day: 28,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Name what is not done. Active grief, sticky beliefs, practical concerns, relational threads. Visible, not lurking.",
    instructions: `Name what is not done.

1. Active grief: what are you still grieving?
2. Sticky beliefs: which beliefs haven't shifted?
3. Practical concerns: what needs concrete action?
4. Relational threads: conversations needed?
5. Make them visible, not lurking. Visible threads can be addressed. Invisible ones drive behavior.`,
    howToRun:
      "Inventory: active grief, sticky beliefs, practical concerns, relational threads. Make visible.",
    themeTags: ["grief_loss", "self_awareness", "growth_momentum"],
    difficulty: "intermediate",
  },
  {
    name: "Letter to Future Self",
    day: 29,
    week: 4,
    weekName: "INTEGRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Write to yourself in 90 days. What do you want to remember? What commitment are you making?",
    instructions: `Write to yourself in 90 days.

1. System generates 30-day summary
2. Review and annotate
3. Write a letter to yourself 90 days from now
4. What do you want to remember about this time?
5. What commitment are you making?`,
    howToRun:
      "Review 30-day summary. Write letter to 90-day-future self. Remember and commit.",
    themeTags: ["growth_momentum", "purpose_alignment", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "One Sentence",
    day: 30,
    week: 4,
    weekName: "INTEGRATE",
    duration: 3,
    isOnboarding: false,
    description:
      "One sentence: where you are today. Not where you wish. Not where you should be. Where you actually are.",
    instructions: `Where you are today.

1. One sentence. Where you are today.
2. Not where you wish you were. Not where you think you should be.
3. Where you actually are.
4. Read it. Sit with it.`,
    howToRun: "One sentence. Where you are. Read it. Sit with it.",
    themeTags: ["self_awareness", "resilience", "growth_momentum"],
    difficulty: "beginner",
  },
];

async function main() {
  console.log("Seeding PARACHUTE (layoff) program-specific exercises...\n");

  let inserted = 0;
  let failed = 0;

  for (const ex of exercises) {
    const { error } = await supabase.from("frameworks_library").insert({
      coach_id: COACH_ID,
      name: ex.name,
      description: ex.description,
      instructions: ex.instructions,
      category: `Week ${ex.week}: ${ex.weekName}`,
      difficulty_level: ex.difficulty,
      theme_tags: ex.themeTags,
      active: true,
      // V2 columns
      exercise_scope: "program_specific",
      program_slug: "layoff",
      source_file: "layoff-exercises",
      modality: "integrative", // Program exercises are multi-modal by nature
      originator: "All Minds on Deck",
      source_work: "PARACHUTE Program",
      duration_minutes: ex.duration,
      when_to_use: `Day ${ex.day} coaching plan exercise`,
      neuroscience_rationale: null,
      coaching_questions: [],
      file_line_ref: `layoff:day${ex.day}`,
      how_to_run: ex.howToRun,
      solo_adaptation: null,
    });

    if (error) {
      console.warn(`  ⚠ Failed: "${ex.name}" — ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ Day ${ex.day}: ${ex.name}`);
      inserted++;
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log(`Total exercises:  ${exercises.length}`);
  console.log(`Inserted:         ${inserted}`);
  console.log(`Failed:           ${failed}`);
  console.log("══════════════════════════════════════════");
}

main().catch(console.error);
