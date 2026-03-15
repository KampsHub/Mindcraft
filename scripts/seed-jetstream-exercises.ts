/**
 * Seed JETSTREAM (performance_plan) program-specific exercises into frameworks_library.
 * These are the required coaching plan exercises and adaptive exercises
 * unique to the performance improvement plan (PIP) program arc.
 *
 * Run: npx tsx scripts/seed-jetstream-exercises.ts
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

interface JetstreamExercise {
  name: string;
  day: number | null; // null for adaptive exercises
  week: number;
  weekName: string;
  duration: number;
  isOnboarding: boolean;
  description: string;
  instructions: string;
  howToRun: string;
  themeTags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  isAdaptive?: boolean;
  trigger?: string;
}

const exercises: JetstreamExercise[] = [
  // ── Week 1: LAND ──
  {
    name: "Seven Disruptions Inventory (PIP)",
    day: 1,
    week: 1,
    weekName: "LAND",
    duration: 5,
    isOnboarding: true,
    description:
      "Maps seven PIP-specific disruptions on a 1-10 scale: professional identity threat, competence confidence, workplace belonging, trust in management, financial security, daily emotional regulation, future career trajectory. Honest baseline that extends pre-start intake.",
    instructions: `Map the seven disruptions of being placed on a PIP. This is your baseline.

Rate each disruption 1–10 (10 = most intense):
- Professional Identity Threat — how much has the PIP shaken your sense of who you are at work?
- Competence Confidence — how certain are you that you can actually do this job?
- Workplace Belonging — how connected vs. isolated do you feel at work right now?
- Trust in Management — how much do you trust your manager's intentions?
- Financial Security — how much is financial fear driving your decisions?
- Daily Emotional Regulation — how hard is it to get through a workday without being flooded?
- Future Career Trajectory — how much has the PIP changed your view of your professional future?

Which disruption is loudest right now?
Which one are you pretending is fine but isn't?
Financial runway estimate: how many months can you sustain current spending if this ends in departure?
Support system: who knows about the PIP? Who have you told? Who do you lean on?
Honest baseline. No reframing. Just where you are.`,
    howToRun:
      "Rate each of seven PIP disruptions 1-10. Financial runway estimate. Support system inventory. Extends pre-start intake.",
    themeTags: ["identity_self_worth", "self_awareness", "performance_anxiety"],
    difficulty: "beginner",
  },
  {
    name: "Saboteur Identification (PIP)",
    day: 2,
    week: 1,
    weekName: "LAND",
    duration: 5,
    isOnboarding: true,
    description:
      "Introduction to the saboteur framework with PIP-specific archetypes (Pleaser, Hyper-Achiever, Controller, Victim, Hyper-Vigilant, Avoider). Maps top 2-3 saboteurs currently active. Introduces three stress-response directions (moving toward/against/away) as a general framework. Client identifies default direction under PIP pressure.",
    instructions: `Identify the saboteur patterns that are loudest under PIP pressure.

PIP-specific archetypes — which are running your behavior right now?
- Pleaser: agreeing to everything, over-apologizing, managing impressions
- Hyper-Achiever: overworking to prove worth, burning out to meet every metric
- Controller: trying to manage every variable, micromanaging your own output
- Victim: "this is unfair," "nothing I do matters," learned helplessness
- Hyper-Vigilant: scanning every interaction for threat, reading into every email
- Avoider: procrastinating on PIP requirements, not opening emails, numbing out

Name your top 2–3. For each:
- What does it say? (Exact words)
- When is it loudest? (Time of day, triggers, situations)
- What is it trying to protect you from?
- Give it a name that creates distance

Three stress-response directions (Karen Horney):
- Moving toward: complying, seeking approval, performing "good employee"
- Moving against: pushing back, controlling, fighting the process
- Moving away: withdrawing, numbing, mentally checking out

Which direction is your default under PIP pressure? This is not permanent. It is a pattern.`,
    howToRun:
      "Identify 2-3 PIP-specific saboteur archetypes. Exact words, triggers, protection function. Map stress-response direction.",
    themeTags: ["inner_critic", "fear_of_failure", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Saboteur Log",
    day: 3,
    week: 1,
    weekName: "LAND",
    duration: 5,
    isOnboarding: true,
    description:
      "Real-time tracking practice. Client logs each saboteur activation using a structured format: trigger, which saboteur, what it said, what client did, body signal, what they would do with awareness. Ongoing practice through the program. Builds the gap between trigger and response.",
    instructions: `Start tracking your saboteurs in real time. This is an ongoing practice — not a one-day exercise.

For each activation this week, log:
1. Trigger — what happened? (email, meeting, interaction, thought)
2. Which saboteur? — name it
3. What it said — exact internal dialogue
4. What you did — the behavior it drove (or the behavior you avoided)
5. Body signal — where did you feel it? (chest tightening, stomach dropping, jaw clenching, shallow breathing)
6. With awareness — what would you do differently?

The body signal is the earliest warning. Learn to read it.

The gap between trigger and response is where the work lives. You are not trying to eliminate the saboteur. You are building the space between noticing it and being run by it.

This log becomes data for Day 18 — The Saboteur's Professional Cost. The more honest you are now, the more useful that exercise will be.`,
    howToRun:
      "Log each saboteur activation: trigger, saboteur, dialogue, behavior, body signal, alternative. Ongoing practice.",
    themeTags: ["inner_critic", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Document vs. Story",
    day: 4,
    week: 1,
    weekName: "LAND",
    duration: 5,
    isOnboarding: false,
    description:
      "Two-column exercise. Column one: what the PIP document says verbatim. Column two: the story the client has added (interpretations, catastrophizing, minimizing, assumptions about intent). Applies saboteur lens to column two. Separates actionable document from emotional narrative.",
    instructions: `Separate the document from the story you have added to it.

You need your PIP document for this exercise.

Column 1 — The Document
Write out what the PIP actually says. Verbatim. Each specific requirement, metric, timeline, or behavioral expectation. Just the words on the page.

Column 2 — The Story
For each item in Column 1, write the story you have added:
- Interpretations ("They're trying to push me out")
- Catastrophizing ("I'll never recover from this")
- Minimizing ("This isn't a big deal, I'll just work harder")
- Assumptions about intent ("My manager doesn't care about my development")

Saboteur lens:
Which saboteur authored Column 2? The Victim sees malice. The Hyper-Achiever sees a challenge to conquer. The Avoider sees a document to ignore.

The document is actionable. The story is what your saboteur does with the document. You can respond to the document. You cannot respond to a story.`,
    howToRun:
      "Two columns: PIP verbatim vs. story added. Apply saboteur lens to column two. Separate actionable from narrative.",
    themeTags: ["inner_critic", "self_awareness", "performance_anxiety"],
    difficulty: "intermediate",
  },
  {
    name: "Three Columns (Valid / Political / Cannot Tell)",
    day: 5,
    week: 1,
    weekName: "LAND",
    duration: 5,
    isOnboarding: false,
    description:
      "Client sorts PIP feedback into three columns: valid (genuine development areas independent of who delivers the message), political (organizational dynamics, manager style mismatch, shifting expectations), and cannot tell (where self-protective instincts and honest self-assessment give different answers). Saboteur overlay on sorting tendency.",
    instructions: `Sort the feedback. Not all of it is the same.

Take each piece of PIP feedback and sort it into three columns:

Column 1 — Valid
Genuine development areas. Independent of who delivered the message. If a coach you respected said the same thing, would you agree?
- What skill gaps are real?
- What behavior patterns are legitimate concerns?
- What would you want to work on even without the PIP?

Column 2 — Political
Organizational dynamics, not personal performance:
- Manager style mismatch
- Shifting expectations after reorg
- Role was redefined without your input
- Personality conflict masked as performance issue

Column 3 — Cannot Tell
Where self-protective instincts and honest self-assessment give different answers:
- You genuinely cannot determine if this is about you or the system
- Your saboteur wants to sort it one way, your gut says another
- More data needed

Saboteur overlay: which saboteur wants to fill which column first?
- The Victim fills Column 2 ("none of this is fair")
- The Hyper-Achiever fills Column 1 ("I'll fix everything")
- The Avoider puts everything in Column 3 ("I can't tell")

Column 3 is the primary work. It resists binary thinking about feedback validity.`,
    howToRun:
      "Sort PIP feedback: valid, political, cannot tell. Saboteur overlay on sorting tendency. Column 3 is the real work.",
    themeTags: ["self_awareness", "inner_critic", "performance_anxiety"],
    difficulty: "advanced",
  },
  {
    name: "Reading the Room",
    day: 6,
    week: 1,
    weekName: "LAND",
    duration: 5,
    isOnboarding: false,
    description:
      "Political landscape mapping. Client maps: who initiated the PIP, who approved it, manager's incentive (develop or terminate), HR signals, advocate inventory. Assesses honest probability that the PIP is survivable. Applies saboteur lens to the probability estimate.",
    instructions: `Map the political landscape. Not the story — the structure.

1. Who initiated the PIP? (Manager? Skip-level? HR?) What does that tell you?
2. Who approved it? What is their role in the outcome?
3. Manager's incentive: develop you or document you out?
   - Signals of genuine development: specific coaching, protected time, new resources
   - Signals of documentation: vague requirements, moving goalposts, checkbox meetings
4. HR signals: supportive, procedural, or adversarial?
5. Advocate inventory: who in the organization would advocate for you? Who has political capital to do so?

Honest probability assessment:
On a scale of 1–10, how survivable is this PIP?

Saboteur lens on your probability estimate:
- Controller overestimates ability to manage the outcome ("I can fix this if I work hard enough")
- Victim underestimates ("It doesn't matter what I do")
- Hyper-Vigilant reads threat into every signal

What would a trusted advisor — someone with no emotional stake — estimate?

This is intelligence gathering, not resignation. Knowing the landscape changes how you navigate.`,
    howToRun:
      "Map PIP initiator, approver, manager incentive, HR signals, advocates. Honest survivability estimate. Saboteur lens.",
    themeTags: ["self_awareness", "control", "performance_anxiety"],
    difficulty: "advanced",
  },
  {
    name: "Building Your Workday Toolkit (PIP)",
    day: 7,
    week: 1,
    weekName: "LAND",
    duration: 3,
    isOnboarding: false,
    description:
      "Tactical regulation for the workplace: pre-meeting grounding (60 seconds), between-meetings reset, end-of-day release. Integrates saboteur log body signal as trigger for intervention. Three anchors, each under two minutes.",
    instructions: `Three regulation anchors for the workday. Each under two minutes. Portable and invisible.

Anchor 1 — Pre-Meeting Grounding (60 seconds)
Before any PIP-related meeting or check-in:
- Feet on the floor. Feel the contact.
- Three breaths: inhale 4, hold 4, exhale 6
- Name the saboteur most likely to show up in this meeting
- Set one intention: "In this meeting, I will ___"

Anchor 2 — Between-Meetings Reset (90 seconds)
After a hard interaction:
- Stand up. Move. Even if it is just walking to the bathroom.
- Name what just happened in one sentence
- Name the body signal (from your saboteur log): where is the activation?
- Release it: shake hands, roll shoulders, splash cold water on wrists

Anchor 3 — End-of-Day Release (2 minutes)
Before you leave work (physically or mentally):
- Write three sentences: what happened, what I felt, what I need tonight
- Transition ritual: change clothes, walk around the block, anything that marks the boundary
- The workday ends. The PIP does not follow you home.

The body signal from your saboteur log is your trigger for Anchor 2. When you feel it, that is the cue.`,
    howToRun:
      "Three regulation anchors: pre-meeting (60s), between-meetings (90s), end-of-day (2min). Body signal as trigger.",
    themeTags: ["resilience", "self_awareness", "performance_anxiety"],
    difficulty: "beginner",
  },

  // ── Week 2: STEADY ──
  {
    name: "Communication Under Pressure — Part 1: Observation",
    day: 10,
    week: 2,
    weekName: "STEADY",
    duration: 5,
    isOnboarding: false,
    description:
      "Introduction to NVC's four components (observation, feeling, need, request) applied to workplace communication under evaluation pressure. Client takes three recent PIP-related interactions and maps the gap between need and expression as the saboteur's operating space.",
    instructions: `How you communicate under pressure — and the gap the saboteur fills.

Introduction to NVC's four components (Marshall Rosenberg):
1. Observation — what actually happened (fact, not interpretation)
2. Feeling — what you felt (emotion, not thought)
3. Need — what you needed (not what you wanted the other person to do)
4. Request — what you actually said or asked for

Take three recent PIP-related interactions:

Interaction 1:
- Observation (what happened): ___
- Feeling (what you felt): ___
- Need (what you needed): ___
- What you actually said: ___

Interaction 2:
- Observation: ___
- Feeling: ___
- Need: ___
- What you actually said: ___

Interaction 3:
- Observation: ___
- Feeling: ___
- Need: ___
- What you actually said: ___

The gap between what you needed and what you said is where the saboteur operates.
- The Pleaser says what the other person wants to hear
- The Controller says what will win the argument
- The Avoider says nothing

Name the gap. That is your communication pattern under pressure.`,
    howToRun:
      "Three PIP interactions through NVC lens: observation, feeling, need, what was said. Map the saboteur's gap.",
    themeTags: ["self_awareness", "interpersonal_conflict", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Communication Under Pressure — Part 2: The Check-In Plan",
    day: 11,
    week: 2,
    weekName: "STEADY",
    duration: 5,
    isOnboarding: false,
    description:
      "Applies NVC to the next PIP check-in. Client plans one observation to share (fact, not defense), one need to express (directly, not wrapped in apology), one request (specific, actionable). Writes saboteur's version and centered version side by side. Practice out loud.",
    instructions: `Plan your next PIP check-in with intention.

Using NVC, prepare three things for your next meeting:

1. One observation to share (fact, not defense)
   Not: "I've been working really hard" (defense)
   But: "I completed X, Y, and Z since our last meeting" (observation)

2. One need to express (directly, not wrapped in apology)
   Not: "Sorry, but I'm a little confused about..." (apology-wrapped)
   But: "I need clarity on what success looks like for [specific metric]" (direct)

3. One request (specific, actionable)
   Not: "Can we talk more?" (vague)
   But: "Can we schedule a 15-minute check-in on [specific topic] by [date]?" (specific)

Now write two versions:

Saboteur's version — what your pattern would say:
___

Centered version — what your grounded self would say:
___

The difference between the two is your choice. Practice the centered version out loud. Say it until it sounds like you.

Tara Mohr's distinction: the inner critic performs safety. The inner mentor speaks from clarity. Write from the mentor.`,
    howToRun:
      "Plan next PIP check-in: one NVC observation, need, request. Saboteur vs. centered versions. Practice aloud.",
    themeTags: ["self_awareness", "interpersonal_conflict", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Stress Responses in Relationships",
    day: 12,
    week: 2,
    weekName: "STEADY",
    duration: 5,
    isOnboarding: false,
    description:
      "Introduction to Gottman's Four Horsemen (criticism, contempt, defensiveness, stonewalling) as stress-activated relational patterns. Client identifies which horseman is showing up in closest relationships under PIP stress. Relationship-agnostic. Introduces antidotes for each horseman.",
    instructions: `The PIP does not stay at work. Where is the stress landing in your relationships?

Gottman's Four Horsemen — stress-activated relational patterns:

1. Criticism — attacking character, not behavior
   "You never listen to me" instead of "I felt unheard when..."
   Antidote: gentle start-up — lead with "I" statements and specific observations

2. Contempt — superiority, eye-rolling, sarcasm, mockery
   The most destructive horseman. Often driven by accumulated unspoken resentment.
   Antidote: build culture of appreciation — express what you value in the other person

3. Defensiveness — counter-attacking, making excuses, denying responsibility
   "That's not what happened" instead of "I can see how that landed"
   Antidote: accept responsibility for your part, even a small part

4. Stonewalling — withdrawing, shutting down, going blank
   Physiological flooding — heart rate above 100 BPM, cannot process
   Antidote: self-soothing break — say "I need 20 minutes" and come back

Which horseman is showing up under PIP stress?
- With your partner?
- With friends?
- With family?
- With colleagues?

Works regardless of relationship status. Single clients: apply to friendships, family, colleagues.

One antidote to practice this week. Name it. Commit to it.`,
    howToRun:
      "Identify which Gottman horseman is active under PIP stress. Apply across relationships. Choose one antidote to practice.",
    themeTags: ["interpersonal_conflict", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "The Optionality Audit",
    day: 13,
    week: 2,
    weekName: "STEADY",
    duration: 5,
    isOnboarding: false,
    description:
      "Maps four domains of optionality: financial (runway, severance likelihood, one financial action), legal (employment rights, documentation, lawyer consultation), professional (resume, conversations, market value), relational (who is in your corner, where isolated). Rates each 1-10. Framed as a leverage exercise, not financial planning.",
    instructions: `Optionality changes how you sit in every meeting.

Map four domains. Rate each 1–10 (10 = fully resourced):

1. Financial Optionality (current rating: ___/10)
   - Monthly burn rate: ___
   - Savings runway (months): ___
   - Severance likelihood if terminated: ___
   - One financial action in your control right now: ___

2. Legal Optionality (current rating: ___/10)
   - Do you know your employment rights? (at-will, contract, union)
   - Are you documenting? (dates, conversations, emails)
   - Have you consulted or considered consulting an employment lawyer?
   - One legal action in your control right now: ___

3. Professional Optionality (current rating: ___/10)
   - Resume: current? Updated?
   - Conversations: have you talked to anyone in your network?
   - Market value: do you know what you are worth elsewhere?
   - One professional action in your control right now: ___

4. Relational Optionality (current rating: ___/10)
   - Who is in your corner? (at work, outside work)
   - Where are you isolated?
   - Who knows about the PIP?
   - One relational action in your control right now: ___

This is not about leaving. This is about leverage. The person with options navigates differently than the person without them. Optionality is not disloyalty — it is agency.`,
    howToRun:
      "Rate four optionality domains 1-10: financial, legal, professional, relational. One action per domain. Leverage, not exit planning.",
    themeTags: ["control", "resilience", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "The Fork",
    day: 14,
    week: 2,
    weekName: "STEADY",
    duration: 5,
    isOnboarding: false,
    description:
      "Names the decision the client is avoiding: fight to stay vs. prepare to leave. Client writes both paths — what each requires, costs, and gives. Applies saboteur lens to determine which saboteur argues for which path. Identifies information needed to choose.",
    instructions: `Name the decision you are avoiding.

The fork: fight to stay vs. prepare to leave.

Path A — Fight to Stay
- What does this require of you? (Specific actions, not abstract effort)
- What does it cost? (Energy, dignity, time, relationships)
- What does it give you? (Stability, income, identity continuity, proving something)
- Honest probability of success (from Day 6 Reading the Room): ___

Path B — Prepare to Leave
- What does this require of you? (Specific actions, not abstract courage)
- What does it cost? (Financial risk, identity disruption, uncertainty)
- What does it give you? (Agency, relief, new possibilities, self-respect)
- What are you afraid of on this path that is not about money?

Saboteur lens:
- Which saboteur is arguing for Path A? (Pleaser: "I should try harder." Hyper-Achiever: "I can fix this.")
- Which saboteur is arguing for Path B? (Victim: "They don't deserve me." Avoider: "I just want out.")
- What would your grounded self say?

You do not need to decide today. But you need to name the fork.

What information would help you choose? Go get that information this week.`,
    howToRun:
      "Name both paths: fight to stay vs. prepare to leave. Requirements, costs, and gains of each. Saboteur lens. Gather missing information.",
    themeTags: ["autonomy", "self_awareness", "control"],
    difficulty: "advanced",
  },

  // ── Week 3: BUILD ──
  {
    name: "Cognitive Distortion Audit",
    day: 17,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Applies five cognitive distortions (Burns) to the PIP's competence claims and the client's self-assessment: overgeneralization, mental filter, disqualifying the positive, magnification/minimization, labeling. For each distortion, client writes distorted and accurate versions.",
    instructions: `Test the PIP's competence claims — and your own self-assessment — for cognitive distortions.

Five distortions (David Burns) applied to PIP feedback:

1. Overgeneralization
   PIP says: "Performance is below expectations"
   Distorted version: "I'm bad at everything"
   Accurate version: "Specific areas X and Y need improvement. Areas A, B, and C are solid."
   Your version — distorted: ___
   Your version — accurate: ___

2. Mental Filter
   Filtering out evidence of competence. Focusing only on what went wrong.
   What are you filtering out? What evidence of competence are you ignoring?
   Distorted: ___
   Accurate: ___

3. Disqualifying the Positive
   "That went well but it was easy" or "They were just being nice"
   What positive feedback or results have you dismissed? Why?
   Distorted: ___
   Accurate: ___

4. Magnification / Minimization
   Blowing up failures, shrinking successes. The PIP magnifies certain things. So does your saboteur.
   What is being magnified? What is being minimized?
   Distorted: ___
   Accurate: ___

5. Labeling
   "I am incompetent" vs. "I am a professional who received critical feedback on specific areas"
   Your label: ___
   The accurate description: ___

Research finding (Carol Dweck): evaluation threat systematically collapses self-assessment accuracy. Under PIP pressure, you are not a reliable narrator of your own competence. The distortion audit corrects for this.`,
    howToRun:
      "Apply five Burns distortions to PIP claims and self-assessment. Write distorted and accurate versions for each. Correct for evaluation threat.",
    themeTags: ["inner_critic", "identity_self_worth", "self_awareness"],
    difficulty: "advanced",
  },
  {
    name: "The Saboteur's Professional Cost",
    day: 18,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Aggregates saboteur log data from Weeks 1-2. For the top saboteur: activation frequency, professional cost (what it made client do/avoid at work), relational cost (how it showed up at home), and the saboteur's payoff (what it protects from that feels scarier than the cost).",
    instructions: `The cost accounting your saboteur does not want you to see.

Review your saboteur log from Weeks 1–2. Aggregate the data.

For your top saboteur:

1. Activation Frequency
   How many times did it activate in the last two weeks?
   Most common triggers: ___
   Most common time of day: ___

2. Professional Cost
   What did it make you do at work? (Over-explain, go silent, overwork, avoid a conversation, send a defensive email)
   What did it make you avoid? (Speaking up, asking for help, setting a boundary, pushing back)
   Specific examples: ___

3. Relational Cost
   How did it show up at home? (Short-tempered, withdrawn, distracted, needy, performing "fine")
   What relationships absorbed the cost? ___

4. The Payoff
   What does the saboteur protect you from that feels scarier than all of these costs?
   - The Pleaser protects from rejection
   - The Controller protects from helplessness
   - The Hyper-Achiever protects from worthlessness
   - The Victim protects from taking responsibility
   - The Avoider protects from pain
   - The Hyper-Vigilant protects from surprise

   Your saboteur's payoff: ___

The saboteur is not irrational. Its cost-benefit analysis is just outdated. The cost is current. The protection is from a threat that may no longer exist.`,
    howToRun:
      "Aggregate saboteur log: frequency, professional cost, relational cost, payoff. Make the cost concrete.",
    themeTags: ["inner_critic", "self_awareness", "resilience"],
    difficulty: "advanced",
  },
  {
    name: "Boundary Architecture",
    day: 19,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Three categories of PIP requirements: will do (legitimate, actionable), will do with boundary (vague or unrealistic, requires negotiation), will not do (crosses ethical, personal, or professional lines). For 'will do with boundary' items, client writes NVC-framed negotiation.",
    instructions: `What you will and will not do. The architecture of your limits.

Sort every PIP requirement into three categories:

Category 1 — Will Do
Legitimate, actionable requirements. You agree these are real development areas.
List them: ___

Category 2 — Will Do With Boundary
Vague or unrealistic requirements that need negotiation. You are willing to engage but the terms need adjustment.
For each item:
- What is the requirement? ___
- What is vague or unrealistic about it? ___
- NVC-framed negotiation:
  "I observe [specific requirement]. I need [clarity/resources/timeline]. I request [specific adjustment]."
  Write it: ___

Category 3 — Will Not Do
Crosses ethical, personal, or professional lines. Non-negotiable.
- What is being asked? ___
- Why is it a line? (Values, ethics, integrity, personal limit) ___

Saboteur check:
- The Pleaser puts too much in Category 1 ("I can do all of this")
- The Controller puts too much in Category 3 ("I refuse")
- The Victim claims everything is Category 3 ("None of this is fair")

Practice: say one Category 2 boundary negotiation out loud. Does it sound like you? Adjust until it does.`,
    howToRun:
      "Sort PIP requirements: will do, will do with boundary, will not do. Write NVC negotiations for Category 2. Practice aloud.",
    themeTags: ["autonomy", "self_awareness", "interpersonal_conflict"],
    difficulty: "advanced",
  },
  {
    name: "Perspective on Performance Culture",
    day: 20,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Structural perspective on how PIPs function in tech organizations — as both development tools and termination mechanisms. Locates the PIP in organizational context: restructuring, reorgs, management changes. Separates structural shame from personal shame.",
    instructions: `Your PIP inside a system. Not just personal — structural.

How PIPs function in tech organizations:
- Development tool: genuine coaching, specific goals, resources provided, extension possible
- Termination mechanism: documentation trail, vague requirements, clock running, legal protection for the company
- Both simultaneously: the system does not always have a single intent

Locate your PIP in organizational context:
1. Was there a reorg, restructuring, or management change before the PIP?
2. Are others on PIPs? Is this a pattern or isolated?
3. What is the company's track record — do people survive PIPs here?
4. What role does HR play — developmental or procedural?

Separate structural shame from personal shame:
- Structural: "The system uses PIPs as a management tool. I am in a system."
- Personal: "There is something wrong with me."
- Accurate: some combination of both, but the ratio matters.

Amy Edmondson's research: psychological safety collapses under performance threat. When safety collapses, performance declines — creating a self-fulfilling cycle. The PIP itself can cause the performance problems it claims to measure.

What changes when you see the structural forces alongside the personal ones? Neither all-your-fault nor none-of-it.`,
    howToRun:
      "Locate PIP in organizational context. Separate structural from personal shame. Understand the self-fulfilling cycle.",
    themeTags: ["identity_self_worth", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Dual-Track Status Check",
    day: 21,
    week: 3,
    weekName: "BUILD",
    duration: 5,
    isOnboarding: false,
    description:
      "Status check on Track A (meeting PIP requirements) and Track B (optionality). Rates each 1-10. Applies boundary framework: where has client negotiated vs. accepted original terms? Identifies where energy goes this week.",
    instructions: `Two tracks. Both need attention. Where does energy go this week?

Track A — Meeting PIP Requirements (current rating: ___/10)
- Deliverables: on track, behind, or ahead? ___
- Metrics: which are you meeting? Which are not? ___
- Behavioral changes: where have you shifted? Where are you stuck? ___
- Boundary framework update: in the "will do with boundary" category, where have you negotiated? Where have you accepted original terms without pushback? ___

Track B — Optionality (current rating: ___/10)
- Financial: any changes since Day 13? ___
- Legal: any new information? ___
- Professional: resume updated? Conversations started? ___
- Relational: who have you leaned on? Where are you still isolated? ___

Energy allocation this week:
- Track A gets ___% of energy
- Track B gets ___% of energy
- Is this allocation strategic or fear-driven?

The dual-track is not disloyalty. It is agency. The person who can walk away negotiates differently than the person who cannot.`,
    howToRun:
      "Rate both tracks 1-10. Review boundary negotiations. Allocate energy strategically. Dual-track is agency, not disloyalty.",
    themeTags: ["control", "resilience", "self_awareness"],
    difficulty: "intermediate",
  },

  // ── Week 4: ORIENT ──
  {
    name: "The Older Pattern",
    day: 25,
    week: 4,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: false,
    description:
      "Connects the PIP experience to older patterns. The saboteur is not new. The stress-response direction is not new. Traces the pattern backward to its origin. Differentiates the current situation from the historical wound.",
    instructions: `The PIP activated something older. Name it.

Your saboteur pattern did not start with this PIP. It started earlier.

1. Trace backward:
   - When did you first feel this way? (Not this PIP — the first time)
   - What was the original context? (Family, school, early career)
   - Who was the authority figure? What did they require?
   - What did you learn to do to survive that situation?

2. The pattern:
   - The survival strategy you developed then: ___
   - How it shows up now under PIP pressure: ___
   - What is the same? What is different?

3. Differentiation:
   - That was then. This is now. Name three differences.
   - You are not the same person. Name three capabilities you have now that you did not have then.
   - The saboteur is using old software to process a new situation. The threat assessment is outdated.

4. The question:
   If the saboteur's protection is from an old threat — what would you do about the current situation without that protection?

This is not about resolving the old pattern in one exercise. It is about seeing that the PIP response is layered: current reality + historical activation. Separating the two changes how you respond.`,
    howToRun:
      "Trace saboteur pattern to origin. Map old survival strategy to current PIP behavior. Differentiate then from now.",
    themeTags: ["inner_critic", "self_awareness", "identity_self_worth"],
    difficulty: "advanced",
  },
  {
    name: "The Centered Conversation",
    day: 26,
    week: 4,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: false,
    description:
      "Integration exercise combining NVC, saboteur awareness, boundary work, and Gottman repair attempts. Client picks most important conversation ahead and writes three versions: saboteur's (pattern unchecked), centered (NVC-framed, boundaries clear), repair (when it goes sideways).",
    instructions: `The most important conversation ahead. Three versions.

Pick the conversation that matters most in the next week — PIP review, manager check-in, HR meeting, difficult colleague interaction, or a personal conversation carrying PIP stress.

Version 1 — The Saboteur's Version (pattern unchecked)
Write the conversation as your saboteur would run it:
- What would the Pleaser say? ___
- What would the Controller say? ___
- What would the Avoider do? ___
Write the version where your pattern runs the conversation.

Version 2 — The Centered Version (full toolkit)
Rewrite using everything you have built:
- NVC frame: observation, feeling, need, request
- Boundaries: what is your Category 2 negotiation? Category 3 line?
- Saboteur named: "I notice my [saboteur] wants to ___. Instead, I will ___."
Write the version where your grounded self runs the conversation.

Version 3 — The Repair Version (when it goes sideways)
Because conversations go sideways. Plan for it:
- Gottman repair attempt: "I need to pause" or "Can we back up?"
- Self-soothing if flooding: "I need 10 minutes. I will come back."
- Re-entry: how do you return to the centered version after a derail?

Practice Versions 2 and 3 out loud. Not in your head. Out loud. They need to live in your mouth, not just on paper.`,
    howToRun:
      "Three versions of critical conversation: saboteur's, centered (NVC + boundaries), repair. Practice Versions 2 and 3 aloud.",
    themeTags: ["interpersonal_conflict", "self_awareness", "resilience"],
    difficulty: "advanced",
  },
  {
    name: "Pattern Testing — The Full System",
    day: 27,
    week: 4,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: false,
    description:
      "Simulates the highest-stakes conversation ahead. Integrates all tools: saboteur awareness, NVC, boundary architecture, stress-response direction, regulation toolkit, cognitive distortion corrections. Write the scene with saboteur running it, then rewrite with full toolkit.",
    instructions: `Simulate the highest-stakes conversation ahead. Full integration.

Pick the scenario: PIP review, HR meeting, exit negotiation, job interview, or the conversation you are most afraid of.

Step 1 — Write the scene with the saboteur running it
- What does the saboteur say? ___
- What does the saboteur do? (body language, tone, pace) ___
- What does the saboteur avoid? ___
- How does the other person respond to the saboteur's version? ___

Step 2 — Rewrite with the full toolkit
- Saboteur awareness: "I notice [saboteur]. I name it. I choose differently."
- NVC: observation, feeling, need, request — write each
- Boundary architecture: what are you willing to negotiate? What is your line?
- Stress-response direction: which direction are you tempted to move (toward, against, away)? What would centered look like?
- Regulation toolkit: which anchor do you use before, during, and after?
- Cognitive distortion check: is any claim in the conversation distorted? Write the accurate version.

Step 3 — Notice
- Which tools feel natural? Those are integrated.
- Which tools still feel forced? Those need more practice.
- What is the gap between Version 1 and Version 2? That gap is your growth.

This is not about perfection. It is about having a system when the pressure is real.`,
    howToRun:
      "Simulate highest-stakes scenario. Write saboteur version, then full-toolkit version. Notice which tools feel natural vs. forced.",
    themeTags: ["inner_critic", "self_awareness", "resilience"],
    difficulty: "advanced",
  },

  // ── Adaptive Exercises ──
  {
    name: "Pre-Meeting Grounding Sequence",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 5,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Anticipatory anxiety about specific meetings",
    description:
      "60-second regulation protocol for before PIP check-ins and high-stakes manager interactions. Combines breath regulation, body grounding, and saboteur naming in a portable sequence.",
    instructions: `Pre-Meeting Grounding — 60 Seconds

A portable regulation sequence for before PIP check-ins and high-stakes meetings.

The Sequence (60 seconds total):

1. Ground (15 seconds)
   - Feet flat on the floor. Feel the contact.
   - Hands on thighs. Press down gently.
   - You are here. In this room. In this body.

2. Breathe (20 seconds)
   - Inhale 4 counts through the nose
   - Hold 4 counts
   - Exhale 6 counts through the mouth (longer exhale activates parasympathetic nervous system)
   - Repeat once

3. Name (15 seconds)
   - Which saboteur is most likely to show up in this meeting?
   - Name it silently: "There's the [Pleaser/Controller/etc.]"
   - Naming creates distance. Distance creates choice.

4. Intend (10 seconds)
   - One intention for this meeting: "In this meeting, I will ___"
   - Not a goal. A way of being.

Practice this sequence daily for a week. Then it becomes automatic — available in the moment you need it most.`,
    howToRun:
      "60-second sequence: ground (feet), breathe (4-4-6), name the saboteur, set one intention. Practice daily.",
    themeTags: ["resilience", "self_awareness", "performance_anxiety"],
    difficulty: "beginner",
  },
  {
    name: "Signal vs. Noise",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Over-interpreting every interaction, reading meaning into scheduling changes",
    description:
      "Distinguish meaningful signals from noise in manager behavior, peer interactions, and organizational changes. Client lists recent events, categorizes each as signal (actionable data) or noise (ambiguous, likely projection). Saboteur overlay on categorization tendency.",
    instructions: `Signal vs. Noise — Stop Over-Interpreting

Under PIP pressure, everything feels like a signal. Most of it is noise.

List 5–7 recent events that triggered anxiety:
(Examples: manager cancelled a 1:1, colleague was short in Slack, you were left off a meeting invite, HR sent a routine email)

For each event, categorize:

Signal (actionable data):
- Manager directly stated something about your performance
- Written feedback with specific content
- Formal meeting scheduled with HR present
- Documented change to PIP terms

Noise (ambiguous, likely projection):
- Tone of voice in a meeting
- Scheduling changes without explanation
- Colleague behavior that could mean anything
- Your interpretation of someone's facial expression

Saboteur overlay:
The Hyper-Vigilant fills the Signal column with noise. Everything is a threat. Everything means something.

Ask: "Would a colleague without a PIP interpret this the same way?"

If the answer is no, it is probably noise. Respond to signals. Let noise pass.`,
    howToRun:
      "List 5-7 anxiety-triggering events. Categorize as signal or noise. Saboteur overlay. Respond to signals only.",
    themeTags: ["self_awareness", "performance_anxiety", "inner_critic"],
    difficulty: "intermediate",
  },
  {
    name: "Ally Mapping",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Isolation at work, unsure who to trust",
    description:
      "Who is safe? Who is useful? Where do those categories not overlap? Map allies, neutrals, and adversaries. Identify one person to lean on this week and one person to be careful around.",
    instructions: `Ally Mapping — Who Is Safe?

Under PIP pressure, you need to know who is in your corner — and who is not.

Map three categories:

Allies — people who are genuinely supportive
- Who advocates for you? ___
- Who gives honest feedback without agenda? ___
- Who would you call if things fell apart? ___

Neutrals — people who are neither for nor against you
- Who is professional but uninvested? ___
- Who could become an ally with investment? ___

Adversaries — people who are not safe
- Who benefits from your departure? ___
- Who has been involved in the PIP process? ___
- Who do you need to be careful around? ___

Important distinction: safe and useful are not the same.
- Someone can be useful (has information, access) without being safe (trustworthy)
- Someone can be safe (trustworthy) without being useful (no organizational power)

One person to lean on this week: ___
One person to be careful around: ___

Isolation is the saboteur's greatest tool. Map your allies to resist it.`,
    howToRun:
      "Map allies, neutrals, adversaries. Distinguish safe from useful. One to lean on, one to be careful around.",
    themeTags: ["belonging", "self_awareness", "resilience"],
    difficulty: "beginner",
  },
  {
    name: "Managing Up Micro-Plan",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Next check-in approaching",
    description:
      "Plan one specific interaction with intention using NVC framework: observation to share, need to express, request to make. Anticipate saboteur interference. 10-minute prep before a meeting.",
    instructions: `Managing Up — 10-Minute Meeting Prep

Your next check-in is approaching. Prepare with intention.

1. What do you want your manager to know after this meeting?
   One specific thing — not a list, not a defense. One observation: ___

2. What do you need from this meeting?
   Clarity on a metric? Resources? Timeline adjustment? Feedback?
   One specific need: ___

3. What is your request?
   Specific and actionable. Not "more support" but "a 15-minute weekly sync on [topic]."
   One specific request: ___

4. Saboteur interference check:
   - The Pleaser will agree to everything and leave with nothing
   - The Controller will try to run the meeting
   - The Avoider will keep it surface-level
   - The Hyper-Vigilant will interpret every response as a threat

   Which saboteur is most likely to show up? ___
   What will you do when you notice it? ___

5. Pre-meeting grounding: use the 60-second sequence (breath, ground, name, intend).

Go in with a plan. Not a script — a plan.`,
    howToRun:
      "One observation, one need, one request for next check-in. Anticipate saboteur. Ground before entering.",
    themeTags: ["self_awareness", "interpersonal_conflict", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Communication Style Under Stress Audit",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Recognizing shifts in own communication during PIP interactions",
    description:
      "Map how communication changes under evaluation pressure. Over-explaining? Going silent? Agreeable? Defensive? Compare safe-state communication to threat-state communication. Identify which shift is most costly and one correction to practice.",
    instructions: `Communication Under Stress — How Do You Change?

Under evaluation pressure, your communication shifts. Map the shift.

Safe-state communication (when you feel secure):
- How do you express disagreement? ___
- How do you ask for what you need? ___
- How do you respond to feedback? ___
- How do you handle conflict? ___

Threat-state communication (under PIP pressure):
- How do you express disagreement? ___
- How do you ask for what you need? ___
- How do you respond to feedback? ___
- How do you handle conflict? ___

Common shifts:
- Over-explaining (trying to prove competence through volume)
- Going silent (withdrawing to avoid making things worse)
- Over-agreeing (performing compliance to feel safe)
- Defending (arguing every point to protect identity)
- Apologizing excessively (pre-emptive damage control)

Which shift is most costly at work right now? ___
What does it cost you? (How does it land with your manager, HR, colleagues?)

One correction to practice this week:
Instead of [threat-state pattern], I will [specific alternative].`,
    howToRun:
      "Map safe-state vs. threat-state communication. Identify most costly shift. One specific correction.",
    themeTags: ["self_awareness", "interpersonal_conflict", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Four Horsemen Check-In",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Relational tension, irritability at home, withdrawal from people",
    description:
      "Which Gottman horseman showed up this week? Criticism, contempt, defensiveness, or stonewalling? Name it, name the context, name the antidote. Relationship-agnostic.",
    instructions: `Four Horsemen Check-In — This Week

Which horseman showed up in your relationships this week?

1. Criticism (attacking character, not behavior)
   - Did it show up? Where? With whom?
   - Antidote: gentle start-up. Rewrite the criticism as an "I" statement with a specific request.

2. Contempt (superiority, sarcasm, eye-rolling)
   - Did it show up? Where? With whom?
   - Antidote: culture of appreciation. Name one thing you genuinely value about that person.

3. Defensiveness (counter-attacking, making excuses)
   - Did it show up? Where? With whom?
   - Antidote: accept responsibility for your part. Even 2% of it.

4. Stonewalling (withdrawing, shutting down, going blank)
   - Did it show up? Where? With whom?
   - Antidote: self-soothing. Take a break, then return.

The horseman is not the problem. It is the alarm. It tells you the stress is leaking into your relationships.

One antidote to practice before the next check-in: ___`,
    howToRun:
      "Which horseman showed up? Where, with whom? Name the antidote. One to practice this week.",
    themeTags: ["interpersonal_conflict", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Repair Attempt Practice",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Guilt about how stress is affecting others",
    description:
      "Identify one relational rupture from this week (any relationship). Write the repair attempt: acknowledge the rupture, take responsibility, express what you need. Practice saying it.",
    instructions: `Repair Attempt — One Rupture, One Repair

Identify one relational rupture from this week. Any relationship — partner, friend, family, colleague.

1. The rupture:
   What happened? ___
   What did you do or say? ___
   How did it land on the other person? ___

2. The repair attempt:
   Three parts (Gottman):
   - Acknowledge: "I know I [what you did]. I can see it affected you."
   - Responsibility: "My part in this was ___." (Not "I'm sorry you felt that way" — actual ownership.)
   - Need: "What I need you to know is ___." Or: "What I need from you is ___."

3. Write the repair:
   ___

4. Practice saying it out loud. Does it sound genuine? Adjust until it does.

Repair attempts are not apologies. They are bids for reconnection after a rupture. Gottman's research: the success of a relationship depends not on avoiding rupture but on the quality and frequency of repair.

You are under extraordinary pressure. Ruptures will happen. Repairs are what matter.`,
    howToRun:
      "One rupture: what happened, your part, how it landed. Write three-part repair. Practice aloud.",
    themeTags: ["interpersonal_conflict", "self_awareness", "belonging"],
    difficulty: "intermediate",
  },
  {
    name: "Bid for Connection Audit",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Isolation, feeling disconnected even from people who are present",
    description:
      "Audit Gottman's bids for connection. Under stress, people turn away from bids without noticing. Who bid this week? Did you turn toward, away, or against?",
    instructions: `Bids for Connection — Are You Turning Away?

Under stress, you turn away from bids for connection without noticing. This exercise makes it visible.

A "bid" (Gottman) is any attempt by another person to connect — a question, a touch, a look, sharing something, asking for your attention.

This week, who bid for your connection?

Person 1: ___
- Their bid: ___
- Your response: turned toward (engaged) / turned away (ignored) / turned against (rejected)

Person 2: ___
- Their bid: ___
- Your response: turned toward / turned away / turned against

Person 3: ___
- Their bid: ___
- Your response: turned toward / turned away / turned against

Pattern check:
- Are you turning away more than usual? ___
- Is there a specific person whose bids you are ignoring? ___
- What is the cost of turning away? ___

Under PIP stress, your nervous system conserves energy by withdrawing from connection. This is biologically predictable — and relationally costly.

One bid to turn toward today: ___`,
    howToRun:
      "Audit bids for connection: who bid, did you turn toward/away/against? Name the cost of turning away. One bid to turn toward.",
    themeTags: ["belonging", "self_awareness", "resilience"],
    difficulty: "beginner",
  },
  {
    name: "NVC Self-Expression Practice",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Unspoken needs, performing 'fine' when not fine",
    description:
      "Take one thing you need from someone that you have not said. Write it in NVC format: observation, feeling, need, request.",
    instructions: `NVC Self-Expression — Say the Unsaid

One thing you need from someone — partner, friend, family member, colleague — that you have not said.

Write it in NVC format:

1. Observation (fact, not interpretation):
   "When [specific thing that happened]..."

2. Feeling (emotion, not thought):
   "I feel [emotion — not 'I feel like you...' which is a thought]..."

3. Need (yours, not what you want them to do):
   "Because I need [connection, clarity, support, honesty, space]..."

4. Request (specific, actionable, refusable):
   "Would you be willing to [specific action]?"

Write it:
___

Now check:
- Is the observation actually an observation, or is there interpretation embedded?
- Is the feeling actually a feeling, or is it a judgment disguised as a feeling?
- Is the need yours, or are you assigning responsibility to the other person?
- Is the request specific and genuinely refusable?

You may or may not say this to the person. But writing it clarifies what you actually need — which is often different from what you have been performing.`,
    howToRun:
      "One unsaid need. Write in NVC format: observation, feeling, need, request. Check each component for accuracy.",
    themeTags: ["self_awareness", "interpersonal_conflict", "belonging"],
    difficulty: "intermediate",
  },
  {
    name: "Attachment Style Under Stress",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Relationship patterns that feel bigger than the current situation",
    description:
      "Brief introduction to how attachment patterns (anxious, avoidant, disorganized) intensify under sustained threat. Which direction is the client pulled — toward or away? Normalizes both directions as predictable stress responses.",
    instructions: `Attachment Under Stress — Which Direction Are You Pulled?

Under sustained threat, attachment patterns intensify. This is predictable, not pathological.

Three patterns (simplified):

Anxious attachment under stress:
- Seeking more reassurance, calling more, needing more validation
- "Are we okay?" on repeat
- Difficulty tolerating uncertainty in relationships
- Need for closeness intensifies

Avoidant attachment under stress:
- Withdrawing, not wanting to be touched, going silent
- "I need space" (but the space never ends)
- Difficulty receiving support even when offered
- Need for independence intensifies

Disorganized attachment under stress:
- Alternating between reaching out and pushing away
- Wanting connection and fearing it simultaneously
- Confusing behavior that confuses others (and you)

Which direction are you pulled right now?
- Toward (seeking more connection, reassurance, closeness): ___
- Away (withdrawing, needing space, going silent): ___
- Both (alternating, unpredictable): ___

This is your nervous system responding to threat. Both directions are predictable stress responses.

What would help right now? Not what your pattern says — what would actually help?

If anxious: one self-soothing practice that does not require another person.
If avoidant: one small bid for connection that feels manageable.
If both: name which mode you are in right now and give yourself permission to be there.`,
    howToRun:
      "Identify attachment direction under stress: toward, away, or both. Normalize as predictable. One practical step.",
    themeTags: ["interpersonal_conflict", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Inner Mentor vs. Inner Critic",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Critic is dominant but client has enough distance to notice it",
    description:
      "Write the inner critic's version of the situation. Then write the inner mentor's version — the wisest, most grounded version of you. Not optimistic, not soft. Clear. Compare. Which version would you take into tomorrow?",
    instructions: `Inner Mentor vs. Inner Critic — Two Versions

You can hear the critic. Good. That means there is enough distance to do this exercise.

Version 1 — The Inner Critic's Version
Write it in the critic's voice. Let it say everything:
"You are ___. You should have ___. You'll never ___. This proves ___."
Write it all: ___

Version 2 — The Inner Mentor's Version
The inner mentor is the wisest, most grounded version of you (Tara Mohr). Not optimistic. Not soft. Not the critic's opposite. Clear.
"Here is what I see: ___. Here is what matters: ___. Here is what I would do: ___."
Write it: ___

Compare:
- Which version is more accurate?
- Which version would you take into tomorrow?
- Which version would you want a colleague to operate from?

The critic speaks from fear. The mentor speaks from clarity. Both are yours. You choose which one drives.

Note: the mentor's version should not sound like a pep talk. If it does, the Pleaser wrote it. Rewrite.`,
    howToRun:
      "Write critic's version. Write mentor's version (clear, not soft). Compare. Choose which to carry forward.",
    themeTags: ["inner_critic", "self_awareness", "identity_self_worth"],
    difficulty: "intermediate",
  },
  {
    name: "Saboteur Contingency Plan (If X Then Y)",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Specific upcoming situation where saboteur is likely to activate",
    description:
      "For a known trigger (specific meeting, interaction, email), write the saboteur's likely response and the alternative response. If [trigger], then [saboteur says X], but I will [do Y instead]. Practical pattern management.",
    instructions: `Saboteur Contingency Plan — If X, Then Y

A specific situation is coming — a meeting, interaction, email, or conversation — where you know your saboteur will activate.

Name the situation: ___

If [trigger happens]:
Then [saboteur] will say: ___
And I will want to: ___

But instead, I will:
1. Notice the activation (body signal from saboteur log): ___
2. Name it: "There's the [saboteur name]"
3. Do this instead: ___

Write it as a simple If-Then:
"If [specific trigger], then I will [specific alternative behavior]."

Example:
"If my manager asks about the missed deadline, my Pleaser will want to over-apologize and take all blame. Instead, I will use NVC: 'The deadline was missed. I need clarity on priority ranking for the remaining items. Can we review together?'"

Your If-Then:
___

This is not insight work. This is practical pattern management. Write it. Rehearse it. Use it.`,
    howToRun:
      "Specific upcoming trigger. Write saboteur's response. Write If-Then alternative. Rehearse.",
    themeTags: ["inner_critic", "resilience", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Stress-Response Direction Check",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Feeling stuck in one mode",
    description:
      "Which direction are you moving today — toward (complying, seeking approval), against (controlling, pushing back), or away (withdrawing, numbing)? Is it serving you? Quick recalibration tool.",
    instructions: `Stress-Response Direction — Quick Check

Which direction are you moving today?

Toward (complying, seeking approval):
- Agreeing with everything
- Managing impressions
- Performing "good employee"
- Seeking reassurance
Are you here? ___

Against (controlling, pushing back):
- Fighting the process
- Arguing every point
- Trying to control the outcome
- Dominating conversations
Are you here? ___

Away (withdrawing, numbing):
- Mentally checked out
- Avoiding emails and meetings
- Procrastinating on PIP requirements
- Numbing (scrolling, drinking, overworking on non-PIP tasks)
Are you here? ___

Is this direction serving you right now? ___

What would the other directions look like?
If you are moving toward: what would healthy pushing back look like?
If you are moving against: what would strategic compliance look like?
If you are moving away: what would re-engaging on your terms look like?

Quick recalibration. Not a fix. A moment of awareness about which mode you are in.`,
    howToRun:
      "Identify current stress direction: toward, against, away. Is it serving you? What would another direction look like?",
    themeTags: ["self_awareness", "resilience", "inner_critic"],
    difficulty: "beginner",
  },
  {
    name: "Cognitive Distortion Spot-Check",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Spiraling self-assessment, all-or-nothing thinking about competence",
    description:
      "Apply Burns' distortion categories to one specific thought about the PIP or any professional situation. Write the distorted version and the accurate version. Quick-use version of the Day 17 audit.",
    instructions: `Cognitive Distortion Spot-Check — One Thought

You are spiraling. Catch it with one thought.

Write the thought: ___

Apply Burns' distortion test:

- Overgeneralization? ("I failed at X therefore I fail at everything")
  Is this one data point being treated as a universal truth?

- Mental filter? (Focusing only on what went wrong, ignoring what went right)
  What are you filtering out?

- Disqualifying the positive? ("That went well but it doesn't count")
  What evidence of competence are you dismissing?

- Magnification / Minimization?
  What is being blown up? What is being shrunk?

- Labeling? ("I am incompetent" vs. "I received feedback on specific areas")
  Is this a label or a description?

Which distortion is at work? ___

Rewrite — the accurate version (not the positive version — the accurate one):
___

Under evaluation pressure, self-assessment accuracy collapses. This is not weakness. This is cognitive science. The spot-check corrects for it.`,
    howToRun:
      "One spiraling thought. Apply Burns' distortion categories. Rewrite the accurate version. Quick correction.",
    themeTags: ["inner_critic", "identity_self_worth", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Dual-Track Progress Check (Adaptive)",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Feeling pulled between compliance and contingency",
    description:
      "Quick status on both tracks (meet PIP / prepare for departure). Where does energy go this week? Lighter version of Day 21 plan exercise, available as adaptive pull when feeling torn.",
    instructions: `Dual-Track Quick Check — Where Does Energy Go?

You are feeling pulled between two tracks. Name where you are on each.

Track A — Meeting PIP Requirements
- What did you deliver this week? ___
- What is behind? ___
- What needs attention next? ___
- Quick rating (1–10): ___

Track B — Optionality / Preparation
- What action did you take this week? (Resume, conversation, research, financial) ___
- What is still untouched? ___
- What needs attention next? ___
- Quick rating (1–10): ___

Energy allocation:
- This week, Track A got ___% of your energy
- This week, Track B got ___% of your energy
- Next week, the right allocation is: ___% / ___%

Is the allocation strategic or fear-driven?
- Fear-driven toward A: "If I just work harder they'll keep me"
- Fear-driven toward B: "It's hopeless, I should just leave"
- Strategic: based on honest assessment of probability and what you can control

One action per track for next week:
- Track A: ___
- Track B: ___`,
    howToRun:
      "Quick status on both tracks: PIP compliance and optionality. Rate each 1-10. Allocate energy strategically.",
    themeTags: ["control", "self_awareness", "resilience"],
    difficulty: "beginner",
  },
  {
    name: "Optionality Refresh",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "New information, situation has shifted",
    description:
      "Update ratings across all four optionality domains (financial, legal, professional, relational). What changed? Where does energy go?",
    instructions: `Optionality Refresh — What Changed?

Something shifted. Update your optionality ratings.

1. Financial Optionality (was: ___/10, now: ___/10)
   What changed? ___
   One action: ___

2. Legal Optionality (was: ___/10, now: ___/10)
   What changed? ___
   One action: ___

3. Professional Optionality (was: ___/10, now: ___/10)
   What changed? ___
   One action: ___

4. Relational Optionality (was: ___/10, now: ___/10)
   What changed? ___
   One action: ___

Overall shift:
- Are you more resourced or less resourced than last time? ___
- Which domain needs the most attention? ___
- Where does energy go this week? ___

Optionality is not about planning to leave. It is about knowing you could. That knowledge changes how you sit in every meeting, how you respond to every demand, and how you make every decision.`,
    howToRun:
      "Update four optionality domains: financial, legal, professional, relational. Compare to previous ratings. One action per domain.",
    themeTags: ["control", "resilience", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Severance and Rights Research",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Exit is becoming more likely, needs concrete information",
    description:
      "Guided prompt to document what client knows and does not know about employment rights, severance norms at their company, and whether legal consultation would be useful. Not legal advice. Structured information gathering.",
    instructions: `Severance and Rights — What Do You Know?

This is not legal advice. This is structured information gathering so you know what you know and what you do not.

What you know:

1. Employment status:
   - At-will, contract, or other? ___
   - Any written agreements that affect termination? ___

2. Company severance norms:
   - Does your company typically offer severance? ___
   - What have you heard from others who left? ___
   - Is severance standard or negotiated? ___

3. PIP documentation:
   - Do you have copies of all PIP-related documents? ___
   - Are you documenting conversations (dates, participants, content)? ___
   - Do you have email records of feedback and responses? ___

4. Employment rights:
   - Do you know your state's employment protections? ___
   - Is there anything about your situation that might involve discrimination, retaliation, or hostile work environment? ___

What you do not know:
List every question you have about rights, severance, and legal options: ___

Would legal consultation be useful?
If any of the following apply, the answer is probably yes:
- You suspect retaliation or discrimination
- You have a written agreement that affects termination
- The severance offer (if any) includes a release of claims
- You are unsure about non-compete or NDA implications

One action: ___

This is information gathering. Not deciding. Not panicking. Knowing.`,
    howToRun:
      "Document what you know about employment status, severance, documentation, rights. List unknowns. Assess if legal consultation is useful.",
    themeTags: ["control", "self_awareness", "resilience"],
    difficulty: "intermediate",
  },
];

async function main() {
  console.log("Seeding JETSTREAM (performance_plan) program-specific exercises...\n");

  let inserted = 0;
  let failed = 0;

  for (const ex of exercises) {
    const { error } = await supabase.from("frameworks_library").insert({
      coach_id: COACH_ID,
      name: ex.name,
      description: ex.description,
      instructions: ex.instructions,
      category: ex.isAdaptive
        ? `Adaptive: ${ex.themeTags[0]}`
        : `Week ${ex.week}: ${ex.weekName}`,
      difficulty_level: ex.difficulty,
      theme_tags: ex.themeTags,
      active: true,
      // V2 columns
      exercise_scope: "program_specific",
      program_slug: "performance_plan",
      source_file: "jetstream-exercises",
      modality: "integrative",
      originator: "All Minds on Deck",
      source_work: "JETSTREAM Program",
      duration_minutes: ex.duration,
      when_to_use: ex.isAdaptive
        ? `Adaptive exercise — trigger: ${ex.trigger}`
        : `Day ${ex.day} coaching plan exercise`,
      neuroscience_rationale: null,
      coaching_questions: [],
      file_line_ref: ex.isAdaptive
        ? `jetstream:adaptive:${ex.name.toLowerCase().replace(/\s+/g, "_")}`
        : `jetstream:day${ex.day}`,
      how_to_run: ex.howToRun,
      solo_adaptation: null,
    });

    if (error) {
      console.warn(`  ⚠ Failed: "${ex.name}" — ${error.message}`);
      failed++;
    } else {
      const label = ex.isAdaptive ? "Adaptive" : `Day ${ex.day}`;
      console.log(`  ✓ ${label}: ${ex.name}`);
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
