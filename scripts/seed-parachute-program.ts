/**
 * Seed PARACHUTE (layoff) program + all 30 program_days into Supabase.
 *
 * Run: npx tsx scripts/seed-parachute-program.ts
 *
 * Requires:
 *   1. programs-table.sql migration applied
 *   2. program-days-table.sql migration applied
 *   3. SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey
);

// ─── Program Definition ───────────────────────────────────────────

const PARACHUTE_PROGRAM = {
  slug: "layoff",
  name: "PARACHUTE",
  tagline: "A 30-Day Emotional Processing Intensive for Involuntary Job Loss",
  description:
    "PARACHUTE is a 30-day coached container for processing what happened when you lost your job, and arriving somewhere you can think clearly about what comes next. The target audience is tech professionals — PMs, engineers, designers, analysts, marketers — people trained to solve problems fast. That instinct will fight the program.",
  duration_days: 30,
  weekly_themes: [
    {
      week: 1,
      name: "GROUND",
      title: "Face What Actually Happened",
      territory:
        "Process the grief, shock, and financial anxiety of job loss. Assess the seven disruptions. Identify your nervous system patterns and saboteurs. Establish a daily practice.",
    },
    {
      week: 2,
      name: "DIG",
      title: "Uncover the Beliefs Underneath",
      territory:
        "Examine what you believe about yourself, your worth, and where those beliefs came from. Deepen saboteur awareness. Trace family patterns around work and identity. Clarify your values.",
    },
    {
      week: 3,
      name: "BUILD",
      title: "Rebuild Your Story and Confidence",
      territory:
        "Construct an honest narrative about what happened. Assess your competence without the distortion of loss. Understand market and industry shifts. Notice what is emerging.",
    },
    {
      week: 4,
      name: "INTEGRATE",
      title: "Bring It All Together",
      territory:
        "Reassess your disruptions with fresh eyes. Pressure-test your values. Consolidate saboteur awareness into a forward practice. Name what is still unresolved.",
    },
  ],
  intake_config: {
    pre_start_questions: [
      { id: "departure", question: "When did you leave?", type: "date" },
      {
        id: "departure_type",
        question: "How did you leave?",
        type: "select",
        options: [
          "Layoff",
          "PIP",
          "Resignation under pressure",
          "Other",
        ],
      },
      {
        id: "goal_statement",
        question: "One or two sentences: what do you want from this program?",
        type: "textarea",
      },
      {
        id: "disruptions_quick",
        question: "Seven disruptions quick-rate (1-10)",
        type: "disruptions_scale",
        items: [
          "Income and Financial Security",
          "Routine and Structure",
          "Identity",
          "Social Belonging",
          "Sense of Competence",
          "Future Uncertainty",
          "Skill Confidence",
        ],
      },
    ],
    consent_toggles: [
      { id: "ai_processing", label: "AI processing", required: true },
      { id: "coach_sharing", label: "Coach sharing", required: false },
      {
        id: "aggregate_analytics",
        label: "Aggregate analytics",
        required: false,
        default: true,
      },
      { id: "data_deletion", label: "Data deletion rights", required: true },
    ],
  },
  pricing_cents: 7500,
  active: true,
};

// ─── Day Definitions (all 30 days) ────────────────────────────────

interface ProgramDay {
  day_number: number;
  week_number: number;
  title: string;
  territory: string;
  seed_prompts: { prompt: string; purpose: string; context?: string }[];
  coaching_exercises: {
    name: string;
    duration_min: number;
    custom_framing: string;
  }[];
  overflow_defaults: {
    name: string;
    originator: string;
    source: string;
    file_ref: string;
    duration_min: number;
    modality: string;
  }[];
  framework_analysis_default: {
    name: string;
    originator: string;
    source_ref: string;
    example: string;
  };
  micro_content: string;
  system_notes: string;
  is_onboarding: boolean;
}

const days: ProgramDay[] = [
  // ═══════════════════════════════════════════════════════════════
  // WEEK 1: GROUND — What Actually Happened
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 1,
    week_number: 1,
    title: "Arrival",
    territory: "Grief, shock, baseline assessment, seven disruptions",
    seed_prompts: [
      {
        prompt: "What is true about your situation right now? Not what might happen.",
        purpose: "Ground in present reality",
      },
      {
        prompt: "Which of the seven disruptions is loudest?",
        purpose: "Identify primary disruption",
        context: "The seven disruptions are: income & financial security, routine & structure, identity, social belonging, sense of competence, future uncertainty, and skill confidence. Losing a job can shake all of them at once.",
      },
      {
        prompt: "What did you lose that you have not said out loud yet?",
        purpose: "Surface unspoken grief",
      },
    ],
    coaching_exercises: [
      {
        name: "Seven Disruptions Inventory",
        duration_min: 5,
        custom_framing:
          "Losing a job disrupts more than income — it can shake your sense of identity, routine, confidence, belonging, and security all at once. These are the 'seven disruptions.' Rate each one from 1 (barely affected) to 10 (strongly affected): Income & financial security, Routine & structure, Identity, Social belonging, Sense of competence, Future uncertainty, Skill confidence. Then note: how long can your finances hold? Who is supporting you right now? What have you already tried? This is your honest starting point — no right answers.",
      },
    ],
    overflow_defaults: [
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Window of Tolerance Tracking", originator: "Siegel/Ogden", source: "Sensorimotor", file_ref: "03:20", duration_min: 1, modality: "somatic" },
      { name: "Self-Connection Practice", originator: "NVC / Mediate Your Life", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Polyvagal State Assessment",
      originator: "Porges",
      source_ref: "00:58",
      example:
        "If journal shows panic: system identifies sympathetic activation and explains the response. If flatness: dorsal. Matched regulation tools.",
    },
    micro_content:
      "Seven disruptions: why job loss hits harder than expected. Multiple systems offline simultaneously. (Pauline Boss, Ambiguous Loss; William Bridges, Transitions.)",
    system_notes:
      "Day 1. Step 1 draws from intake data. Plan exercise doubles as onboarding.",
    is_onboarding: true,
  },
  {
    day_number: 2,
    week_number: 1,
    title: "The Timeline",
    territory: "Narrative context, relationship dynamics, decision points",
    seed_prompts: [
      { prompt: "When did you first sense something was shifting?", purpose: "Trace early signals" },
      { prompt: "Write the story you tell yourself about why this happened.", purpose: "Surface self-narrative" },
      { prompt: "What part of the experience are you most tired of carrying?", purpose: "Identify burden" },
    ],
    coaching_exercises: [
      {
        name: "Timeline Mapping",
        duration_min: 5,
        custom_framing: "Think back over the last 6-12 months. Write down the key events, shifts, and decisions that led to where you are now — include moments at work, in relationships, and any turning points you remember. Don't just list facts; include how you felt at each stage. What was happening between you and the people around you? This timeline helps us see the full picture, not just the ending.",
      },
    ],
    overflow_defaults: [
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Prediction Process",
      originator: "Barrett / BEabove",
      source_ref: "01:61",
      example: "If journal replays events with intense emotion: what did your brain predict at each point? Where was the prediction accurate to a past experience but outdated for the current one?",
    },
    micro_content: "What happened vs. the story about what happened. Both real. Only one changeable. (Hayes, ACT; Beck, CBT.)",
    system_notes: "Analytical clients produce clean timelines. Prompts push toward emotional subtext.",
    is_onboarding: true,
  },
  {
    day_number: 3,
    week_number: 1,
    title: "The Body's Account",
    territory: "Somatic mapping, family patterns, work and worth teachings",
    seed_prompts: [
      { prompt: "Where in your body do you feel the loss? Describe without explaining.", purpose: "Somatic awareness" },
      { prompt: "What is your body asking for that you've been overriding?", purpose: "Body intelligence" },
      { prompt: "What did your family believe about people who struggle professionally?", purpose: "Family pattern excavation" },
    ],
    coaching_exercises: [
      {
        name: "Somatic Mapping + Family Patterns",
        duration_min: 5,
        custom_framing: "Your body keeps a record of stress that your mind sometimes skips over. Scan from head to toe: where do you feel tension, heaviness, tightness, or numbness? Name the location and describe the sensation (e.g., 'tight chest,' 'heavy shoulders,' 'knot in stomach'). Don't explain why — just notice.\n\nThen: what did your family believe about people who lost their jobs or struggled at work? What messages did you absorb about achievement, failure, and your worth being tied to work? These beliefs often run quietly in the background — naming them is the first step to seeing them clearly.",
      },
    ],
    overflow_defaults: [
      { name: "Prediction Process", originator: "BEabove / Barrett", source: "BEabove", file_ref: "01:61", duration_min: 3, modality: "cognitive" },
      { name: "Clearing Exercise", originator: "Co-Active, CTI", source: "CTI", file_ref: "03:260", duration_min: 5, modality: "somatic" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Polyvagal Ladder",
      originator: "Porges / Dana",
      source_ref: "00:58",
      example: "Maps somatic reports to polyvagal hierarchy. Tension + racing = sympathetic. Numbness = dorsal. Provides matched regulation.",
    },
    micro_content: "Nervous system: no distinction between physical and identity threat. Same hardware. (Porges; van der Kolk.)",
    system_notes: "After Day 3: system generates 6 goals. Client approves before Day 4.",
    is_onboarding: true,
  },
  {
    day_number: 4,
    week_number: 1,
    title: "The Voices",
    territory: "Inner critic, saboteur patterns, protection strategies",
    seed_prompts: [
      { prompt: "Harshest internal voice on your job loss. Its exact words.", purpose: "Surface inner critic" },
      { prompt: "When did you first hear this voice? Older than this job?", purpose: "Trace origin" },
      { prompt: "If this voice were data, what would the data tell you?", purpose: "Create analytical distance" },
    ],
    coaching_exercises: [
      {
        name: "Saboteur Identification",
        duration_min: 5,
        custom_framing: "Under stress, we all develop automatic patterns that once helped us cope but now often work against us. In coaching, these are called 'saboteurs.' Common ones include: the Pleaser (says yes to avoid conflict), the Hyper-Achiever (overworks to prove worth), the Controller (tries to manage everything), the Victim (feels powerless), the Hyper-Vigilant (constantly scanning for threats), and the Avoider (sidesteps difficult conversations or feelings).\n\nIdentify your top 2-3: What does each one say to you? When does it get loudest? What is it trying to protect you from? Understanding this isn't about judging yourself — it's about recognising patterns so you can start to choose differently.",
      },
    ],
    overflow_defaults: [
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "TIPP", originator: "Linehan", source: "DBT", file_ref: "03:50", duration_min: 2, modality: "somatic" },
      { name: "Transforming Inner Critic", originator: "NVC adaptation", source: "NVC", file_ref: "02:127", duration_min: 5, modality: "relational" },
      { name: "6 F's Parts Work", originator: "Schwartz", source: "IFS", file_ref: "04:54", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Immunity to Change",
      originator: "Kegan & Lahey",
      source_ref: "07:88",
      example: "If journal shows stuckness despite wanting to move forward: surfaces hidden competing commitments. Goal > behaviors against it > hidden commitment > big assumption.",
    },
    micro_content: "Saboteurs: protection strategies from earlier threats. Outdated advisors. (Chamine; Schwartz, IFS.)",
    system_notes: "Cornerstone. If Enneagram available: cross-references saboteur with type structure.",
    is_onboarding: false,
  },
  {
    day_number: 5,
    week_number: 1,
    title: "Financial Reality vs. Financial Panic",
    territory: "Financial facts, burn rate, runway, anxiety vs evidence",
    seed_prompts: [
      { prompt: "Your actual numbers. Not the feeling.", purpose: "Ground in facts" },
      { prompt: "Financial fear that wakes you up. Fact or projection?", purpose: "Separate fact from fear" },
      { prompt: "One action you've been avoiding.", purpose: "Surface avoidance" },
    ],
    coaching_exercises: [
      {
        name: "Financial Ground Truth",
        duration_min: 5,
        custom_framing: "Financial anxiety after a job loss often mixes facts with fear — and the fear can feel so loud that it's hard to tell which is which. Start by writing down the hard numbers: How much do you spend per month? How many months of savings do you have? What's your health insurance situation? Then separate the facts from the fears: list three concrete actions that are within your control right now (applying for unemployment, updating your budget, reaching out to your network). Next, list three financial worries that are projections — things that haven't happened yet and may not. Seeing the difference on paper doesn't erase the anxiety, but it gives your brain something solid to work with instead of spinning.",
      },
    ],
    overflow_defaults: [
      { name: "Three Circles", originator: "Covey", source: "7 Habits", file_ref: "01:311", duration_min: 3, modality: "cognitive" },
      { name: "Emotion Wave Surfing", originator: "DBT/Somatic", source: "DBT", file_ref: "03:244", duration_min: 3, modality: "somatic" },
      { name: "Physiological Sigh", originator: "Huberman/Spiegel", source: "Stanford", file_ref: "07:443", duration_min: 1, modality: "somatic" },
      { name: "OFNR Practice", originator: "Rosenberg", source: "NVC", file_ref: "02:9", duration_min: 3, modality: "relational" },
      { name: "Committed Action Planning", originator: "Hayes", source: "ACT", file_ref: "04:352", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "CBA: Cost-Benefit Analysis",
      originator: "SMART Recovery",
      source_ref: "01:420",
      example: "If journal shows a financial decision being avoided: four-quadrant analysis. Costs of acting, benefits of acting, costs of not acting, benefits of not acting.",
    },
    micro_content: "Financial anxiety: partially money, partially what money represents. (Bandura; Pauline Boss.)",
    system_notes: "Concrete. Earns trust for less concrete work ahead.",
    is_onboarding: false,
  },
  {
    day_number: 6,
    week_number: 1,
    title: "The Routine Vacuum",
    territory: "Structure loss, daily architecture, anxiety containment",
    seed_prompts: [
      { prompt: "What does your day actually look like?", purpose: "Map current reality" },
      { prompt: "Smallest structure that would help tomorrow.", purpose: "Pragmatic design" },
      { prompt: "Old routine you miss? One you're free of?", purpose: "Nuanced reflection" },
    ],
    coaching_exercises: [
      {
        name: "Minimal Structure Design",
        duration_min: 3,
        custom_framing: "When you lose a job, you lose the structure that organized your entire day — when to wake up, where to go, what to do next. Without it, days can blur together and anxiety fills the empty space. This exercise is not about building a productivity system or a packed schedule. It's about creating a floor — the bare minimum structure that keeps you from dissolving into the couch or the doom scroll. Pick three daily anchors: one physical (a walk, a shower by a certain time, a meal you actually cook), one reflective (this program — your journaling and exercises), and one connective (a text, a call, seeing another human). Write these three down. That's your day's skeleton. Everything else is optional.",
      },
    ],
    overflow_defaults: [
      { name: "The ONE Thing", originator: "Keller", source: "The ONE Thing", file_ref: "01:573", duration_min: 2, modality: "cognitive" },
      { name: "Permission Slips", originator: "Brown", source: "Dare to Lead", file_ref: "01:1411", duration_min: 2, modality: "cognitive" },
      { name: "Polyvagal Reset", originator: "Porges/Dana", source: "Polyvagal", file_ref: "03:77", duration_min: 3, modality: "somatic" },
      { name: "Bid Recognition", originator: "Gottman", source: "Gottman", file_ref: "02:279", duration_min: 2, modality: "relational" },
      { name: "Behavioral Activation", originator: "ACT/CBT", source: "ACT", file_ref: "04:420", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Body Budget",
      originator: "Barrett / BEabove",
      source_ref: "01:722",
      example: "If journal shows depletion: reviews deposits (rest, connection, movement) vs. withdrawals (stress, worry, isolation). Budget in deficit = brain predicts threat.",
    },
    micro_content: "Structure is not productivity. Container against dissolving into anxiety. (Bridges; Burkeman.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 7,
    week_number: 1,
    title: "The Acceptance Curve",
    territory: "Grief stages, acceptance spectrum, week 1 check-in",
    seed_prompts: [
      { prompt: "Where do you place yourself? Not where you should be.", purpose: "Honest self-placement" },
      { prompt: "What keeps pulling you back?", purpose: "Identify resistance" },
      { prompt: "Anything shifted since Day 1?", purpose: "Track movement" },
    ],
    coaching_exercises: [
      {
        name: "Acceptance Curve Placement",
        duration_min: 3,
        custom_framing: "After any significant loss, people naturally move through stages — shock, anger, bargaining, sadness, and eventually some form of acceptance. This isn't a neat, linear path; you might bounce between stages in a single afternoon. The point of this exercise is simply to notice where you are right now, honestly, without judging yourself for not being further along. On a spectrum from 'still in shock' to 'starting to accept what happened,' place yourself wherever feels true. Then ask: what keeps pulling me backward (replaying events, anger at specific people, guilt)? And what creates even small forward movement (conversations, this program, moments of clarity)? There's no pressure to be anywhere specific. Knowing where you actually are is the only useful starting point.",
      },
    ],
    overflow_defaults: [
      { name: "Scaling Questions", originator: "de Shazer", source: "SFBT", file_ref: "01:374", duration_min: 2, modality: "cognitive" },
      { name: "Grief Ritual Creation", originator: "Somatic traditions", source: "Somatic", file_ref: "03:274", duration_min: 5, modality: "somatic" },
      { name: "5-4-3-2-1 Grounding", originator: "Somatic", source: "Grounding", file_ref: "03:132", duration_min: 3, modality: "somatic" },
      { name: "Relational Gratitude Loop", originator: "Systems coaching", source: "Relational", file_ref: "02:588", duration_min: 2, modality: "relational" },
      { name: "Radical Acceptance", originator: "Linehan", source: "DBT", file_ref: "04:302", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Dual Process Model",
      originator: "Stroebe & Schut",
      source_ref: "08:index",
      example: "If journal is all grief, no forward movement (or all forward, no grief): healthy oscillation between loss-orientation and restoration-orientation. Getting stuck in one is the risk.",
    },
    micro_content: "Acceptance is not agreement. (Linehan, DBT; Tara Brach.)",
    system_notes: "",
    is_onboarding: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 2: DIG — What You Believe and Where It Came From
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 8,
    week_number: 2,
    title: "Identity Without the Org Chart",
    territory: "Role identity, status, competency beyond title",
    seed_prompts: [
      { prompt: "Who are you when not at work? If you struggle: notice that.", purpose: "Identity exploration" },
      { prompt: "What parts of identity survived intact?", purpose: "Resilient identity" },
      { prompt: "What identity from the job do you miss most?", purpose: "Specific mourning" },
    ],
    coaching_exercises: [
      {
        name: "Role Identity Transition",
        duration_min: 5,
        custom_framing: "When you work somewhere for a while, your job title and role become part of how you see yourself — and how others see you. Losing that role can feel like losing a piece of who you are. This exercise helps you untangle your identity from your last position. Start by completing these sentences: 'In my last role, I was known as ___.' 'My status or sense of importance came from ___.' Sit with what comes up — which parts of you are mourning that identity? Then shift forward: 'The skill or competency that actually matters to me, regardless of title, is ___.' The goal is to start separating who you are from the role you held, so you can see what's yours to keep and what belonged to the job.",
      },
    ],
    overflow_defaults: [
      { name: "Kegan Subject-Object Shift", originator: "Kegan", source: "Harvard", file_ref: "07:56", duration_min: 3, modality: "cognitive" },
      { name: "Meaning-Making", originator: "Frankl / Tedeschi & Calhoun", source: "Logotherapy", file_ref: "01:544", duration_min: 5, modality: "cognitive" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "15% Risk Zone", originator: "Bradford & Robin", source: "IPD", file_ref: "02:235", duration_min: 2, modality: "relational" },
      { name: "The Path Exercise", originator: "Schwartz", source: "IFS", file_ref: "04:163", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Marcia Identity Status",
      originator: "Marcia",
      source_ref: "07:62",
      example: "If journal shows 'I don't know who I am': that is Moratorium (exploring, not yet committed). Not stuckness. Developmental stage before Achievement.",
    },
    micro_content: "Job loss removes the primary mechanism for accessing personal value in performance cultures. Structural, not personal. (Kegan; Ibarra.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 9,
    week_number: 2,
    title: "Social Belonging and Isolation",
    territory: "Belonging gaps, work vs life community, reconnection",
    seed_prompts: [
      { prompt: "Who did you lose access to? Not the company. The people.", purpose: "Specific relational loss" },
      { prompt: "Where do you experience belonging unrelated to work?", purpose: "Non-work belonging" },
      { prompt: "What conversation are you avoiding?", purpose: "Surface avoidance" },
    ],
    coaching_exercises: [
      {
        name: "Belonging Inventory",
        duration_min: 3,
        custom_framing: "One of the hidden losses of a job is the community that came with it — the people you saw every day, the Slack channels, the lunch conversations, the feeling of being part of something. That sense of belonging doesn't just disappear; it leaves a gap. This exercise asks you to take stock of where you still feel like you belong. Write down the groups, people, and places where you feel welcome and connected — friends, family, neighborhoods, communities, teams, online groups. Then separate them: which ones were tied to work, and which ones exist independent of any job? Where are the gaps? Are there relationships you've let drift that you could reconnect with? Seeing the full picture helps you know what to rebuild and what's already there waiting for you.",
      },
    ],
    overflow_defaults: [
      { name: "SCARF Diagnostic", originator: "Rock", source: "NeuroLeadership", file_ref: "01:1161", duration_min: 3, modality: "cognitive" },
      { name: "Enemy Image Process", originator: "NVC", source: "NVC", file_ref: "02:52", duration_min: 5, modality: "relational" },
      { name: "Savoring Practice", originator: "Somatic/Positive Psych", source: "Positive Psychology", file_ref: "03:593", duration_min: 3, modality: "somatic" },
      { name: "Vulnerability Loop", originator: "Bradford & Robin", source: "IPD", file_ref: "02:206", duration_min: 3, modality: "relational" },
      { name: "Partnership Design Reflection", originator: "Systems coaching", source: "Relational", file_ref: "04:480", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Festinger Comparison Audit",
      originator: "Festinger",
      source_ref: "07:381",
      example: "If journal shows LinkedIn spiraling or peer comparison: comparing unfiltered internal experience to curated external presentation. Motivating or demoralizing?",
    },
    micro_content: "Social connection regulates the nervous system. Isolation after job loss is not just lonely — it is dysregulating. (Lieberman; Porges.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 10,
    week_number: 2,
    title: "The Beliefs You Brought In",
    territory: "Professional beliefs, origin tracing, stress encoding",
    seed_prompts: [
      { prompt: "A professional belief predating this job. One that's new.", purpose: "Sort old from new" },
      { prompt: "Which belief does the most damage?", purpose: "Identify harmful belief" },
      { prompt: "Argue against your harshest belief. Evidence?", purpose: "Cognitive challenge" },
    ],
    coaching_exercises: [
      {
        name: "Belief Inventory",
        duration_min: 5,
        custom_framing: "We all carry beliefs about ourselves as professionals — things like 'I'm only valuable if I'm productive,' 'I should have seen this coming,' or 'People like me don't stay unemployed long.' Some of these beliefs were with you long before this job; others formed during or after the loss. Write down 5 to 10 beliefs you hold about yourself as a professional. For each one, note: Where did this belief come from (family, a boss, your industry, this specific experience)? Did you hold it before the job loss, or is it new? Does this belief help you or hold you back? Which beliefs feel loudest right now? The point isn't to argue yourself out of them yet — it's to see them clearly, so they stop running in the background like invisible code.",
      },
    ],
    overflow_defaults: [
      { name: "ABC Model", originator: "Ellis", source: "REBT", file_ref: "01:142", duration_min: 5, modality: "cognitive" },
      { name: "Chooser-Evaluator Map", originator: "NVC", source: "NVC", file_ref: "02:76", duration_min: 3, modality: "relational" },
      { name: "Stress Management Sequence", originator: "BEabove", source: "BEabove", file_ref: "01:709", duration_min: 2, modality: "cognitive" },
      { name: "Pinch-Crunch Model", originator: "Bradford", source: "IPD", file_ref: "02:225", duration_min: 3, modality: "relational" },
      { name: "Protective Parts Appreciation", originator: "Schwartz", source: "IFS", file_ref: "04:80", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Cognitive Distortions Checklist",
      originator: "Burns",
      source_ref: "07:180",
      example: "If journal shows distorted beliefs: scans for all-or-nothing, overgeneralization, mental filter, emotional reasoning, should statements, labeling, personalization. Naming creates distance.",
    },
    micro_content: "Beliefs under stress encode disproportionately. Feel like truth because written during threat. (Beck; Barrett.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 11,
    week_number: 2,
    title: "The Achievement Equation",
    territory: "Family work-worth patterns, inherited beliefs, identity-achievement fusion",
    seed_prompts: [
      { prompt: "What did your family believe about unemployed people?", purpose: "Family beliefs" },
      { prompt: "Self-worth attached to title? Be precise.", purpose: "Precision on attachment" },
      { prompt: "Who are you when not producing?", purpose: "Identity beyond output" },
    ],
    coaching_exercises: [
      {
        name: "Family Patterns: Work and Worth",
        duration_min: 5,
        custom_framing: "Many of our deepest beliefs about work and self-worth were absorbed long before we entered the workforce — from how our families talked about money, success, and people who struggled professionally. This exercise asks you to trace those roots. First: What did your family believe about people who lost their jobs or were unemployed? Was it spoken openly or communicated through silence and judgment? Second: Think about the companies you've worked for. What behaviors got rewarded? What did the culture teach you about your worth (titles, promotions, performance reviews, visibility)? How much of that reward system have you internalized as your own measure of yourself? Finally, try to separate the inherited belief — 'work equals worth' — from what you actually believe when that inherited voice is quiet. They may not be the same thing.",
      },
    ],
    overflow_defaults: [
      { name: "Kegan Subject-Object Shift", originator: "Kegan", source: "Harvard", file_ref: "07:56", duration_min: 3, modality: "cognitive" },
      { name: "Self-Compassion Letter", originator: "Neff", source: "Self-Compassion", file_ref: "03:464", duration_min: 5, modality: "somatic" },
      { name: "Somatic Pendulation", originator: "Levine", source: "SE", file_ref: "03:375", duration_min: 3, modality: "somatic" },
      { name: "Reaching Through the Wormhole", originator: "BEabove", source: "BEabove", file_ref: "01:522", duration_min: 3, modality: "cognitive" },
      { name: "Courageous Love Check-in", originator: "IFS/Relationship", source: "IFS", file_ref: "04:177", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Brooks: Fluid vs. Crystallized",
      originator: "Brooks",
      source_ref: "07:46",
      example: "If journal shows 'I should be further along': is this a fluid intelligence expectation applied to a crystallized season? Not decline. Different contribution.",
    },
    micro_content: "In tech, job loss removes the mechanism for accessing personal value. Structural. (Kegan; Newport.)",
    system_notes: "Heaviest day for many. If Enneagram Type 3 or 8 wing: system notes identity-achievement fusion.",
    is_onboarding: false,
  },
  {
    day_number: 12,
    week_number: 2,
    title: "Saboteur Deepening",
    territory: "Saboteur tracking, pattern interruption, the gap",
    seed_prompts: [
      { prompt: "Loudest saboteur this week. Specific words.", purpose: "Track saboteur activity" },
      { prompt: "When you listened vs. didn't?", purpose: "Notice choice points" },
      { prompt: "Saboteur as colleague with bad data. Your response?", purpose: "Create distance through metaphor" },
    ],
    coaching_exercises: [
      {
        name: "Saboteur Patterns in Action",
        duration_min: 3,
        custom_framing: "On Day 4, you identified your saboteurs — those automatic stress responses like the Pleaser, the Hyper-Achiever, or the Controller. Now it's time to watch them in action. Over the past week, when did each saboteur show up? What specific situation triggered it? What did it make you do or avoid? For example: 'My Hyper-Achiever kicked in Tuesday when I saw a LinkedIn post, and I spent four hours compulsively applying to jobs I don't even want.' The most important skill here is noticing the gap — the tiny moment between when the saboteur activates and when you act on it. That gap is where choice lives. Even if you can't change the pattern yet, simply noticing 'oh, there it is' is the beginning of not being run by it.",
      },
    ],
    overflow_defaults: [
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Anger Reclamation", originator: "Chemaly", source: "Rage Becomes Her", file_ref: "04:1342", duration_min: 5, modality: "integrative" },
      { name: "Bilateral Stimulation", originator: "EMDR-derived", source: "EMDR", file_ref: "03:354", duration_min: 2, modality: "somatic" },
      { name: "Faux Feelings Translation", originator: "NVC", source: "NVC", file_ref: "02:141", duration_min: 3, modality: "relational" },
      { name: "Protector Dialogue", originator: "Schwartz", source: "IFS", file_ref: "04:131", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Brewer Habit Loop",
      originator: "Brewer, Brown",
      source_ref: "07:403",
      example: "If journal shows saboteur running automatically: maps Trigger > Behavior > Reward. Noticing IS the interrupt.",
    },
    micro_content: "The gap between noticing a pattern and being run by it. (Schwartz; Chamine.)",
    system_notes: "If Enneagram: cross-references saboteur with type's core fear.",
    is_onboarding: false,
  },
  {
    day_number: 13,
    week_number: 2,
    title: "Values From Lived Experience",
    territory: "Values from moments of alignment, not menus",
    seed_prompts: [
      { prompt: "Moment when you felt fully yourself at work. Not a category. A moment.", purpose: "Experiential values" },
      { prompt: "What value was being honored?", purpose: "Extract from experience" },
      { prompt: "When did you last feel that way?", purpose: "Recency check" },
    ],
    coaching_exercises: [
      {
        name: "Values Excavation Part 1",
        duration_min: 5,
        custom_framing: "Values are not something you pick from a list — they're something you discover by looking at what has already mattered to you. Instead of choosing words like 'integrity' or 'growth' from a menu, you're going to find your values in your own experience. Think of three specific moments in your career when you felt fully yourself — moments when the work felt right, when you were energized, when you thought 'this is what I'm meant to do.' Describe each moment in a few sentences: what were you doing, who were you with, and what made it feel meaningful? Then look underneath each one: what value was being honored in that moment? Maybe it was autonomy, creativity, collaboration, impact, or something else entirely. Your values already exist in your history. This exercise just makes them visible.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification: Peak Experience", originator: "CTI", source: "Co-Active", file_ref: "01:342", duration_min: 5, modality: "cognitive" },
      { name: "HEAL", originator: "Hanson", source: "Hardwiring Happiness", file_ref: "01:285", duration_min: 3, modality: "cognitive" },
      { name: "Energy Accounting", originator: "Somatic", source: "Somatic", file_ref: "03:551", duration_min: 2, modality: "somatic" },
      { name: "Need Behind the Frustration", originator: "Systems coaching", source: "Relational", file_ref: "02:780", duration_min: 3, modality: "relational" },
      { name: "Authentic Living Practice", originator: "ACT", source: "ACT", file_ref: "01:453", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "ACT Values vs. Goals",
      originator: "Hayes",
      source_ref: "01:350",
      example: "If journal conflates values with goals: 'get a good job' is a goal. The value underneath (contribution, security, challenge) cannot be taken from you.",
    },
    micro_content: "Values: what you cannot stop caring about even when it would be easier to. (CTI; Hayes; Brown.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 14,
    week_number: 2,
    title: "The Forced Rank",
    territory: "Values tradeoffs, forced ranking, commitment",
    seed_prompts: [
      { prompt: "Hardest to rank. What does that tell you?", purpose: "Surface resistance" },
      { prompt: "Last job: honored which? Violated which?", purpose: "Apply to reality" },
      { prompt: "Top three as non-negotiables. What changes?", purpose: "Test commitment" },
    ],
    coaching_exercises: [
      {
        name: "Values Stack Ranking",
        duration_min: 5,
        custom_framing: "Yesterday you identified values from your career experiences. Today you have to rank them — and it will be uncomfortable on purpose. When everything is a priority, nothing is. Take the values you uncovered and force yourself to pick only three that matter most. Here's how: if two of your values conflict — say, financial security and creative freedom — which one wins? If you could only honor three values in your next role, which three would they be? Write your top three in order. Then test them against your last job: which of these were honored? Which were violated? This ranking doesn't mean the other values don't matter. It means you now have a decision-making tool — when opportunities come along, you'll know what to weigh heaviest.",
      },
    ],
    overflow_defaults: [
      { name: "HOV: Hierarchy of Values", originator: "SMART Recovery", source: "SMART Recovery", file_ref: "01:334", duration_min: 5, modality: "cognitive" },
      { name: "Living Into Your Values", originator: "Brown", source: "Dare to Lead", file_ref: "01:1411", duration_min: 5, modality: "cognitive" },
      { name: "Somatic Boundary Awareness", originator: "Somatic", source: "Somatic", file_ref: "03:212", duration_min: 2, modality: "somatic" },
      { name: "Four Agreements Check", originator: "Ruiz / Integrative", source: "Integrative", file_ref: "04:550", duration_min: 2, modality: "integrative" },
      { name: "Willingness", originator: "Linehan", source: "DBT", file_ref: "04:312", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Immunity to Change: Values",
      originator: "Kegan & Lahey",
      source_ref: "07:88",
      example: "If journal shows values hard to live: (1) want to live by ___. (2) Do things against it. (3) Hidden commitment. (4) Big assumption.",
    },
    micro_content: "Forced ranking removes ambiguity. Commitment makes values useful. (SMART Recovery; CTI.)",
    system_notes: "",
    is_onboarding: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 3: BUILD — Narrative, Competence, and Perspective
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 15,
    week_number: 3,
    title: "Values Under Pressure",
    territory: "Values pressure test, real scenarios, conviction vs competing commitment",
    seed_prompts: [
      { prompt: "Moment today living a value without trying.", purpose: "Notice embodiment" },
      { prompt: "Which value gets overridden by financial pressure first?", purpose: "Identify vulnerability" },
      { prompt: "Compromise vs. self-betrayal. Where's the line?", purpose: "Boundary clarity" },
    ],
    coaching_exercises: [
      {
        name: "Values Pressure Test",
        duration_min: 5,
        custom_framing: "It's one thing to rank values when things are calm — it's another to hold onto them when a real opportunity pushes back. Research by Shalom Schwartz at the Hebrew University of Jerusalem suggests that values only predict behavior when they've been activated under realistic conditions — not just ranked on a list. This exercise creates that activation. Each scenario presents a realistic dilemma where two of your values pull in opposite directions. Read the situation, then choose the option that feels most true to you — not what sounds better on paper. After each choice, notice: did that feel easy or did it cost something? The ones that cost something are the most informative. When you're done with all five scenarios, look at the pattern — are your choices consistent with the ranking from Day 14, or did pressure rearrange them?",
      },
    ],
    overflow_defaults: [
      { name: "Values-Based Decision Making", originator: "Hayes", source: "ACT", file_ref: "01:350", duration_min: 3, modality: "cognitive" },
      { name: "Opposite Action", originator: "Linehan", source: "DBT", file_ref: "07:295", duration_min: 3, modality: "somatic" },
      { name: "Vagal Tone Building", originator: "Porges/Dana", source: "Polyvagal", file_ref: "07:914", duration_min: 3, modality: "somatic" },
      { name: "Assertiveness Practice", originator: "IPD/DBT", source: "IPD", file_ref: "02:1115", duration_min: 3, modality: "relational" },
      { name: "Meeting Yourself Where You Are", originator: "SMART Recovery", source: "SMART", file_ref: "04:720", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Workability Assessment",
      originator: "Hayes",
      source_ref: "01:445",
      example: "If journal shows values compromises: 'Is this strategy working? If you keep doing this for 5 years, where does it lead?'",
    },
    micro_content: "Stated vs. lived values. The gap is information. (Brown; Hayes.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 16,
    week_number: 3,
    title: "The Performance Culture Mirror",
    territory: "Structural perspective, tech industry context, locating not minimizing",
    seed_prompts: [
      { prompt: "Suffering from the loss itself vs. what it means in your industry?", purpose: "Separate sources" },
      { prompt: "If the market was the primary variable, what changes?", purpose: "Structural reframe" },
      { prompt: "Where do you belong unrelated to job?", purpose: "Belonging check" },
    ],
    coaching_exercises: [
      {
        name: "Structural Perspective",
        duration_min: 5,
        custom_framing: "When you lose a job, it's natural to make it entirely personal — 'What did I do wrong?' But job loss often involves factors far beyond individual performance. This exercise asks you to list the specific factors that contributed to your situation — then tag each one as 'structural' (outside your control), 'personal' (within your control), or 'mixed.' Company-wide layoffs, AI restructuring, budget cuts — these are structural. Avoiding difficult conversations, not adapting to new tools — these are personal. Most people carry far more personal shame than the facts warrant. After tagging everything, count the ratio. What shifts when you see how much of your situation was structural? This isn't about letting yourself off the hook — it's about being accurate, so you can focus your energy on what's actually yours to work on.",
      },
    ],
    overflow_defaults: [
      { name: "Cognitive Distortions Checklist", originator: "Burns", source: "CBT", file_ref: "07:180", duration_min: 3, modality: "cognitive" },
      { name: "Mindfulness of Current Emotion", originator: "DBT/MBSR", source: "DBT", file_ref: "07:378", duration_min: 3, modality: "somatic" },
      { name: "Attention Restoration", originator: "Kaplan & Kaplan", source: "Environmental Psychology", file_ref: "07:841", duration_min: 3, modality: "somatic" },
      { name: "Just Like Me", originator: "Mindfulness/metta", source: "Mindfulness", file_ref: "01:1362", duration_min: 2, modality: "relational" },
      { name: "Innovator's Dilemma Reflection", originator: "Integrative", source: "Integrative", file_ref: "04:532", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Barrett Emotional Granularity",
      originator: "Barrett",
      source_ref: "07:423",
      example: "If journal says 'bad' about the market: get specific. Disappointed? Scared? Resentful? Specificity enables targeted response.",
    },
    micro_content: "Job loss shame amplified by culture that treats career gaps as failure. Culture feature. (Festinger; Clance; Brooks.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 17,
    week_number: 3,
    title: "The Competence Archive",
    territory: "Evidence collection, counter-record, self-efficacy",
    seed_prompts: [
      { prompt: "Something you did at work you're quietly proud of.", purpose: "Surface pride" },
      { prompt: "What do people trust you with, specifically?", purpose: "External evidence" },
      { prompt: "When you dismiss accomplishments, whose voice?", purpose: "Trace dismissal" },
    ],
    coaching_exercises: [
      {
        name: "Evidence Collection",
        duration_min: 5,
        custom_framing: "After a job loss, your brain tends to build a case against you — replaying mistakes, dismissing accomplishments, and questioning whether you were ever really good at your work. This exercise builds a counter-record. For each entry, write something concrete you did well in your career in the left column, and the evidence of its impact in the right column — a result, a comment from a colleague, a metric, a problem solved. Focus on strength and leadership moments, not just project deliverables: keeping a team calm during a crisis, mentoring someone who grew, speaking up when no one else would, building trust across departments, handling an escalation with grace. Tag each entry: 'leadership' for people and team moments, 'technical' for skills and craft, 'impact' for results and outcomes. Aim for at least eight entries. This list feeds tomorrow's skill discovery work.",
      },
    ],
    overflow_defaults: [
      { name: "Four Dimensions of Confidence", originator: "Cognitive", source: "Cognitive", file_ref: "01:1004", duration_min: 5, modality: "cognitive" },
      { name: "HEAL", originator: "Hanson", source: "Hardwiring Happiness", file_ref: "01:285", duration_min: 3, modality: "cognitive" },
      { name: "Energy-Attention Audit", originator: "Performance", source: "Performance", file_ref: "07:815", duration_min: 3, modality: "somatic" },
      { name: "Dual Acknowledgment", originator: "Systems coaching", source: "Relational", file_ref: "02:310", duration_min: 2, modality: "relational" },
      { name: "Self vs Self-Like Parts", originator: "Schwartz", source: "IFS", file_ref: "04:92", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Bandura Self-Efficacy",
      originator: "Bandura",
      source_ref: "07:99",
      example: "If journal shows self-doubt: mastery experience is strongest efficacy source. Your evidence collection is building source #1.",
    },
    micro_content: "Competence does not disappear when told it did. (Bandura; Clance.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 18,
    week_number: 3,
    title: "Three Versions of the Story",
    territory: "Narrative versions, truth layers, attachment to story",
    seed_prompts: [
      { prompt: "Version most tired of telling.", purpose: "Identify narrative fatigue" },
      { prompt: "If someone you respect had this experience?", purpose: "Compassion reframe" },
      { prompt: "What have you edited out?", purpose: "Surface omissions" },
    ],
    coaching_exercises: [
      {
        name: "Narrative Construction Part 1",
        duration_min: 5,
        custom_framing: "You probably tell different versions of your job loss story to different people — and each version reveals something. This exercise asks you to write three versions of what happened. Version 1: The one you tell acquaintances or networking contacts (the polished, safe version). Version 2: The one you tell close friends (more honest, more feeling). Version 3: The 3am version — the one you tell yourself when you can't sleep, with all the raw, unedited thoughts. Write each one out, even briefly. Then compare them: What do you leave out of the polished version? What shows up at 3am that you'd never say out loud? Which version feels closest to the truth? The goal isn't to pick the 'right' story — it's to see the gap between what you show the world and what you actually carry.",
      },
    ],
    overflow_defaults: [
      { name: "CBT Thought Record", originator: "Beck", source: "CBT", file_ref: "07:157", duration_min: 5, modality: "cognitive" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "Somatic Containment", originator: "Levine/Gendlin", source: "SE", file_ref: "07:895", duration_min: 3, modality: "somatic" },
      { name: "Three Conversations", originator: "Stone et al.", source: "Difficult Conversations", file_ref: "02:805", duration_min: 3, modality: "relational" },
      { name: "Self-Led Journaling", originator: "Schwartz", source: "IFS", file_ref: "04:105", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Dual Process: Narrative",
      originator: "Stroebe & Schut",
      source_ref: "08:index",
      example: "If narratives are only loss-oriented or only restoration-oriented: healthy processing oscillates. The honest version includes both.",
    },
    micro_content: "Story you tell filters what you believe you deserve next. (Ibarra; Brown.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 19,
    week_number: 3,
    title: "Skills Hidden in Your Evidence",
    territory: "Skill discovery from evidence, Leadership Circle creative competencies, capability extraction",
    seed_prompts: [
      { prompt: "What capability do people keep coming to you for?", purpose: "Surface natural strengths" },
      { prompt: "What skill do you use without thinking about it?", purpose: "Identify unconscious competence" },
      { prompt: "What did you do well that nobody trained you to do?", purpose: "Find innate gifts" },
    ],
    coaching_exercises: [
      {
        name: "Skill Discovery",
        duration_min: 5,
        custom_framing: "Yesterday you built a counter-record of things you've done well. Today you're going to extract the capabilities hidden inside that evidence. For each entry from Day 17, look underneath the accomplishment: what skill made it possible? 'Kept the team calm during a crisis' → steadiness under pressure. 'Mentored two junior engineers' → developing others. 'Spoke up when everyone else stayed silent' → courageous advocacy. Use the Leadership Circle creative competency domains as a lens: Relating (caring connection, teamwork), Self-Awareness (composure, personal learning), Authenticity (integrity, courageous authenticity), Systems Awareness (seeing the whole picture), and Achieving (strategic focus, decisive action). After mapping your skills, look at which domains they cluster in. Where you're heavy tells you where you naturally lead from. Where you're light may reveal untapped potential. This is Part 1 of a two-day skill awareness arc.",
      },
    ],
    overflow_defaults: [
      { name: "Decatastrophizing Ladder", originator: "CBT", source: "CBT", file_ref: "07:250", duration_min: 5, modality: "cognitive" },
      { name: "Mindfulness of Current Emotion", originator: "DBT/MBSR", source: "DBT", file_ref: "07:378", duration_min: 3, modality: "somatic" },
      { name: "Pressure Body Map", originator: "Levine/Gendlin", source: "SE", file_ref: "07:869", duration_min: 5, modality: "somatic" },
      { name: "Social Comparison Detox", originator: "Festinger", source: "Social Comparison", file_ref: "01:660", duration_min: 3, modality: "relational" },
      { name: "Wise Mind", originator: "Linehan", source: "DBT", file_ref: "04:320", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Young Imposter Types",
      originator: "Young",
      source_ref: "07:464",
      example: "If journal shows imposter feelings about market relevance: which type? Perfectionist, Superwoman, Natural Genius, Soloist, Expert. Type reveals intervention.",
    },
    micro_content: "Job loss shame amplified by industry that treats gaps as failure. (Clance; Young; Feiler.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 20,
    week_number: 3,
    title: "The Story You Can Stand Behind",
    territory: "Narrative refinement, authenticity, ownership",
    seed_prompts: [
      { prompt: "Day 18 versions. What feels false now?", purpose: "Evolve narrative" },
      { prompt: "Can you tell this without apologizing?", purpose: "Test ownership" },
      { prompt: "What should the listener understand about you?", purpose: "Core message" },
    ],
    coaching_exercises: [
      {
        name: "Narrative Refinement",
        duration_min: 5,
        custom_framing: "On Day 18, you wrote three versions of your story — the polished one, the honest one, and the raw 3am one. Today you're going to craft a version you can actually stand behind. This isn't the LinkedIn version that sounds fine but feels hollow. And it's not the 3am version that's real but too heavy to carry everywhere. It's the version that's true — that doesn't punish you and doesn't perform positivity you don't feel. Write it out: What happened? What was your role in it (honestly)? What did you learn? What are you carrying forward? Read it back to yourself. Can you say it without apologizing? Without minimizing? Without over-explaining? If it still costs you energy to say it, something isn't quite right yet. The goal is a story that's yours — one that doesn't require maintenance.",
      },
    ],
    overflow_defaults: [
      { name: "Cognitive Rehearsal Under Pressure", originator: "CBT", source: "CBT", file_ref: "07:958", duration_min: 5, modality: "cognitive" },
      { name: "Clearing Exercise", originator: "CTI", source: "Co-Active", file_ref: "03:260", duration_min: 3, modality: "somatic" },
      { name: "Somatic Containment + Rehearsal", originator: "Levine", source: "SE", file_ref: "07:895", duration_min: 3, modality: "somatic" },
      { name: "DEAR MAN", originator: "Linehan", source: "DBT", file_ref: "02:338", duration_min: 3, modality: "relational" },
      { name: "Celebration Practice", originator: "Heath / Integrative", source: "Integrative", file_ref: "04:434", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Ibarra Working Identity",
      originator: "Ibarra",
      source_ref: "07:85",
      example: "If journal shows narrative perfectionism: identity transition happens through doing, not thinking. Each version is a test. The 'final' version is the one that currently fits.",
    },
    micro_content: "If it sounds like a LinkedIn post, it is not done yet. (Ibarra; Bradford.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 21,
    week_number: 3,
    title: "Self-Efficacy and Skill Confidence",
    territory: "Skill audit, real gaps vs fear projections, mastery",
    seed_prompts: [
      { prompt: "One capability you trust completely.", purpose: "Anchor confidence" },
      { prompt: "Skill most worried about. Evidence or ambient anxiety?", purpose: "Test reality" },
      { prompt: "What would it take to believe your competence without external confirmation?", purpose: "Internal validation" },
    ],
    coaching_exercises: [
      {
        name: "Skill Map",
        duration_min: 5,
        custom_framing: "This is Part 2 of the skill awareness arc you started on Day 19. Today you're mapping the full landscape of what you bring — not just what your last job used. Sort skill cards into three zones: 'I Lead With This' (strengths you trust and use naturally), 'I Have This But Underuse It' (real capability that's been dormant), and 'I Want to Grow This' (genuine interest, early development). The cards come from three sources: the skills you extracted from your evidence on Day 19, additional capabilities from the Leadership Circle creative competencies you may not have named but recognize in yourself, and — if your Enneagram type is known — your type's natural gifts. After sorting, look at the clusters. If most cards land in 'I Lead With This,' you may be underestimating your range. If most land in 'I Want to Grow,' you may be discounting what you already have. The 'Underuse' zone is often the most interesting — those are capabilities waiting for the right context to come alive.",
      },
    ],
    overflow_defaults: [
      { name: "Build Mastery", originator: "Linehan", source: "DBT", file_ref: "07:327", duration_min: 3, modality: "cognitive" },
      { name: "EMDR Resource Development", originator: "Shapiro", source: "EMDR", file_ref: "07:690", duration_min: 5, modality: "somatic" },
      { name: "Physiological Sigh", originator: "Huberman/Spiegel", source: "Stanford", file_ref: "07:443", duration_min: 1, modality: "somatic" },
      { name: "15% Risk Zone", originator: "Bradford & Robin", source: "IPD", file_ref: "02:235", duration_min: 3, modality: "relational" },
      { name: "Committed Action Planning", originator: "Hayes", source: "ACT", file_ref: "04:352", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Huberman Struggle-Phase",
      originator: "Huberman",
      source_ref: "07:427",
      example: "If journal shows frustration during upskilling: frustration IS the signal the brain is changing. Adrenaline marks circuits. Struggle is the prerequisite.",
    },
    micro_content: "Self-efficacy: rebuilt through evidence, not affirmation. (Bandura; Ericsson.)",
    system_notes: "",
    is_onboarding: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 4: ORIENT — Notice What Shifted. Decide What's Next.
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 22,
    week_number: 4,
    title: "Thread Pulling",
    territory: "Emerging interests, concrete exploration steps, planned happenstance",
    seed_prompts: [
      { prompt: "What keeps grabbing your interest that you've dismissed?", purpose: "Notice dismissed pulls" },
      { prompt: "What would following that spark look like?", purpose: "10% exploration" },
      { prompt: "What voice says 'not realistic'?", purpose: "Identify saboteur on emergence" },
    ],
    coaching_exercises: [
      {
        name: "Thread Pulling",
        duration_min: 5,
        custom_framing: "After three weeks of processing, some threads are pulling at you — interests, curiosities, or directions you keep dismissing because they don't seem practical. Stanford psychologist John Krumboltz's planned happenstance theory suggests that career breakthroughs often come from following unexpected interests, not from rigid planning. This exercise names those threads and attaches concrete next steps. A 'thread' is not a career plan — it's something that keeps catching your attention. For each thread, write why it pulls you (genuine curiosity, not 'should') and one small, low-risk step you could take this week: read an article, have a coffee chat, attend a meetup, try something for an afternoon. Your underused skills from Day 21 and journal themes may surface threads you haven't named yet. Which thread would you pull if no one were watching?",
      },
    ],
    overflow_defaults: [
      { name: "Miracle Question", originator: "de Shazer", source: "SFBT", file_ref: "01:366", duration_min: 3, modality: "cognitive" },
      { name: "VACI", originator: "SMART Recovery", source: "SMART Recovery", file_ref: "07:1028", duration_min: 5, modality: "cognitive" },
      { name: "Inner Compass Check-In", originator: "Midlife/Transition", source: "Transition", file_ref: "11:169", duration_min: 3, modality: "somatic" },
      { name: "Appreciation with OFNR", originator: "NVC", source: "NVC", file_ref: "02:600", duration_min: 2, modality: "relational" },
      { name: "Active Imagination", originator: "Jung", source: "Jungian", file_ref: "11:200", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Scharmer Theory U",
      originator: "Scharmer",
      source_ref: "07:332",
      example: "If journal shows reaching for new direction: are you Downloading, Seeing, Sensing, or Presencing? Most live in Downloading. Invitation: drop to Sensing.",
    },
    micro_content: "First half of life: building ego. Second half: integrating what was neglected. (Jung; Brooks.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 23,
    week_number: 4,
    title: "What I Know Now",
    territory: "Crystallized takeaways, portable statements, operating manual",
    seed_prompts: [
      { prompt: "What do you understand now that you didn't on Day 1?", purpose: "Crystallize learning" },
      { prompt: "What's the most important thing you've challenged about yourself?", purpose: "Name the shift" },
      { prompt: "What would you tell someone starting this program?", purpose: "Distill wisdom" },
    ],
    coaching_exercises: [
      {
        name: "What I Know Now",
        duration_min: 5,
        custom_framing: "Today you're consolidating the most important things you've learned into five concrete statements you can carry forward. Not a reflection on the program — a distilled operating manual. Complete each sentence: 1) 'The belief about myself that I've challenged most is ___. What I now think instead is ___.' 2) 'The saboteur pattern I'm most aware of is ___. When it shows up, I now ___.' 3) 'The value I will not compromise on, even under financial pressure, is ___.' 4) 'The capability I was undervaluing or ignoring is ___.' 5) 'The one thing I understand about my situation now that I didn't on Day 1: ___.' Each response should be 1-3 sentences. Not a journal entry — a distilled statement. These five statements become your reference point for Days 25-27 and beyond.",
      },
    ],
    overflow_defaults: [
      { name: "Sailboat Exercise", originator: "Midlife/Transition", source: "Transition", file_ref: "11:109", duration_min: 5, modality: "cognitive" },
      { name: "Gratitude 3-Finger", originator: "Mindfulness", source: "Mindfulness", file_ref: "01:1324", duration_min: 1, modality: "cognitive" },
      { name: "Letting Go Practice", originator: "Kabat-Zinn", source: "MBSR", file_ref: "01:1248", duration_min: 3, modality: "somatic" },
      { name: "Forgiveness in Repair", originator: "IPD/Relational", source: "Relational", file_ref: "02:1141", duration_min: 3, modality: "relational" },
      { name: "Devotions Exercise", originator: "Midlife/Transition", source: "Transition", file_ref: "11:182", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Bridges Neutral Zone",
      originator: "Bridges",
      source_ref: "07:80",
      example: "If journal shows in-between discomfort: Neutral Zone is most productive phase but feels worst. People fail by rushing the Ending, fleeing the Neutral Zone, or freezing at New Beginnings.",
    },
    micro_content: "I honor what was. I welcome what is becoming. (Bridges; Jung.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 24,
    week_number: 4,
    title: "Seven Disruptions Revisited",
    territory: "Reassessment, Day 1 comparison, movement as data",
    seed_prompts: [
      { prompt: "Day 1 vs. today. What changed?", purpose: "Track movement" },
      { prompt: "Which disruption surprised you?", purpose: "Unexpected shifts" },
      { prompt: "Which still has hooks?", purpose: "Identify remaining grip" },
    ],
    coaching_exercises: [
      {
        name: "Seven Disruptions Reassessment",
        duration_min: 5,
        custom_framing: "On Day 1, you rated each of the seven disruptions on a scale of 1 to 10. Today you're rating them again — same scale, same disruptions. You'll see your Day 1 scores alongside your new ratings in a side-by-side grid. For each disruption, rate where you are now and note what changed. Some numbers may have dropped significantly. Others may be stubbornly stuck or even higher than before — both are normal. After completing the grid, you'll see a visual comparison highlighting your biggest shifts and the areas that still need attention. Movement is data. Non-movement is also data. Where you moved most tells you where the program landed. Where you're stuck tells you where your energy needs to go next.",
      },
    ],
    overflow_defaults: [
      { name: "Scaling Questions", originator: "de Shazer", source: "SFBT", file_ref: "01:374", duration_min: 2, modality: "cognitive" },
      { name: "Mindfulness of Current Emotion", originator: "DBT/MBSR", source: "DBT", file_ref: "07:378", duration_min: 3, modality: "somatic" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "Do-Reflect-Apply", originator: "Bradford & Robin", source: "IPD", file_ref: "01:880", duration_min: 3, modality: "relational" },
      { name: "Trailhead Extended", originator: "Schwartz", source: "IFS", file_ref: "04:1072", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Barrett Body Budget Audit",
      originator: "Barrett/BEabove",
      source_ref: "01:722",
      example: "If specific disruptions remain: compares deposits vs. withdrawals across 30 days per domain. Areas still disrupted often correlate with chronic budget deficits.",
    },
    micro_content: "Progress not linear. Finances resolved while identity untouched. Normal. Data. (Stroebe & Schut; Bridges.)",
    system_notes: "Bring Day 1 data forward.",
    is_onboarding: false,
  },
  {
    day_number: 25,
    week_number: 4,
    title: "Saboteurs Under Pressure",
    territory: "Contingency plans, pressure preparation, pattern awareness",
    seed_prompts: [
      { prompt: "Interview tomorrow. Which saboteur first?", purpose: "Anticipate under pressure" },
      { prompt: "What would it tell you? What if you listened?", purpose: "Examine saboteur message" },
      { prompt: "What instead, knowing what you know?", purpose: "Apply learning" },
    ],
    coaching_exercises: [
      {
        name: "Saboteur Contingency Plan",
        duration_min: 5,
        custom_framing: "You know your saboteurs from Day 4 — today you build an if-then plan for each one so you're not caught off guard when pressure hits. For each saboteur, you'll see your Day 4 data (the name, exact words, what it protects you from) pre-loaded at the top of a card. Below that, fill in three fields: (1) TRIGGER SITUATION — when does this saboteur show up? Be specific: 'Before an interview when I'm worried I'll say the wrong thing.' (2) THE IF-THEN PLAN — 'When I notice [trigger], I will [specific action].' For example: 'When I notice my Perfectionist telling me I need to be flawless, I will take three breaths and ask: is this voice helping me right now?' (3) THE TRUTH I'LL RETURN TO — from your Day 23 statements, the grounding truth that counters this saboteur. Implementation intentions — 'when X, I will Y' — are one of the most effective behavior change tools in psychology (Peter Gollwitzer, NYU). Read each plan out loud when you're done. Speaking it may help it stick.",
      },
    ],
    overflow_defaults: [
      { name: "Cognitive Rehearsal", originator: "CBT", source: "CBT", file_ref: "07:958", duration_min: 5, modality: "cognitive" },
      { name: "Cope Ahead", originator: "Linehan", source: "DBT", file_ref: "02:407", duration_min: 5, modality: "relational" },
      { name: "EMDR Resource Development", originator: "Shapiro", source: "EMDR", file_ref: "07:690", duration_min: 3, modality: "somatic" },
      { name: "Crucial Conversation Prep", originator: "Patterson et al.", source: "Crucial Conversations", file_ref: "01:561", duration_min: 3, modality: "relational" },
      { name: "Parts Mapping Under Pressure", originator: "Schwartz", source: "IFS", file_ref: "04:68", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Kill Criteria",
      originator: "Duke",
      source_ref: "07:456",
      example: "If journal shows stalled decisions: set criteria NOW before emotional investment deepens. 'If ___ by ___, then ___.'",
    },
    micro_content: "Pattern awareness: 2-second lead. In high-stakes, everything. (Chamine; Kahneman.)",
    system_notes: "If Enneagram: type-specific stress patterns in professional contexts.",
    is_onboarding: false,
  },
  {
    day_number: 26,
    week_number: 4,
    title: "Values in Action",
    territory: "Values as decision tools, real tradeoffs, compromise vs self-betrayal",
    seed_prompts: [
      { prompt: "Which value overridden by financial pressure first?", purpose: "Identify vulnerability" },
      { prompt: "What to hear in an interview to know the company honors values?", purpose: "Detection criteria" },
      { prompt: "Compromise vs. self-betrayal?", purpose: "Boundary testing" },
    ],
    coaching_exercises: [
      {
        name: "Values Decision Framework",
        duration_min: 5,
        custom_framing: "Day 15 tested how your values hold under pressure. Today you build a reusable decision-making tool. For each of your top 3 values, write detection criteria: 'I'll know a role/company honors this value when I see/hear ___.' Then write red flags: 'I'll know it violates this value when I see/hear ___.' Be specific — not 'they value autonomy' but 'they describe outcomes, not hours. The manager talks about trust, not oversight.' Finally, write your decision rule: 'If an opportunity clearly violates my top value, I will ___. If it honors two but not the third, I will ___.' This framework is your anchor for real job evaluations. Decisions made in the emotional fog of a job search rarely reflect your actual values — this keeps you grounded.",
      },
    ],
    overflow_defaults: [
      { name: "CBA", originator: "SMART Recovery", source: "SMART Recovery", file_ref: "01:420", duration_min: 5, modality: "cognitive" },
      { name: "Opposite Action", originator: "Linehan", source: "DBT", file_ref: "07:295", duration_min: 3, modality: "somatic" },
      { name: "Safe/Calm Place", originator: "EMDR self-use", source: "EMDR", file_ref: "07:619", duration_min: 5, modality: "somatic" },
      { name: "Boundary Sentence", originator: "Linehan", source: "DBT", file_ref: "02:367", duration_min: 1, modality: "relational" },
      { name: "Full-Body Yes Check", originator: "Midlife/Transition", source: "Transition", file_ref: "11:156", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Hendricks Zone of Genius",
      originator: "Hendricks",
      source_ref: "07:375",
      example: "If journal shows settling: Incompetence > Competence > Excellence > Genius. Are you optimizing for Excellence because it's safe while Genius calls for risk?",
    },
    micro_content: "Values that collapse under first pressure were preferences. (SMART Recovery; CTI.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 27,
    week_number: 4,
    title: "Narrative Rehearsal",
    territory: "Story in context, three versions for three audiences, embodied telling",
    seed_prompts: [
      { prompt: "Say story out loud. Body?", purpose: "Somatic test" },
      { prompt: "Where saboteur? Where you?", purpose: "Distinguish voice sources" },
      { prompt: "If someone told you this about themselves?", purpose: "Compassion lens" },
    ],
    coaching_exercises: [
      {
        name: "Narrative Rehearsal",
        duration_min: 5,
        custom_framing: "Day 20 wrote the story. Today you make it usable by practicing it in three real-world contexts. Your Day 20 narrative will appear at the top so you can see your own words. Then write three versions: (1) THE NETWORKING VERSION — someone at a professional event asks 'So what are you up to these days?' Write your 30-second answer. Keep it natural. (2) THE INTERVIEW VERSION — a hiring manager says 'Tell me about your transition.' This version needs to be honest but forward-looking. (3) THE CLOSE FRIEND VERSION — a friend asks 'How are you really doing?' This one can be vulnerable. After writing all three, compare them: the networking version should feel easy (if it doesn't, it's overloaded). The interview version should feel true (if it doesn't, you're performing). The friend version should feel like relief (if it doesn't, you're still protecting something). Then say the networking version out loud. A narrative that doesn't cost energy to maintain is one that adapts to context without losing authenticity (Herminia Ibarra, INSEAD).",
      },
    ],
    overflow_defaults: [
      { name: "Behavioral Experiment", originator: "CBT", source: "CBT", file_ref: "07:938", duration_min: 5, modality: "cognitive" },
      { name: "RAIN", originator: "Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 3, modality: "somatic" },
      { name: "Butterfly Hug", originator: "EMDR self-use", source: "EMDR", file_ref: "07:665", duration_min: 3, modality: "somatic" },
      { name: "XYZ Formula", originator: "Gottman", source: "Gottman", file_ref: "02:300", duration_min: 2, modality: "relational" },
      { name: "Knowing-Doing Gap", originator: "Integrative", source: "Integrative", file_ref: "04:1230", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Ecker Reconsolidation",
      originator: "Ecker/Nader",
      source_ref: "07:418",
      example: "If old emotional intensity activates when telling story: stay somatic. Feel old feeling AND contradiction simultaneously. Both must be felt. Cognitive reframe alone doesn't reconsolidate.",
    },
    micro_content: "Goal: narrative that does not cost energy to maintain. (Ibarra; Bradford.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 28,
    week_number: 4,
    title: "What's Still Unresolved",
    territory: "Open threads, active grief, sticky beliefs, practical needs",
    seed_prompts: [
      { prompt: "Still unresolved? No judgment.", purpose: "Inventory open threads" },
      { prompt: "Which thread needs professional support?", purpose: "Referral consideration" },
      { prompt: "What from this program will you keep? Realistic.", purpose: "Sustainable practice" },
    ],
    coaching_exercises: [
      {
        name: "Open Threads Inventory",
        duration_min: 5,
        custom_framing: "Not everything gets resolved in 30 days — and pretending it does would be dishonest. This exercise asks you to take an honest inventory of what's still unfinished. Write down everything that remains unresolved, without judgment. This might include: active grief that hasn't fully processed, beliefs about yourself that you've identified but haven't been able to shift, practical concerns like finances or job search progress, relationships that are still strained, or fears that persist despite everything you've worked on. For each item, note whether it needs more time, more support (like a therapist or coach), or a specific action you've been avoiding. The point isn't to feel bad about what's still open — it's to make the invisible visible. Unresolved things that lurk in the background drain more energy than ones you've named and acknowledged.",
      },
    ],
    overflow_defaults: [
      { name: "Exception Finding", originator: "de Shazer", source: "SFBT", file_ref: "01:386", duration_min: 3, modality: "cognitive" },
      { name: "Emotion Labeling", originator: "Lieberman/Barrett", source: "Affective Neuroscience", file_ref: "01:194", duration_min: 2, modality: "cognitive" },
      { name: "Three-Minute Breathing Space", originator: "MBCT", source: "MBCT", file_ref: "07:515", duration_min: 3, modality: "somatic" },
      { name: "Support Mapping", originator: "Relational", source: "Relational", file_ref: "", duration_min: 3, modality: "relational" },
      { name: "Continuing Practice Design", originator: "IFS + ACT", source: "IFS/ACT", file_ref: "", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Bridges Three Phases Final",
      originator: "Bridges",
      source_ref: "07:80",
      example: "For each open thread: still Ending? Neutral Zone? New Beginning? Different interventions for each. Don't rush End. Don't flee Neutral.",
    },
    micro_content: "Closure overrated. Question: tools to keep processing without being consumed. (Bridges; Boss.)",
    system_notes: "",
    is_onboarding: false,
  },
  {
    day_number: 29,
    week_number: 4,
    title: "Full Review",
    territory: "30-day summary, letter to future self, meaning-making",
    seed_prompts: [
      { prompt: "What do you want to remember about this time?", purpose: "Memory selection" },
      { prompt: "What commitment are you making to yourself?", purpose: "Forward commitment" },
      { prompt: "What surprised you most about yourself these 30 days?", purpose: "Self-discovery" },
    ],
    coaching_exercises: [
      {
        name: "Letter to Future Self",
        duration_min: 5,
        custom_framing: "You'll receive a summary of your 30-day journey — the themes that emerged, the shifts that happened, the patterns you identified, and the work that remains. Read through it carefully. Where does it ring true? Where does it miss something important? Add your own notes and corrections — this is your experience, and you know it best. Then write a letter to yourself, dated 90 days from now. Tell your future self what you've learned, what you want to remember, what commitments you're making, and what you hope will be different by then. Be honest and specific — not aspirational fluff, but real promises grounded in what you now know about yourself. This letter becomes an anchor point. When the clarity of this process fades (and it will), you'll have something written by the version of you who did the work.",
      },
    ],
    overflow_defaults: [
      { name: "Meaning-Making", originator: "Frankl", source: "Logotherapy", file_ref: "01:544", duration_min: 5, modality: "cognitive" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "Savoring Practice", originator: "Somatic/Positive Psych", source: "Positive Psychology", file_ref: "03:593", duration_min: 3, modality: "somatic" },
      { name: "Relational Gratitude Loop", originator: "Systems coaching", source: "Relational", file_ref: "02:588", duration_min: 2, modality: "relational" },
      { name: "Sailboat Exercise", originator: "Midlife/Transition", source: "Transition", file_ref: "11:109", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Erikson Generativity",
      originator: "Erikson",
      source_ref: "07:28",
      example: "What contribution now that wasn't possible before?",
    },
    micro_content: "Review, annotate, commit. Not closure — continuation with awareness.",
    system_notes: "System generates 30-day summary before this session.",
    is_onboarding: false,
  },
  {
    day_number: 30,
    week_number: 4,
    title: "Where You Are",
    territory: "One sentence, present placement, completion",
    seed_prompts: [
      { prompt: "One sentence. Where you are today.", purpose: "Crystallize" },
      { prompt: "Not where you wish. Not where you should be.", purpose: "Radical honesty" },
      { prompt: "Where you actually are.", purpose: "Acceptance" },
    ],
    coaching_exercises: [
      {
        name: "One Sentence",
        duration_min: 3,
        custom_framing: "This is the final exercise. Complete one sentence: 'After 30 days of doing this work, what I know is: ___.' Not 'where I am' — that's too vague. Not 'how I feel' — that's too transient. What you know. Knowledge implies something earned — a conviction, a truth, a clarity that wasn't there before. You'll see your Day 1 response to 'What is true about your situation right now?' displayed alongside your answer, so you can see where you started. Read your sentence back. Does it feel earned? If it sounds like something you could have said on Day 1, dig deeper. If it surprises you, that's the sentence.",
      },
    ],
    overflow_defaults: [
      { name: "Scaling Questions", originator: "de Shazer", source: "SFBT", file_ref: "01:374", duration_min: 2, modality: "cognitive" },
      { name: "Radical Acceptance", originator: "Linehan", source: "DBT", file_ref: "04:302", duration_min: 3, modality: "integrative" },
      { name: "Full-Body Yes Check", originator: "Midlife/Transition", source: "Transition", file_ref: "11:156", duration_min: 2, modality: "somatic" },
      { name: "Vulnerability Loop", originator: "Bradford & Robin", source: "IPD", file_ref: "02:206", duration_min: 3, modality: "relational" },
      { name: "Inner Compass Check-In", originator: "Midlife/Transition", source: "Transition", file_ref: "11:169", duration_min: 3, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Completion",
      originator: "Program",
      source_ref: "",
      example: "Goals active: program continues. Goals done: new package, $39/month continuation, or exit with full data export.",
    },
    micro_content: "After Day 30: goals still active = program continues. Goals done = new package, $39/month continuation, or exit with full data export.",
    system_notes: "After Day 30: goals active = continues. Goals done = new package, $39/mo, or exit with data.",
    is_onboarding: false,
  },
];

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Seeding PARACHUTE program + 30 program days...");
  console.log("═══════════════════════════════════════════════════\n");

  // Step 1: Upsert the program
  console.log("1. Upserting PARACHUTE program...");
  const { data: program, error: progError } = await supabase
    .from("programs")
    .upsert(PARACHUTE_PROGRAM, { onConflict: "slug" })
    .select()
    .single();

  if (progError) {
    console.error("  ✗ Failed to upsert program:", progError.message);
    process.exit(1);
  }
  console.log(`  ✓ Program "${program.name}" (${program.id})\n`);

  // Step 2: Insert all 30 days
  console.log("2. Inserting program days...\n");
  let inserted = 0;
  let failed = 0;

  for (const day of days) {
    const { error: dayError } = await supabase.from("program_days").upsert(
      {
        program_id: program.id,
        day_number: day.day_number,
        week_number: day.week_number,
        title: day.title,
        territory: day.territory,
        seed_prompts: day.seed_prompts,
        coaching_exercises: day.coaching_exercises,
        overflow_defaults: day.overflow_defaults,
        framework_analysis_default: day.framework_analysis_default,
        micro_content: day.micro_content,
        system_notes: day.system_notes,
        is_onboarding: day.is_onboarding,
      },
      { onConflict: "program_id,day_number" }
    );

    if (dayError) {
      console.warn(
        `  ✗ Day ${day.day_number} (${day.title}): ${dayError.message}`
      );
      failed++;
    } else {
      console.log(
        `  ✓ Day ${day.day_number}: ${day.title}${day.is_onboarding ? " [onboarding]" : ""}`
      );
      inserted++;
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Program:    ${program.name} (${program.slug})`);
  console.log(`  Total days: ${days.length}`);
  console.log(`  Inserted:   ${inserted}`);
  console.log(`  Failed:     ${failed}`);
  console.log("═══════════════════════════════════════════════════");
}

main().catch(console.error);
