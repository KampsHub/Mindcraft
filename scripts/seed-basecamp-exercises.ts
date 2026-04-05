/**
 * Seed BASECAMP (new_role) program-specific exercises into frameworks_library.
 * These are the required coaching plan exercises and adaptive exercises
 * unique to the new role program arc.
 *
 * Run: npx tsx scripts/seed-basecamp-exercises.ts
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

interface BasecampExercise {
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

const exercises: BasecampExercise[] = [
  // ── Week 1: ORIENT ──
  {
    name: "Seven Disruptions Inventory (New Role)",
    day: 1,
    week: 1,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: true,
    description:
      "Maps seven new-role disruptions (competence confidence, social belonging, cultural fluency, identity continuity, clarity of expectations, routine and rhythm, authority and credibility). Rates each 1–10. Same structural approach as PARACHUTE and JETSTREAM inventories but measures a different disruption set specific to entering a new context.",
    instructions: `Map the seven disruptions of entering a new role. This is your baseline.

Rate each disruption 1–10 (10 = most intense):
- Competence Confidence — how certain are you that you can do this job?
- Social Belonging — how connected do you feel to your new colleagues?
- Cultural Fluency — how well do you understand how things work here?
- Identity Continuity — how much do you feel like yourself in this new context?
- Clarity of Expectations — how clear are you on what success looks like?
- Routine and Rhythm — how settled is your daily work pattern?
- Authority and Credibility — how established is your professional standing?

Which disruption is loudest right now?
Which one are you pretending is fine but isn't?
Honest baseline. No reframing. Just where you are.`,
    howToRun:
      "Rate each of seven new-role disruptions 1-10. Identify loudest and most hidden. Honest baseline.",
    themeTags: ["self_awareness", "transition_grief", "identity_self_worth"],
    difficulty: "beginner",
  },
  {
    name: "Operational Values",
    day: 2,
    week: 1,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: true,
    description:
      "Decision-making values framed as sentence completions for specific professional situations. These are commitments, not aspirations. Designed to be referenced throughout the program and tested against real-world situations on Days 12, 25, and 30.",
    instructions: `Your values as commitments — not aspirations, not a wish list. Sentence completions for real situations.

Complete each sentence:
1. When I disagree with my manager, I will ___
2. When I don't know the answer, I will ___
3. When someone takes credit for my work, I will ___
4. When I'm asked to override my judgment, I will ___
5. When I feel the pull to overwork, I will ___
6. When I notice I'm performing rather than being genuine, I will ___
7. When the culture asks me to be someone I'm not, I will ___

These are not aspirational. They are operational. You will return to them on Days 12, 25, and 30 to test them against real experience.

Which of these completions felt easy? Which felt hard? The hard ones are where the real work is.`,
    howToRun:
      "Seven sentence completions for professional situations. Commitments, not aspirations. Reference document for the program.",
    themeTags: ["purpose_alignment", "autonomy", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Saboteurs, Centers, and Reactive Tendencies",
    day: 3,
    week: 1,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: true,
    description:
      "Three-framework integration: Positive Intelligence saboteurs (Pleaser, Hyper-Achiever, Expert, Controller, Avoider, Hyper-Vigilant), Enneagram three centers of intelligence (head/heart/body), and LCP three reactive tendencies (complying/protecting/controlling). Includes convergence mapping.",
    instructions: `Identify your patterns using three interconnected frameworks.

Part 1 — Saboteurs (Shirzad Chamine)
Which of these protection strategies are loudest as you enter this new role?
- Pleaser: agreeing to everything, managing impressions
- Hyper-Achiever: proving value through overwork and output
- Expert: needing to know everything before acting
- Controller: trying to shape outcomes others own
- Avoider: sidestepping conflict or hard conversations
- Hyper-Vigilant: scanning for threats, reading into every signal

Name your top 2–3. What does each say? When is it loudest?

Part 2 — Centers of Intelligence (Enneagram)
Under uncertainty, which center leads?
- Head (thinking, analyzing, planning — can become overthinking)
- Heart (reading people, seeking connection — can become people-pleasing)
- Body (acting, deciding, asserting — can become bulldozing)
Which center do you neglect?

Part 3 — Reactive Tendencies (LCP)
Under pressure, which direction do you move?
- Complying (moving toward — seeking approval, avoiding conflict)
- Protecting (moving away — withdrawing, intellectualizing)
- Controlling (moving against — pushing, dominating)

Convergence: Pleaser → complying → heart center. Controller → controlling → body center. Expert → protecting → head center. Where do you land?`,
    howToRun:
      "Three-framework integration: saboteurs, centers of intelligence, reactive tendencies. Identify top patterns and convergence.",
    themeTags: ["inner_critic", "self_awareness", "fear_of_failure"],
    difficulty: "intermediate",
  },
  {
    name: "Cultural Dimensions Mapping",
    day: 4,
    week: 1,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: false,
    description:
      "Dual-framework cultural assessment. Part 1: Global Dexterity six dimensions (Molinsky) — rate the new culture, rate yourself, note gaps. Part 2: Culture Map operational dimensions (Meyer) — rate the new culture, compare to previous culture.",
    instructions: `Read your new culture using two frameworks.

Part 1 — Global Dexterity (Andy Molinsky)
Rate the new culture AND yourself on each dimension (1–10):
- Directness: how blunt vs. diplomatic is communication?
- Enthusiasm: how much emotion is expressed at work?
- Formality: how hierarchical vs. egalitarian?
- Assertiveness: how much do people push for what they want?
- Self-promotion: how visible are people about their achievements?
- Personal disclosure: how much personal sharing happens at work?

Where is the biggest gap between you and the culture?

Part 2 — Culture Map (Erin Meyer)
How does this culture operate vs. your previous one?
- Communicating: low-context (explicit) vs. high-context (read between lines)
- Evaluating: direct negative feedback vs. indirect negative feedback
- Leading: egalitarian vs. hierarchical
- Deciding: consensual vs. top-down
- Trusting: task-based vs. relationship-based
- Disagreeing: confrontational vs. avoids confrontation

Where will you need to adapt most? Where will adaptation cost the most?`,
    howToRun:
      "Rate culture on Global Dexterity 6 dimensions and Culture Map dimensions. Compare to self and previous culture. Identify adaptation gaps.",
    themeTags: ["self_awareness", "resilience", "purpose_alignment"],
    difficulty: "intermediate",
  },
  {
    name: "Stakeholder Map — The Five Conversations",
    day: 5,
    week: 1,
    weekName: "ORIENT",
    duration: 5,
    isOnboarding: false,
    description:
      "Identifies specific people in five Watkins categories: historians, cultural interpreters, integrators, technical experts, pulse-readers. Names 1–2 people per category with specific questions for each.",
    instructions: `Identify who to talk to first — and what to ask them.

Five categories of essential conversations (Michael Watkins):

1. Historians — people who know why things are the way they are
   Who: ___  Question to ask: ___

2. Cultural interpreters — people who explain unwritten rules
   Who: ___  Question to ask: ___

3. Integrators — people who bridge groups and departments
   Who: ___  Question to ask: ___

4. Technical experts — people who hold institutional knowledge
   Who: ___  Question to ask: ___

5. Pulse-readers — people who know informal dynamics
   Who: ___  Question to ask: ___

Name 1–2 people per category. Write specific questions — not generic "how does it work here" but targeted questions that only this type of person could answer.

Which category do you have nobody for? That's where you're flying blind.`,
    howToRun:
      "Map 1-2 people per Watkins category. Write specific questions for each. Identify blind spots.",
    themeTags: ["self_awareness", "belonging", "resilience"],
    difficulty: "intermediate",
  },

  // ── Week 2: CONNECT ──
  {
    name: "Three Levels of Listening",
    day: 8,
    week: 2,
    weekName: "CONNECT",
    duration: 5,
    isOnboarding: false,
    description:
      "Introduction to the CTI three levels of listening. Level 1 (internal), Level 2 (focused), Level 3 (global). Practice protocol for stakeholder conversations. Connects to Carnegie's genuine interest and Voss's tactical empathy.",
    instructions: `Three levels of listening — and a practice assignment.

Level 1 — Internal Listening
You're processing through your own lens. Comparing, judging, planning your response. Most people live here.

Level 2 — Focused Listening
You hear the words AND the emotions. You reflect back. You ask follow-up questions based on what they said, not what you wanted to say next.

Level 3 — Global Listening
You read the room. Body language, energy shifts, what is NOT being said. The pause before an answer. The topic that was avoided. The shift in tone.

Practice protocol this week:
- Use Level 3 in your historian and stakeholder conversations
- After each conversation, log: what did you notice at Level 3 that you would have missed at Level 1?
- Specific attention: where did someone's words say one thing and their energy say another?

Level 2 is Dale Carnegie's genuine interest made precise. Level 3 is Chris Voss's tactical empathy — reading what's underneath.`,
    howToRun:
      "Learn three levels of listening (CTI). Practice Level 3 in stakeholder conversations. Log what you notice.",
    themeTags: ["self_awareness", "belonging", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Power & Proximity Mapping",
    day: 9,
    week: 2,
    weekName: "CONNECT",
    duration: 5,
    isOnboarding: false,
    description:
      "Two-part exercise. Part 1 (Analytical): Maps key players using Pfeffer's five power sources. Part 2 (Relational Proximity): Spatial mapping of relationship dynamics. Surfaces informal dynamics the analytical map cannot capture.",
    instructions: `Map the power landscape — both the visible structure and the invisible dynamics.

Part 1 — Analytical Power Map (Jeffrey Pfeffer)
For each key player in your new environment, assess:
- Formal authority: what is their position and span of control?
- Control of resources: what do they allocate (budget, headcount, access)?
- Control of information: what do they know that others don't?
- Network position: who are they connected to?
- Reputation: what is their standing — and is it earned?

Note the relationship between each power holder and your role. Who do you need? Who needs you? Where are the dependencies?

Part 2 — Relational Proximity Map
On a sheet of paper, place yourself and 8–10 key players as dots.
- Physical distance = emotional/professional distance
- Direction facing = where attention goes
- Center vs. periphery = influence position
- Clusters = alliances

What does the spatial picture show you that the analytical map missed? Where are the informal dynamics?`,
    howToRun:
      "Part 1: Map key players using Pfeffer's five power sources. Part 2: Relational proximity spatial mapping. Compare both views.",
    themeTags: ["self_awareness", "control", "resilience"],
    difficulty: "advanced",
  },
  {
    name: "Reading Your Manager",
    day: 10,
    week: 2,
    weekName: "CONNECT",
    duration: 5,
    isOnboarding: false,
    description:
      "Two-part exercise. Part 1: Maps the implicit contract with the manager — what they need, how they define success, communication preferences. Part 2: Uses Hebenstreit's Enneagram-informed observable working styles to read communication preferences.",
    instructions: `Understand your manager — beyond what they say they want.

Part 1 — The Implicit Contract
- What does your manager need from you (beyond stated expectations)?
- How do they define success — deliverables, visibility, loyalty, autonomy?
- Communication preferences: written or verbal? Summary or detail? Scheduled or ad hoc?
- Feedback style: direct or indirect? In-the-moment or stored up?
- Their pressures: what is their manager asking of them?
- Landmines: what topics, approaches, or behaviors would cause friction?

Part 2 — Reading Communication Style (Hebenstreit)
Without typing your manager, observe their pattern:
- Thinking-center patterns: needs data first, asks analytical questions, uncomfortable with emotion in meetings
- Feeling-center patterns: needs personal connection first, reads the room, decisions influenced by relationships
- Body-center patterns: needs directness and action, impatient with process, makes gut decisions

Which pattern dominates? How does that differ from yours? One specific adaptation you can make.`,
    howToRun:
      "Part 1: Map implicit contract with manager. Part 2: Read communication style using Hebenstreit's observable patterns. Identify one adaptation.",
    themeTags: ["self_awareness", "resilience", "interpersonal_conflict"],
    difficulty: "intermediate",
  },
  {
    name: "Communication Style Map + Instinctual Priorities",
    day: 11,
    week: 2,
    weekName: "CONNECT",
    duration: 5,
    isOnboarding: false,
    description:
      "Maps 3–5 key colleagues using Hebenstreit's observable communication preferences. Part 2: Enneagram instinctual subtype self-assessment for relational priorities (self-preservation, social, one-to-one).",
    instructions: `Map how your key people communicate — and how you relate.

Part 1 — Communication Style Map (Hebenstreit)
For 3–5 key colleagues or stakeholders, note their pattern:
- Needs data vs. goes with gut
- Needs to be heard vs. task-first
- Needs autonomy vs. collaboration
- Needs vision vs. structure
- Needs harmony vs. directness

For each person, identify one adaptation that would improve your communication with them.

Part 2 — Instinctual Priorities (Enneagram)
Which relational orientation are you leading with?
- Self-preservation: focused on security, territory, resources, comfort
- Social: focused on group position, hierarchy, reading the room, belonging
- One-to-one: focused on intensity, depth, chemistry, one deep connection

Which are you neglecting? In your new role, which would serve you to develop?

Practice: 10% more attention to the neglected orientation this week.`,
    howToRun:
      "Map 3-5 colleagues' communication styles. Identify instinctual priorities. 10% practice on neglected orientation.",
    themeTags: ["self_awareness", "belonging", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "The Authenticity-Adaptation Map",
    day: 12,
    week: 2,
    weekName: "CONNECT",
    duration: 5,
    isOnboarding: false,
    description:
      "Using cultural dimensions data from Day 4 and Week 2 observations, categorizes each cultural adaptation gap into three categories: flex comfortably, flex with awareness, non-negotiable. Saboteur overlay included.",
    instructions: `The line between adapting and losing yourself.

Using your cultural dimensions data from Day 4 and your observations from this week, categorize each gap:

1. Flex comfortably — easy adaptation, no meaningful cost
   Examples: adjusting email tone, meeting etiquette, schedule rhythm
   List yours: ___

2. Flex with awareness — manageable but touches something that matters
   Examples: self-promotion level, feedback directness, personal disclosure
   Needs monitoring for drift. List yours: ___

3. Non-negotiable — violates an operational value from Day 2
   Examples: asked to misrepresent data, undermine a colleague, compromise ethics
   The line. List yours: ___

Saboteur check:
- The Pleaser puts too much in category 1 ("I can adapt to anything!")
- The Controller puts too much in category 3 ("I refuse to change!")
- Be honest about which saboteur is sorting for you.

Return to Day 2 operational values. Do your categories hold up against them?

Greene's Law 38: Think as you like but behave like others — applies to categories 1 and 2, never to category 3.`,
    howToRun:
      "Categorize cultural gaps into flex/flex-with-awareness/non-negotiable. Saboteur overlay. Values check.",
    themeTags: ["purpose_alignment", "autonomy", "self_awareness"],
    difficulty: "advanced",
  },

  // ── Week 3: ACT ──
  {
    name: "Selecting Your Early Wins",
    day: 15,
    week: 3,
    weekName: "ACT",
    duration: 5,
    isOnboarding: false,
    description:
      "Watkins' early wins framework filtered through values, manager priorities, and cultural read. Four properties of a good early win. Calibrates ambition using the break-even point concept.",
    instructions: `Choose your first contributions deliberately.

Four properties of a good early win (Watkins, adapted):
1. Visible to the right people
2. Aligned with your manager's priorities (from Day 10)
3. Achievable within your current knowledge and access
4. Consistent with your operational values (from Day 2)

Identify 2–3 early wins that meet all four criteria.

For each:
- What is it specifically?
- Who will see it?
- What does it demonstrate about you?
- Which saboteur might over- or under-size it?

Calibration: Watkins' break-even point — when do you expect to be contributing more than you're consuming? Adjust ambition accordingly.

Strategic patience (Greene's Law 3): Lead with one change, not twenty. Your Hyper-Achiever wants to prove everything at once. Don't.`,
    howToRun:
      "Identify 2-3 early wins meeting four criteria. Calibrate ambition. Strategic patience over over-delivery.",
    themeTags: ["growth_momentum", "purpose_alignment", "self_awareness"],
    difficulty: "intermediate",
  },
  {
    name: "Creative vs. Reactive Contribution",
    day: 16,
    week: 3,
    weekName: "ACT",
    duration: 5,
    isOnboarding: false,
    description:
      "Applies LCP creative-reactive framework to early contributions. Maps reactive contributions (complying, protecting, controlling) and creative contributions (relating, self-awareness, authenticity, systems awareness, achieving). Includes Schein's 'temporary incompetence' concept.",
    instructions: `Are your early contributions creative or reactive? Review your first two weeks through the Leadership Circle lens.

List 3-5 specific contributions you've made so far. For each, tag it:

Reactive contributions (driven by pattern):
- Complying: delivering what people want to hear, avoiding disagreement. Example: "I agreed with the team's approach even though I saw a better way, because I didn't want to rock the boat."
- Protecting: withholding ideas until they're perfect, staying invisible. Example: "I had an insight in the meeting but waited too long to share it."
- Controlling: pushing your agenda too fast, not reading the room. Example: "I presented my solution before understanding the context of why they do it their way."

Creative contributions (driven by awareness):
- Relating: building genuine connections. Example: "I asked a colleague about their career path and learned something that changed how I see the team."
- Self-awareness: catching your saboteur before it drives behavior. Example: "I noticed my Expert saboteur wanting to prove I knew everything, and chose to ask a question instead."
- Authenticity: offering your real perspective, even when tentative. Example: "I shared an observation about the process that no one else had raised."
- Systems awareness: seeing patterns others miss because you're new. Example: "I noticed a gap between what was said in the all-hands and what happens on the ground."
- Achieving: genuine value aligned with organizational need.

For each contribution: was it creative or reactive? If reactive, what would the creative version have looked like?

Edgar Schein's research suggests that temporary incompetence is inevitable in any transition. The expert in you wants to skip it. The achiever wants to outrun it. Neither works.`,
    howToRun:
      "Review early contributions through LCP creative-reactive lens. Accept temporary incompetence.",
    themeTags: ["self_awareness", "growth_momentum", "inner_critic"],
    difficulty: "advanced",
  },
  {
    name: "Communication Calibration",
    day: 17,
    week: 3,
    weekName: "ACT",
    duration: 5,
    isOnboarding: false,
    description:
      "Maps how five key communication acts work in the new culture vs. the client's default: disagreeing, advocating, saying no, giving feedback, receiving feedback. References Day 12 authenticity-adaptation categories.",
    instructions: `How does communication work here — and how do you need to adjust?

For five communication acts, map the new culture's norm vs. your default:

1. Disagreeing
   Culture: how direct? Public or private? Framed as question or position?
   You: ___  Gap: ___

2. Advocating for ideas
   Culture: individual pitch or consensus building? Data or narrative? Pre-alignment needed?
   You: ___  Gap: ___

3. Saying no
   Culture: direct or indirect? What are the norms around declining?
   You: ___  Gap: ___

4. Giving feedback
   Culture: direct or wrapped? In-the-moment or scheduled? Specific or general?
   You: ___  Gap: ___

5. Receiving feedback
   Culture: expected response? Do you get the full message or need to read subtext?
   You: ___  Gap: ___

For each gap, reference your Day 12 categories: flex comfortably, flex with awareness, or non-negotiable.

Greene's Law 4 (say less than necessary): in a new role, listening more than speaking is calibration, not weakness.`,
    howToRun:
      "Map five communication acts: culture norm vs. your default. Identify gaps. Reference Day 12 categories.",
    themeTags: ["self_awareness", "resilience", "interpersonal_conflict"],
    difficulty: "intermediate",
  },
  {
    name: "Imposter Pattern Identification",
    day: 18,
    week: 3,
    weekName: "ACT",
    duration: 5,
    isOnboarding: false,
    description:
      "Introduction to Young's five imposter competence types: Perfectionist, Superwoman/man, Natural Genius, Soloist, Expert. Cross-referenced with Day 3 saboteur profile. Burns' cognitive distortion test applied.",
    instructions: `Which flavor of imposter are you?

Five imposter competence types (Valerie Young):

1. Perfectionist — fraud because work isn't flawless
2. Superwoman/man — fraud unless working harder than everyone
3. Natural Genius — fraud because things are hard (they used to be easy)
4. Soloist — fraud if you need help
5. Expert — fraud because you don't know everything

Which type is loudest right now? How is it affecting your new-role behavior?

Cross-reference with your Day 3 saboteur profile. Where do they overlap?
- Expert imposter ↔ Expert saboteur ↔ protecting tendency
- Perfectionist imposter ↔ Hyper-Achiever saboteur ↔ controlling tendency
- Soloist imposter ↔ Controller saboteur ↔ protecting tendency

Apply Burns' cognitive distortion test to the imposter's specific claim:
- The distorted version: "I don't belong here because ___"
- The accurate version: "The evidence shows ___"

The imposter is not the truth. But it is not random. It is a specific distortion with a specific origin.`,
    howToRun:
      "Identify dominant imposter type. Cross-reference with saboteurs. Apply cognitive distortion test.",
    themeTags: ["inner_critic", "fear_of_failure", "identity_self_worth"],
    difficulty: "intermediate",
  },
  {
    name: "Navigating Friction From Values",
    day: 19,
    week: 3,
    weekName: "ACT",
    duration: 5,
    isOnboarding: false,
    description:
      "Framework for responding to first real friction in a new role. Four lenses: cultural, saboteur, values, communication. Then decides: action or observation.",
    instructions: `Your first real friction. How you respond matters.

Name the friction: what happened? What's the tension?

Apply four lenses:
1. Cultural lens — is this a cultural gap, a political dynamic, or genuine disagreement?
2. Saboteur lens — which pattern is the friction response running through?
3. Values lens — does this touch a non-negotiable (Day 12) or is it flexable?
4. Communication lens — if action is needed, write the NVC-framed centered response: observation, feeling, need, request.

Then decide:
- Action (conversation, boundary, clarification) — if you have enough data and the stakes are real
- Observation (more data needed, too early to act) — if the saboteur is creating urgency the situation doesn't warrant

Critical distinction: separate the saboteur's urgency from the situation's actual timeline. Your Controller wants to fix it now. Your Avoider wants to ignore it forever. Neither is strategy.`,
    howToRun:
      "Apply four lenses to friction: cultural, saboteur, values, communication. Decide: act or observe. Separate urgency from timeline.",
    themeTags: ["interpersonal_conflict", "autonomy", "self_awareness"],
    difficulty: "advanced",
  },

  // ── Week 4: CALIBRATE ──
  {
    name: "Naming the Neutral Zone",
    day: 23,
    week: 4,
    weekName: "CALIBRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Introduction to Bridges' neutral zone concept. Applies Enneagram stress/security dynamic. Maps what shifts between secure and stressed states.",
    instructions: `You are in the neutral zone — between who you were and who you are becoming. William Bridges named this the developmental phase between the old identity and the new one. This is not failure. This is the transition.

Build your personal regulation map — a concrete reference tool:

1. MY SECURE STATE TRIGGERS (what shifts me toward growth):
   List 3-5 specific situations, people, or moments that make you feel safe, connected, and competent in this new role:
   - ___
   - ___
   - ___

2. MY STRESS STATE TRIGGERS (what shifts me toward reactivity):
   List 3-5 specific triggers that activate your saboteur and make you rigid, defended, or reactive:
   - ___
   - ___
   - ___

3. MY RECOVERY TOOLKIT (what shortens the stressed cycle):
   For each stress trigger above, write one specific thing that helps you return to your secure state:
   - When [trigger]: I will [specific action]
   - When [trigger]: I will [specific action]
   - When [trigger]: I will [specific action]

4. MY NEUTRAL ZONE MANTRA:
   Complete this sentence: "I am not behind. I am ___."

This is your regulation map — reference it when you notice yourself in a stressed cycle. Awareness doesn't prevent stress activation, but it may shorten the cycle.`,
    howToRun:
      "Name the neutral zone. Map stress/security triggers using Enneagram dynamic. Identify what shortens stressed cycles.",
    themeTags: ["self_awareness", "transition_grief", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Map Revision",
    day: 24,
    week: 4,
    weekName: "CALIBRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Structured revision of three maps with lived data: cultural map (update Global Dexterity and Culture Map ratings), power structure (update analytical map and proximity map), relationship inventory.",
    instructions: `Update your maps with three weeks of lived data.

1. Cultural Map Revision
Return to Day 4 ratings. What was accurate? What was off? What norms are only now visible?
Update your Global Dexterity ratings. Update your Culture Map ratings.
What do you understand about this culture now that you couldn't see in Week 1?

2. Power Structure Revision
Return to Day 9 maps. Who turned out more or less influential than expected?
Where have alliances shifted? Where do you sit now vs. Day 9?
Update both the analytical map and the proximity map.

3. Relationship Inventory
Which relationships are working? Which need attention?
Where is trust building? Where is it stalled?
Which conversation are you avoiding?

This is the Day 4 and Day 9 exercises applied with three weeks of real data. The gap between initial read and revised read is your learning.`,
    howToRun:
      "Revise three maps: cultural dimensions, power structure, relationships. Compare initial vs. revised readings.",
    themeTags: ["self_awareness", "growth_momentum", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Values Alignment Check + Relational Audit",
    day: 25,
    week: 4,
    weekName: "CALIBRATE",
    duration: 5,
    isOnboarding: false,
    description:
      "Returns to Day 2 operational values for real-world audit. Updates Day 12 authenticity-adaptation map. Part 2: Gottman relational audit for transition stress.",
    instructions: `Test your values against three weeks of experience.

Part 1 — Values Audit
Return to Day 2 operational values. For each:
- Tested? What happened?
- Where did you hold the line?
- Where did you drift? Was drift conscious or unconscious?
- Is drift accumulating cost?

Update the Day 12 authenticity-adaptation map with real-world data. Has anything moved categories?

Part 2 — Relational Audit (Gottman)
How is this transition affecting your closest relationships?
- Four Horsemen check: criticism, contempt, defensiveness, stonewalling — showing up?
- Bids for connection: turning toward or away?
- If partnered: where is the transition stress landing?
- If single: where is isolation showing up?

The transition does not stay at work. Name where it's leaking.`,
    howToRun:
      "Part 1: Audit Day 2 values against reality. Update Day 12 map. Part 2: Gottman relational check.",
    themeTags: ["purpose_alignment", "self_awareness", "belonging"],
    difficulty: "intermediate",
  },
  {
    name: "Sustainable Practice Design (New Role)",
    day: 27,
    week: 4,
    weekName: "CALIBRATE",
    duration: 3,
    isOnboarding: false,
    description:
      "Four forward habits for maintaining awareness beyond Day 30: weekly self-check-in, pre-meeting pause, monthly map update, ongoing Level 3 listening practice.",
    instructions: `Design the minimum practice you'll actually sustain. Not what sounds good — what you'll do.

For each habit, commit to a specific time and write your version:

1. Weekly self-check-in (15 min)
   When: ___ (day of week, time)
   Three questions I'll answer each week:
   - Which saboteur was loudest? What did I do about it?
   - Did any operational value (Day 2) get tested or compromised?
   - Which relationship needs attention this week?

2. Pre-meeting pause (60 seconds)
   Trigger: ___ (before which recurring meetings?)
   My 60-second sequence:
   - Name the saboteur most likely to show up: ___
   - Name what I actually need from this meeting: ___
   - One breath, feet on the floor

3. Monthly map update (30 min)
   When: ___ (which day of the month?)
   I'll review: cultural map, power map, relational proximity
   One question: where do I sit now vs. last month?

4. Level 3 listening practice (one meeting per week)
   Which meeting: ___
   After: what did I notice that I would have missed at Level 1?

Read your plan back. Does it feel realistic? If any habit feels like a "should," drop it and keep only what you'll actually do. Two habits sustained are better than four habits abandoned.

This is your forward practice — save it, print it, put it where you'll see it.`,
    howToRun:
      "Four forward habits: weekly check-in, pre-meeting pause, monthly maps, Level 3 listening. Minimum viable practice.",
    themeTags: ["growth_momentum", "self_awareness", "resilience"],
    difficulty: "beginner",
  },

  // ── Adaptive Exercises ──
  {
    name: "Level 3 Listening Practice",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Client is in observation mode, ready to practice relational awareness",
    description:
      "Pick one conversation today. Practice Level 3 listening: body language, energy shifts, what is not being said. Log what you noticed that you would have missed at Level 1.",
    instructions: `Level 3 Listening — Practice Session

Pick one conversation today — ideally one where the stakes are moderate.

During the conversation:
- Notice body language: posture, eye contact, hand movements
- Notice energy shifts: when do they lean in? Pull back? Speed up?
- Notice what is NOT being said: the topic that was avoided, the question that wasn't asked

After the conversation, log:
1. What did you notice at Level 3?
2. What would you have missed if you were only at Level 1 (focused on your own thoughts)?
3. Did anything you noticed change how you responded?

This is a skill, not a mindset. Skills improve with practice.`,
    howToRun:
      "One conversation with Level 3 attention. Log body language, energy, the unsaid. Compare to Level 1.",
    themeTags: ["self_awareness", "belonging", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Relational Proximity Map Update",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Relational landscape has shifted, new information about alliances or dynamics",
    description:
      "Quick spatial re-mapping of position in the system. Who moved closer? Further? Where are new connections? Where have alliances shifted?",
    instructions: `Quick Relational Proximity Re-Mapping

The relational landscape shifted. Update your picture.

On paper, re-draw the proximity map from Day 9:
- Who moved closer?
- Who moved further away?
- Where are new connections that didn't exist before?
- Where have alliances shifted?
- Where do you sit now vs. last time?

What does the new picture tell you? One insight you didn't have before.`,
    howToRun:
      "Re-draw proximity map. Note who moved, new connections, alliance shifts. One new insight.",
    themeTags: ["self_awareness", "control", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Cultural Dimension Spot-Check",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Cultural misfire, friction, or moment where natural style did not land",
    description:
      "Pick one Global Dexterity dimension. Rate where the culture is, where you are, and where the gap created friction today. One dimension, one adjustment.",
    instructions: `Cultural Spot-Check — One Dimension

Something didn't land. A moment where your natural style created friction.

Pick the Global Dexterity dimension most relevant:
- Directness
- Enthusiasm
- Formality
- Assertiveness
- Self-promotion
- Personal disclosure

Rate:
- Where is the culture? (1–10)
- Where were you? (1–10)
- Where did the gap create friction?

One adjustment to try tomorrow. Keep it small and specific.`,
    howToRun:
      "One dimension, one moment, one adjustment. Rate culture vs. self. Identify friction source.",
    themeTags: ["self_awareness", "resilience", "interpersonal_conflict"],
    difficulty: "beginner",
  },
  {
    name: "Imposter Distortion Test",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Imposter activation, self-doubt spike, feeling like a fraud",
    description:
      "Apply Burns' cognitive distortion categories to one specific imposter thought. Write the distorted version and the accurate version. Quick-use version of the Day 18 exercise.",
    instructions: `Imposter Distortion Test — Quick Version

One specific thought that says you don't belong.

Write it: "I don't belong because ___"

Apply Burns' distortion test:
- Overgeneralization? ("I failed at X therefore I fail at everything")
- Mental filter? (ignoring evidence of competence)
- Disqualifying the positive? ("That went well but it was easy")
- Magnification? (blowing up one mistake)
- Labeling? ("I am a fraud" vs. "I am learning a new role")

Rewrite: "The evidence shows ___"

The imposter is not the truth. It is a distortion activated by newness.`,
    howToRun:
      "One imposter thought. Apply cognitive distortion test. Rewrite with evidence.",
    themeTags: ["inner_critic", "fear_of_failure", "identity_self_worth"],
    difficulty: "intermediate",
  },
  {
    name: "Manager Communication Micro-Plan",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Upcoming manager meeting, uncertainty about approach",
    description:
      "Plan one specific manager interaction. What do they need from this conversation (using Hebenstreit communication style read)? What do you need? What is your centered version? Anticipate saboteur interference.",
    instructions: `Manager Meeting Prep — 10 Minutes

One specific upcoming interaction with your manager.

1. What do they need from this conversation?
   (Use your Hebenstreit read from Day 10: data first? Connection first? Action first?)

2. What do you need from this conversation?

3. Write the centered version — what you would say if your saboteur were quiet.

4. Write the saboteur's version — what you would say if your pattern were running.

5. The difference is your choice. Go with the centered version.`,
    howToRun:
      "One manager interaction. Their needs (Hebenstreit), your needs, centered vs. saboteur version.",
    themeTags: ["self_awareness", "resilience", "interpersonal_conflict"],
    difficulty: "beginner",
  },
  {
    name: "Stakeholder Re-Mapping",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 15,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Information gaps, mid-transition, need to identify new conversation partners",
    description:
      "Update Watkins' five categories with current knowledge. New historians and cultural interpreters identified. Who should you talk to next?",
    instructions: `Stakeholder Map Update

Return to Watkins' five categories from Day 5. Update with current knowledge.

1. Historians — anyone new who knows the backstory?
2. Cultural interpreters — anyone who's helped you decode the unwritten rules?
3. Integrators — anyone who bridges groups you need access to?
4. Technical experts — anyone who holds knowledge you still need?
5. Pulse-readers — anyone who reads the room in ways you can't yet?

What questions do you now know to ask that you didn't know on Day 5?
Who should you talk to next? What specifically would you ask them?`,
    howToRun:
      "Update five Watkins categories with current knowledge. New questions you didn't have on Day 5.",
    themeTags: ["self_awareness", "belonging", "growth_momentum"],
    difficulty: "intermediate",
  },
  {
    name: "Early Win Evaluation",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Post-delivery reflection, completed a contribution",
    description:
      "Review a contribution. Was it creative or reactive (LCP framework)? Did it align with values and manager priorities? What would you do differently?",
    instructions: `Post-Delivery Reflection

One contribution you completed. Review it honestly.

1. Creative or reactive? (LCP framework)
   - Creative: genuine value, aligned, from awareness
   - Reactive: proving, protecting, or complying

2. Values alignment: did it honor your Day 2 operational values?

3. Manager alignment: did it address what your manager actually needs?

4. What would you do differently?

Not all reactive contributions are bad. But knowing which mode you were in is the practice.`,
    howToRun:
      "Review one contribution: creative or reactive? Values-aligned? Manager-aligned? Lessons.",
    themeTags: ["growth_momentum", "purpose_alignment", "self_awareness"],
    difficulty: "beginner",
  },
  {
    name: "Stress/Security Check",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Feeling stuck, regressing, oscillating between confidence and doubt",
    description:
      "Are you operating from your secure self (open, flexible, curious) or your stressed self (rigid, reactive, defended)? What shifted you? Quick recalibration using Enneagram stress/security dynamic.",
    instructions: `Stress/Security Quick Check

Right now — are you in your secure self or your stressed self?

Secure self: open, flexible, curious, willing to experiment, able to laugh at yourself
Stressed self: rigid, reactive, defended, catastrophizing, saboteur-driven

What shifted you into this state?

If stressed:
- What would shift you back toward secure?
- Is the threat real or projected?
- What does your stressed self want to do? What would your secure self do instead?

Quick recalibration. Not a fix. A moment of awareness.`,
    howToRun:
      "Secure vs. stressed check. What shifted you? What would shift you back? Quick recalibration.",
    themeTags: ["self_awareness", "resilience", "inner_critic"],
    difficulty: "beginner",
  },
  {
    name: "Power Dynamics Spot-Read",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 10,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "After a meeting where dynamics were visible, political moment observed",
    description:
      "One specific meeting or interaction. Who held power? Which power source (Pfeffer)? How did they use it? Where did you sit in the dynamic?",
    instructions: `Power Dynamics — One Meeting

One specific meeting or interaction where power was visible.

1. Who held power in that room?
2. Which power source? (Pfeffer)
   - Formal authority
   - Control of resources
   - Control of information
   - Network position
   - Reputation
3. How did they use it? (directly, subtly, through others)
4. Where did you sit in the dynamic?
5. What did you learn about how this place works?

One insight about how power operates here.`,
    howToRun:
      "One meeting: who held power, which source, how used, your position. One insight.",
    themeTags: ["self_awareness", "control", "resilience"],
    difficulty: "intermediate",
  },
  {
    name: "Authenticity-Adaptation Check",
    day: null,
    week: 0,
    weekName: "ADAPTIVE",
    duration: 5,
    isOnboarding: false,
    isAdaptive: true,
    trigger: "Felt inauthentic, noticed a drift from values, moment of performing",
    description:
      "One specific moment today where you adapted your behavior. Which Day 12 category — flex comfortably, flex with awareness, or non-negotiable? Did it touch a value? Quick recalibration.",
    instructions: `Authenticity Check — One Moment

One specific moment today where you adapted your behavior in the new culture.

1. What happened? What did you do differently than you would naturally?

2. Which Day 12 category?
   - Flex comfortably: no real cost
   - Flex with awareness: manageable but it matters
   - Non-negotiable: shouldn't have flexed

3. Did it touch an operational value from Day 2?

4. If it was "flex with awareness" — is the adaptation accumulating cost? Or is it genuinely manageable?

Quick check. Not a crisis. A moment of honesty about where you are.`,
    howToRun:
      "One adaptation moment. Which category? Did it touch a value? Is cost accumulating?",
    themeTags: ["purpose_alignment", "autonomy", "self_awareness"],
    difficulty: "beginner",
  },
];

async function main() {
  console.log("Seeding BASECAMP (new_role) program-specific exercises...\n");

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
      program_slug: "new_role",
      source_file: "basecamp-exercises",
      modality: "integrative",
      originator: "All Minds on Deck",
      source_work: "BASECAMP Program",
      duration_minutes: ex.duration,
      when_to_use: ex.isAdaptive
        ? `Adaptive exercise — trigger: ${ex.trigger}`
        : `Day ${ex.day} coaching plan exercise`,
      neuroscience_rationale: null,
      coaching_questions: [],
      file_line_ref: ex.isAdaptive
        ? `basecamp:adaptive:${ex.name.toLowerCase().replace(/\s+/g, "_")}`
        : `basecamp:day${ex.day}`,
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
