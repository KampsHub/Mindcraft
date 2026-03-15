/**
 * Seed JETSTREAM (performance_plan) program + all 30 program_days into Supabase.
 *
 * Run: npx tsx scripts/seed-jetstream-program.ts
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

const JETSTREAM_PROGRAM = {
  slug: "performance_plan",
  name: "JETSTREAM",
  tagline: "A 30-Day Program for Navigating a Performance Improvement Plan",
  description:
    "JETSTREAM is a 30-day container for managing what is happening to you right now while also processing what it is doing to you internally. Designed for tech professionals who need to perform under pressure during the day and cannot afford to fall apart — but who also cannot afford to suppress everything indefinitely. Stay clear-headed during a period that actively works against clarity.",
  duration_days: 30,
  weekly_themes: [
    {
      week: 1,
      name: "LAND",
      title: "Get Honest About What Is Actually Happening",
      territory:
        "Process the shock, shame, and hypervigilance that come with a PIP. Honestly assess what the PIP says and what it means. Identify your saboteurs and start tracking them in real time. Stabilize your nervous system while continuing to work.",
    },
    {
      week: 2,
      name: "STEADY",
      title: "Communicate Clearly and Think Strategically",
      territory:
        "Learn to speak from center under evaluation pressure. Understand how stress is affecting your relationships at home and at work. Manage the manager relationship with intention. Assess your options and face the decision you may be avoiding.",
    },
    {
      week: 3,
      name: "BUILD",
      title: "Rebuild Competence and Set Boundaries",
      territory:
        "Test the PIP's competence claims against reality and cognitive distortions. Define what you will and will not do to meet this PIP. Run both tracks — performing and preparing — with intention. Build self-efficacy that does not depend on one manager's evaluation.",
    },
    {
      week: 4,
      name: "ORIENT",
      title: "Understand What This Activated and Choose What Comes Next",
      territory:
        "Revisit the seven disruptions with fresh perspective. Go deeper on the patterns this crisis revealed. Pressure-test your decisions under simulated conditions. Build a sustainable forward practice and name what remains unresolved.",
    },
  ],
  intake_config: {
    pre_start_questions: [
      {
        id: "pip_timeline",
        question: "When was the PIP issued? What is the formal duration?",
        type: "textarea",
      },
      {
        id: "pip_reasons",
        question:
          "What are the stated reasons on the PIP document? Be as specific as you can.",
        type: "textarea",
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
          "Psychological Safety at Work",
          "Sense of Competence",
          "Professional Identity",
          "Financial Security",
          "Trust in the System",
          "Relational Stability",
          "Future Clarity",
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
  seed_prompts: { prompt: string; purpose: string }[];
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

const DAYS: ProgramDay[] = [
  // ══════════════════════════════════════════════════════════════
  //  WEEK 1 — LAND: What Is Actually Happening
  // ══════════════════════════════════════════════════════════════
  {
    day_number: 1,
    week_number: 1,
    title: "Arrival",
    territory: "Honest baseline. Seven disruptions inventory. Establishing daily practice.",
    seed_prompts: [
      {
        prompt: "What is true about your situation right now? Not what might happen. What is actually true today.",
        purpose: "Ground in present reality rather than catastrophic projection",
      },
      {
        prompt: "Which of the seven disruptions is loudest right now?",
        purpose: "Direct attention to the most activated disruption",
      },
      {
        prompt: "What has been your default response since the PIP landed — and what has it cost you?",
        purpose: "Surface the automatic response pattern for later saboteur work",
      },
    ],
    coaching_exercises: [
      {
        name: "Seven Disruptions Inventory (PIP)",
        duration_min: 5,
        custom_framing:
          "A performance improvement plan doesn't just affect your work — it disrupts multiple parts of your life at once. We call these the 'seven disruptions.' Rate each one from 1 (barely affected) to 10 (strongly affected): Psychological safety at work (do you feel safe to speak up?), Sense of competence (do you still trust your abilities?), Professional identity (has how you see yourself at work shifted?), Financial security, Trust in the system (do you believe the process is fair?), Relational stability (how is this affecting your relationships?), Future clarity (can you see a path forward?). This is your honest starting point.",
      },
    ],
    overflow_defaults: [
      {
        name: "Body Scan + Grounding",
        originator: "Jon Kabat-Zinn",
        source: "Full Catastrophe Living (1990)",
        file_ref: "common:body_scan",
        duration_min: 10,
        modality: "somatic",
      },
    ],
    framework_analysis_default: {
      name: "Polyvagal Theory — Threat Response",
      originator: "Stephen Porges / Deb Dana",
      source_ref: "The Polyvagal Theory in Therapy (2018)",
      example:
        "The PIP activated your threat detection system. Hypervigilance, difficulty focusing, scanning every interaction for meaning — these are predictable nervous system responses, not character flaws.",
    },
    micro_content:
      "The seven disruptions and why a PIP hits harder than most people expect. You are not managing one problem. You are managing seven simultaneous disruptions to your sense of self, safety, and competence.",
    system_notes:
      "Day 1 onboarding. Step 1 draws from intake data since there is no prior journal. Barrier low. The inventory is concrete and structured.",
    is_onboarding: true,
  },
  {
    day_number: 2,
    week_number: 1,
    title: "The Patterns That Showed Up First",
    territory: "Saboteur identification. Stress-response direction. Pattern recognition.",
    seed_prompts: [
      {
        prompt: "Since the PIP landed, what has been your default move? Overwork? Withdrawal? Compliance? Defiance? Frantic job searching? Paralysis?",
        purpose: "Name the automatic response without judgment",
      },
      {
        prompt: "What does your harshest internal voice say about this PIP? Write its exact words.",
        purpose: "Externalize the saboteur's narrative for later work",
      },
    ],
    coaching_exercises: [
      {
        name: "Saboteur Identification (PIP-Specific)",
        duration_min: 5,
        custom_framing:
          "Under stress, we all develop automatic protection strategies — patterns that once helped us cope but can now work against us. In coaching, these are called 'saboteurs.' Common ones include: the Pleaser (says yes to everything to avoid conflict), the Hyper-Achiever (works nonstop to prove worth), the Controller (micromanages to feel safe), the Victim (feels powerless and stuck), the Hyper-Vigilant (scans constantly for threats), and the Avoider (procrastinates or withdraws from hard conversations).\n\nWhich 2-3 of these sound most like you since the PIP? For each one: what does it tell you to do? When does it get loudest? And what is it trying to protect you from? Also notice your overall stress direction: do you move toward people (please, accommodate), push against them (control, argue), or pull away (withdraw, avoid)?",
      },
    ],
    overflow_defaults: [
      {
        name: "4-7-8 Breathing",
        originator: "Andrew Weil",
        source: "Pranayama breathing practices",
        file_ref: "common:breathing_478",
        duration_min: 5,
        modality: "somatic",
      },
    ],
    framework_analysis_default: {
      name: "Positive Intelligence — Saboteur Framework",
      originator: "Shirzad Chamine",
      source_ref: "Positive Intelligence (2012)",
      example:
        "The Pleaser agrees to unrealistic timelines to avoid conflict. The Hyper-Achiever works 80-hour weeks to prove the PIP wrong. The Avoider stops opening emails from HR. Each is a protection strategy that was adaptive somewhere else.",
    },
    micro_content:
      "Saboteurs are not character flaws. They are protection strategies that were adaptive at some earlier point. Under a PIP, they activate with full force because the perceived threat is real.",
    system_notes:
      "Saboteur work placed on Day 2 because PIP clients' saboteurs are already driving behavior at work. Pattern recognition needs to start before their next manager check-in.",
    is_onboarding: true,
  },
  {
    day_number: 3,
    week_number: 1,
    title: "Tracking the Saboteur in Real Time",
    territory: "Saboteur log introduction. Real-time pattern tracking.",
    seed_prompts: [
      {
        prompt: "Between yesterday and today, when did one of your saboteurs show up? Be specific: the moment, the trigger, what it made you do or avoid.",
        purpose: "Move from identification to real-time tracking",
      },
      {
        prompt: "What would have happened if you had caught that saboteur in the moment?",
        purpose: "Build the gap between trigger and response",
      },
    ],
    coaching_exercises: [
      {
        name: "The Saboteur Log",
        duration_min: 5,
        custom_framing:
          "Now that you know your saboteur patterns, the next step is catching them in real time. Think of this as a simple log you'll keep throughout the program. When you notice a saboteur showing up, write down: (1) What triggered it — the specific moment or situation, (2) Which saboteur activated — e.g., the Pleaser, the Controller, (3) What it said — the exact internal dialogue, (4) What you did — the action or avoidance it led to, (5) What you felt in your body — tension, racing heart, numbness, (6) What you would do differently with awareness.\n\nThe goal isn't to stop the pattern instantly. It's to create a small gap between the trigger and your reaction. That gap is where you start to have a choice.",
      },
    ],
    overflow_defaults: [
      {
        name: "What's In My Control Audit",
        originator: "Stephen Covey",
        source: "The 7 Habits of Highly Effective People (1989)",
        file_ref: "common:control_audit",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Mindsight — The Space Between",
      originator: "Dan Siegel",
      source_ref: "Mindsight (2010)",
      example:
        "Noticing a pattern does not stop it. But it does create a gap — however small — between the trigger and the response. That gap is where choice lives.",
    },
    micro_content:
      "Noticing a pattern does not stop it. But it does create a gap — however small — between the trigger and the response. That gap is where choice lives. The saboteur log is how you widen it.",
    system_notes:
      "Day 3 onboarding. The log is ongoing — not a one-time exercise. Emphasize that the tracking itself is the intervention.",
    is_onboarding: true,
  },
  {
    day_number: 4,
    week_number: 1,
    title: "What the PIP Actually Says",
    territory: "Separating the document from the story. Cognitive clarity.",
    seed_prompts: [
      {
        prompt: "Read the PIP document again. What does it actually say? Not what it implies. The words on the page.",
        purpose: "Force separation of document from emotional interpretation",
      },
      {
        prompt: "Where is it specific? Where is it vague? What is measurable and what is subjective?",
        purpose: "Identify actionable vs. interpretive elements",
      },
    ],
    coaching_exercises: [
      {
        name: "Document vs. Story",
        duration_min: 5,
        custom_framing:
          "When we're under threat, our brain automatically adds meaning to what we read — turning neutral words into verdicts. This exercise helps you separate what the PIP document actually says from the narrative your mind has layered on top. Draw two columns on a page. In column one, copy the exact words from the PIP document — no paraphrasing, just what it literally says. In column two, write the story you have added: the interpretations, the worst-case assumptions, the mind-reading about your manager's intent, the catastrophizing about what it means for your future. Then look at column two and ask yourself: which of your saboteur patterns (from Day 2) wrote that story? The Hyper-Vigilant scanning for hidden threats? The Victim deciding it is hopeless? Seeing the gap between the document and your story is where you start to get your clarity back.",
      },
    ],
    overflow_defaults: [
      {
        name: "Worst-Case Scenario Mapping",
        originator: "David Burns",
        source: "Feeling Good (1980)",
        file_ref: "common:worst_case",
        duration_min: 15,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Cognitive Distortions — Observation vs. Evaluation",
      originator: "David Burns / Marshall Rosenberg",
      source_ref: "Feeling Good (1980); NVC (2003)",
      example:
        "The difference between what the PIP says and what you hear when you read it. The document is a set of assertions. Your nervous system has turned it into a verdict.",
    },
    micro_content:
      "The difference between what the PIP says and what you hear when you read it. The document is a set of assertions. Your nervous system has turned it into a verdict.",
    system_notes:
      "Requires the client to have access to their PIP document. The two-column exercise is the core intervention.",
    is_onboarding: false,
  },
  {
    day_number: 5,
    week_number: 1,
    title: "The Honest Self-Assessment",
    territory: "Sorting feedback. Valid vs. political vs. cannot tell.",
    seed_prompts: [
      {
        prompt: "Set aside the PIP for a moment. If you were writing your own performance review — the honest one, not the political one — what would it say?",
        purpose: "Access honest self-assessment outside the PIP frame",
      },
      {
        prompt: "Where were you genuinely struggling before the PIP? Where were you doing well that the PIP does not acknowledge?",
        purpose: "Separate actual performance from PIP framing",
      },
    ],
    coaching_exercises: [
      {
        name: "Three Columns (Valid / Political / Cannot Tell)",
        duration_min: 5,
        custom_framing:
          "Not all feedback on a PIP is equal. Some of it points to real areas where you can grow. Some of it reflects organizational politics — a manager's preferences, a reorg, a mismatch that has nothing to do with your abilities. And some of it sits in an uncomfortable middle where you genuinely cannot tell. This exercise asks you to sort every piece of PIP feedback into three columns. Column one — Valid: these are genuine development areas you can own honestly. Column two — Political: these reflect organizational dynamics, personality clashes, or systemic issues rather than your actual performance. Column three — Cannot Tell: this is where your self-protective instincts say one thing and your honest assessment says another. Column three is where the real work lives. Sit with those items. You do not need to resolve them today — just notice how hard it is to hold the ambiguity.",
      },
    ],
    overflow_defaults: [
      {
        name: "Cognitive Distortion Spot-Check",
        originator: "David Burns",
        source: "Feeling Good (1980)",
        file_ref: "common:distortion_check",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Cognitive Distortions Under Evaluation Threat",
      originator: "David Burns / Carol Dweck",
      source_ref: "Feeling Good (1980); Mindset (2006)",
      example:
        "Honest self-assessment during a PIP is exceptionally difficult because the PIP has contaminated the self-perception. Evaluation threat collapses self-assessment accuracy.",
    },
    micro_content:
      "Honest self-assessment during a PIP is exceptionally difficult because the PIP has contaminated the instrument. The three-column exercise resists binary thinking about feedback validity.",
    system_notes:
      "Hardest exercise in Week 1. The 'cannot tell' column is the distinguishing feature. Do not push the client toward either validation or accountability — hold the ambiguity.",
    is_onboarding: false,
  },
  {
    day_number: 6,
    week_number: 1,
    title: "The Strategic Landscape",
    territory: "Political mapping. Allies, advocates, adversaries. Survivability assessment.",
    seed_prompts: [
      {
        prompt: "Who at work knows about the PIP? Who do you trust? Are those the same people?",
        purpose: "Map the relational landscape under threat",
      },
      {
        prompt: "What signals are you reading from your manager, your skip-level, your peers? Which are data and which are projection?",
        purpose: "Separate signal from noise in workplace dynamics",
      },
    ],
    coaching_exercises: [
      {
        name: "Reading the Room",
        duration_min: 5,
        custom_framing:
          "A PIP does not happen in a vacuum — there are people, incentives, and organizational dynamics behind it. This exercise helps you map the political landscape so you can make strategic decisions instead of reactive ones. Work through the following: (1) Who initiated the PIP, and who approved it? (2) What is your manager's likely incentive — are they genuinely trying to develop you, or is this a managed exit? Look at their behavior, not their words. (3) What signals is HR sending — supportive, procedural, or absent? (4) Who are your advocates — people who would speak positively about your work if asked? List them. (5) Based on all of this, what is your honest estimate of the probability that this PIP is survivable? Now apply your saboteur lens to that estimate: is the Hyper-Vigilant making it seem worse than it is? Is the Avoider making it seem more hopeful than the evidence supports? The goal is not optimism or pessimism — it is accuracy.",
      },
    ],
    overflow_defaults: [
      {
        name: "Ally Mapping",
        originator: "All Minds on Deck",
        source: "JETSTREAM Program",
        file_ref: "jetstream:ally_mapping",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Strategic Navigation Under Asymmetric Power",
      originator: "Jeffrey Pfeffer",
      source_ref: "Power: Why Some People Have It and Others Don't (2010)",
      example:
        "Most people on a PIP default to full compliance or full resistance. Both are reactive. Strategic navigation requires reading the actual landscape, not the one your saboteur has constructed.",
    },
    micro_content:
      "Most people on a PIP default to one of two strategies: full compliance or full resistance. Both are reactive. Strategic navigation means reading the landscape accurately enough to make real choices.",
    system_notes:
      "Strategic exercise. The survivability assessment is confrontational by design — it surfaces whether the client is in denial or catastrophizing.",
    is_onboarding: false,
  },
  {
    day_number: 7,
    week_number: 1,
    title: "The Regulation Toolkit",
    territory: "Somatic regulation for the workplace. Integrating saboteur log with body signals.",
    seed_prompts: [
      {
        prompt: "Review your saboteur log from this week. How many activations did you catch? How many did you catch in real time vs. after the fact?",
        purpose: "Review Week 1 tracking data",
      },
      {
        prompt: "Where did you lose regulation this week — specific moment, specific meeting, specific email?",
        purpose: "Identify regulation failure points for toolkit design",
      },
    ],
    coaching_exercises: [
      {
        name: "Building Your Workday Toolkit (PIP-Specific)",
        duration_min: 3,
        custom_framing:
          "When you are on a PIP, your nervous system is on high alert all day — before meetings, during emails, even walking past your manager's desk. Regulation does not mean being calm. It means having quick, practical tools to get yourself back to a state where you can think clearly and choose your response instead of reacting on autopilot. You are going to build three anchors, each under two minutes, that you can use at work without anyone noticing. (1) Pre-meeting grounding: before a check-in or stressful meeting, take 60 seconds — feet on the floor, slow exhale, name one thing you want to communicate clearly. (2) Between-meetings reset: after a hard interaction, step away if you can — bathroom, hallway, a glass of water — and do three slow breaths to discharge the activation before your next task. (3) End-of-day release: before you leave work or close the laptop, spend 90 seconds noticing what your body is carrying and consciously setting it down. The body signal you have been tracking in your saboteur log — tight chest, clenched jaw, shallow breathing — that is your cue to use one of these anchors.",
      },
    ],
    overflow_defaults: [
      {
        name: "Pre-Meeting Grounding Sequence",
        originator: "Deb Dana",
        source: "The Polyvagal Theory in Therapy (2018)",
        file_ref: "jetstream:pre_meeting",
        duration_min: 5,
        modality: "somatic",
      },
    ],
    framework_analysis_default: {
      name: "Polyvagal Regulation",
      originator: "Deb Dana / Peter Levine",
      source_ref: "The Polyvagal Theory in Therapy (2018); Waking the Tiger (1997)",
      example:
        "Regulation is not calm. It is the ability to choose your response instead of being hijacked by your stress response. The toolkit and the saboteur log are one system.",
    },
    micro_content:
      "Regulation is not calm. It is the ability to choose your response instead of being hijacked by your stress response. The toolkit and the saboteur practice are not separate. They are one system.",
    system_notes:
      "Week 1 closing. The body signal becomes the trigger for intervention. Tight chest before a check-in → 60-second grounding → name the saboteur → choose your response.",
    is_onboarding: false,
  },

  // ── Weekend: Days 8–9 ──
  {
    day_number: 8,
    week_number: 1,
    title: "Weekend Integration",
    territory: "Reflection. Saboteur log review. No new plan exercise.",
    seed_prompts: [
      {
        prompt: "Review your saboteur log. Any pattern you did not expect? Which saboteur surprised you by being louder than you thought?",
        purpose: "Weekend reflection on Week 1 patterns",
      },
    ],
    coaching_exercises: [],
    overflow_defaults: [
      {
        name: "Body Scan + Grounding",
        originator: "Jon Kabat-Zinn",
        source: "Full Catastrophe Living (1990)",
        file_ref: "common:body_scan",
        duration_min: 10,
        modality: "somatic",
      },
    ],
    framework_analysis_default: {
      name: "Pattern Recognition",
      originator: "Shirzad Chamine",
      source_ref: "Positive Intelligence (2012)",
      example: "The patterns you did not expect to see are often the most important ones.",
    },
    micro_content:
      "Why this program front-loads pattern recognition. You cannot manage a PIP strategically while your saboteurs are driving. The first week was about seeing them. The next three weeks are about what you do once you can.",
    system_notes: "Weekend day. Reduced structure. Steps 1-2 (themes + journal) still active. No new plan exercise.",
    is_onboarding: false,
  },
  {
    day_number: 9,
    week_number: 1,
    title: "Weekend Integration",
    territory: "Reflection. Manager communication preview.",
    seed_prompts: [
      {
        prompt: "If you could tell your manager one thing with no consequences, what would it be? Notice which saboteur edits that statement before you finish writing it.",
        purpose: "Preview Week 2 communication work",
      },
    ],
    coaching_exercises: [],
    overflow_defaults: [
      {
        name: "Unsent Letter",
        originator: "Harriet Lerner",
        source: "The Dance of Anger (1985)",
        file_ref: "common:unsent_letter",
        duration_min: 20,
        modality: "integrative",
      },
    ],
    framework_analysis_default: {
      name: "Emotional Expression Under Constraint",
      originator: "Harriet Lerner",
      source_ref: "The Dance of Anger (1985)",
      example: "The things you cannot say at work still need somewhere to go.",
    },
    micro_content:
      "Why this program front-loads pattern recognition. You cannot manage a PIP strategically while your saboteurs are driving. The first week was about seeing them.",
    system_notes: "Weekend day. Reduced structure. Previews Week 2 communication focus.",
    is_onboarding: false,
  },

  // ══════════════════════════════════════════════════════════════
  //  WEEK 2 — STEADY: Communication, Relationships, Strategic Clarity
  // ══════════════════════════════════════════════════════════════
  {
    day_number: 10,
    week_number: 2,
    title: "How You Communicate Under Threat",
    territory: "NVC introduction. Communication distortion under evaluation pressure.",
    seed_prompts: [
      {
        prompt: "How do you communicate when you feel safe vs. when you feel evaluated? What changes — tone, volume, word choice, how much you talk, how much you listen?",
        purpose: "Surface communication shifts under threat",
      },
      {
        prompt: "In your PIP check-ins, what are you actually saying vs. what you want to say vs. what you think they want to hear?",
        purpose: "Map the three-way gap in evaluated communication",
      },
    ],
    coaching_exercises: [
      {
        name: "Communication Under Pressure — Part 1: Observation",
        duration_min: 5,
        custom_framing:
          "When we feel evaluated or threatened, the way we communicate changes — often without us realizing it. We over-explain, get defensive, go silent, or say what we think the other person wants to hear instead of what is true. There is a communication framework called Nonviolent Communication (NVC), developed by psychologist Marshall Rosenberg, that breaks any interaction into four simple parts: (1) Observation — what actually happened, stated as a fact without judgment, (2) Feeling — the emotion it brought up in you, (3) Need — what you needed in that moment, (4) Request — what you actually asked for, if anything. Take three recent PIP-related interactions — a check-in with your manager, a team meeting, an email exchange. For each one, write out those four parts. Then look at the gap between what you needed and what you actually said or did. That gap is where your saboteur patterns are running your communication. You do not need to fix anything yet. Just see the pattern.",
      },
    ],
    overflow_defaults: [
      {
        name: "NVC Self-Expression Practice",
        originator: "Marshall Rosenberg",
        source: "Nonviolent Communication (2003)",
        file_ref: "jetstream:nvc_practice",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Nonviolent Communication",
      originator: "Marshall Rosenberg",
      source_ref: "Nonviolent Communication: A Language of Life (2003)",
      example:
        "'My manager is undermining me' is an evaluation. 'My manager rescheduled our check-in twice without explanation' is an observation. The evaluation triggers your saboteur. The observation gives you something to work with.",
    },
    micro_content:
      "Most people on a PIP either over-communicate (proving, justifying, explaining) or under-communicate (withdrawing, complying silently). Both are saboteur-driven. Centered communication is neither.",
    system_notes:
      "Start of Week 2. NVC framework introduction. Monday placement ensures practice opportunities during the work week.",
    is_onboarding: false,
  },
  {
    day_number: 11,
    week_number: 2,
    title: "Centered Communication in Practice",
    territory: "NVC applied to PIP check-ins. Saboteur vs. centered version.",
    seed_prompts: [
      {
        prompt: "What do you actually need from your manager right now? Not what you wish they would do. What specific thing would help.",
        purpose: "Clarify the actual need underneath the noise",
      },
      {
        prompt: "If you said that directly, what would happen? Notice which saboteur answers that question.",
        purpose: "Surface the fear driving indirect communication",
      },
    ],
    coaching_exercises: [
      {
        name: "Communication Under Pressure — Part 2: The Check-In Plan",
        duration_min: 5,
        custom_framing:
          "Today you are going to prepare for your next PIP check-in using the four-part communication framework from yesterday. The goal is to walk into that meeting with something specific and centered to say, rather than defaulting to over-explaining or going quiet. Here is what to prepare: (1) One observation you want to share — a fact about your work or progress, stated without defense or apology. For example, 'I completed X and Y this week' rather than 'I know it is not enough but I tried to do X.' (2) One need you want to express — directly, not buried in qualifiers. For example, 'I need clearer metrics for what success looks like' rather than 'I guess it would be helpful if maybe we could talk about metrics.' (3) One request — specific and actionable. Something your manager can say yes or no to. Now write two versions side by side: the saboteur's version (what your automatic pattern would have you say) and the centered version (clear, direct, respectful). Then practice the centered version out loud. Hearing your own voice say these words changes how they land in the actual conversation.",
      },
    ],
    overflow_defaults: [
      {
        name: "Inner Mentor vs. Inner Critic",
        originator: "Tara Mohr",
        source: "Playing Big (2014)",
        file_ref: "jetstream:inner_mentor",
        duration_min: 15,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Playing Big — Inner Mentor",
      originator: "Tara Mohr",
      source_ref: "Playing Big (2014)",
      example:
        "Direct communication under a PIP is not insubordination. It is professionalism. Saying 'I need clearer metrics' is not defiance. It is how adults manage accountability.",
    },
    micro_content:
      "Direct communication under a PIP is not insubordination. It is professionalism. Saying 'I need clearer metrics' is not defiance. It is how adults manage accountability.",
    system_notes:
      "Practical application of Day 10's framework. The side-by-side writing (saboteur vs. centered) is the core technique.",
    is_onboarding: false,
  },
  {
    day_number: 12,
    week_number: 2,
    title: "How This Is Landing at Home",
    territory: "Gottman Four Horsemen. Stress-activated relational patterns.",
    seed_prompts: [
      {
        prompt: "How is this PIP showing up in your closest relationships? Not how you think it should be affecting them. How it actually is.",
        purpose: "Name the relational impact honestly",
      },
      {
        prompt: "When you walk through the door after a hard day, what happens in the first 10 minutes?",
        purpose: "Surface the specific relational pattern under stress",
      },
    ],
    coaching_exercises: [
      {
        name: "Stress Responses in Relationships",
        duration_min: 5,
        custom_framing:
          "Work stress does not stay at work. It follows you home and shows up in how you interact with the people closest to you. Relationship researcher John Gottman identified four destructive communication patterns he calls the 'Four Horsemen' — patterns that erode relationships over time, especially under sustained stress. They are: (1) Criticism — attacking someone's character instead of addressing a specific behavior ('You never listen' vs. 'I felt unheard when...'), (2) Contempt — expressing disgust or superiority through sarcasm, eye-rolling, or dismissiveness, (3) Defensiveness — deflecting responsibility instead of listening ('That's not my fault, you're the one who...'), (4) Stonewalling — shutting down completely, going silent, or emotionally checking out. Since the PIP started, which of these has been showing up in your closest relationships — with a partner, family member, or close friend? This applies regardless of your relationship status. Pick the one that resonates most and identify one small antidote you can practice this week. For criticism, try stating a specific need. For contempt, try expressing appreciation. For defensiveness, try taking ownership of even a small part. For stonewalling, try saying 'I need a break but I will come back to this.'",
      },
    ],
    overflow_defaults: [
      {
        name: "Repair Attempt Practice",
        originator: "John Gottman",
        source: "The Relationship Cure (2001)",
        file_ref: "jetstream:repair_attempt",
        duration_min: 15,
        modality: "relational",
      },
    ],
    framework_analysis_default: {
      name: "Gottman Four Horsemen",
      originator: "John Gottman / Nan Silver",
      source_ref: "The Seven Principles for Making Marriage Work (1999)",
      example:
        "Sustained work threat does not stay at work. Your nervous system does not clock out at 6pm. The irritability, withdrawal, or need for reassurance that shows up at home is the PIP's collateral damage.",
    },
    micro_content:
      "Sustained work threat does not stay at work. Your nervous system does not clock out at 6pm. The irritability, withdrawal, or need for reassurance at home is the PIP's collateral damage.",
    system_notes:
      "Relationship-agnostic by design. Single clients apply to friendships, family, colleagues.",
    is_onboarding: false,
  },
  {
    day_number: 13,
    week_number: 2,
    title: "Building Optionality",
    territory: "Four domains of leverage. Financial, legal, professional, relational.",
    seed_prompts: [
      {
        prompt: "How much of your compliance with the PIP is strategic and how much is driven by financial fear?",
        purpose: "Separate strategic compliance from fear-driven compliance",
      },
      {
        prompt: "If money were not a factor, would you still be trying to pass this PIP? Notice your honest answer.",
        purpose: "Surface the actual motivation beneath the compliance",
      },
    ],
    coaching_exercises: [
      {
        name: "The Optionality Audit",
        duration_min: 5,
        custom_framing:
          "When you feel trapped, you make fear-based decisions. When you know you have options, you make strategic ones. This is not a financial planning exercise — it is about understanding your leverage so you can approach the PIP from a position of choice rather than desperation. Map four domains of optionality: (1) Financial — how many months could you sustain yourself without this paycheck? Do you know what severance you would be entitled to? Identify one concrete action to strengthen this area (even something small like checking your savings balance). (2) Legal — do you know your rights as an employee on a PIP? Have you been documenting interactions? Have you considered whether a consultation with an employment lawyer would be useful? (3) Professional — is your resume current? Have you had any exploratory conversations with your network? What is your market value right now? (4) Relational — who is genuinely in your corner through this? Where do you feel isolated? Rate each domain from 1 (no optionality) to 10 (fully prepared). Then choose one small action per domain to take this week. The point is not to leave your job. The point is that knowing you could changes how you show up every day.",
      },
    ],
    overflow_defaults: [
      {
        name: "What's In My Control Audit",
        originator: "Stephen Covey",
        source: "The 7 Habits of Highly Effective People (1989)",
        file_ref: "common:control_audit",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Optionality as Leverage",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example:
        "People without options are compliant by default. People with options make strategic decisions. Optionality changes how you sit in every meeting.",
    },
    micro_content:
      "Optionality is not disloyalty. It is the precondition for making a genuine choice. A person who stays because they choose to sits differently in every meeting than a person who stays because they have no choice.",
    system_notes:
      "Framed as leverage, not financial planning. Different from PARACHUTE's Financial Ground Truth which addresses burn rate for someone without income.",
    is_onboarding: false,
  },
  {
    day_number: 14,
    week_number: 2,
    title: "The Decision You Are Avoiding",
    territory: "The fork: fight to stay vs. prepare to leave.",
    seed_prompts: [
      {
        prompt: "Are you fighting for this job because you want it, or because losing it feels like failure?",
        purpose: "Name the actual motivation beneath the decision",
      },
      {
        prompt: "If the answer is 'I do not know yet' — what would help you know?",
        purpose: "Identify what information would enable the decision",
      },
    ],
    coaching_exercises: [
      {
        name: "The Fork",
        duration_min: 5,
        custom_framing:
          "Most people on a PIP are quietly avoiding a decision. They are neither fully committing to meeting the PIP's requirements nor fully preparing for the possibility of leaving. This exercise asks you to name that fork in the road honestly. Write out both paths. Path A — Stay and meet the PIP: What would this actually require of you? What would it cost (energy, boundaries, self-respect)? What would it give you if it works? Path B — Prepare to leave: What would this require (job search, financial preparation, difficult conversations)? What would it cost (stability, identity, income)? What would it give you (freedom, a fresh start, relief)? Now apply your saboteur lens to both paths. Which saboteur is arguing for Path A — is the Pleaser keeping you compliant? Which is arguing for Path B — is the Avoider looking for escape? You do not need to choose right now. But you do need to stop pretending the fork is not there. Ask yourself: what specific information would help me make this decision with clarity? Make a plan to gather that information this week.",
      },
    ],
    overflow_defaults: [
      {
        name: "Signal vs. Noise Exercise",
        originator: "All Minds on Deck",
        source: "JETSTREAM Program",
        file_ref: "jetstream:signal_noise",
        duration_min: 15,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Decision-Making Under Threat",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example:
        "Refusing to choose is a choice — it just means someone else is making the decision for you on their timeline.",
    },
    micro_content:
      "Refusing to choose is a choice — it just means someone else is making the decision for you on their timeline. You do not need to commit to a path yet. You need to stop pretending the fork is not there.",
    system_notes:
      "Strategic heart of Week 2. The saboteur integration prevents this from becoming a pro/con list.",
    is_onboarding: false,
  },

  // ── Weekend: Days 15–16 ──
  {
    day_number: 15,
    week_number: 2,
    title: "Weekend Integration",
    territory: "Reflection. Communication changes. No new plan exercise.",
    seed_prompts: [
      {
        prompt: "Notice how your communication changes over the weekend when you are not performing for anyone. What is different about how you talk, listen, and ask for things?",
        purpose: "Contrast work communication with authentic communication",
      },
    ],
    coaching_exercises: [],
    overflow_defaults: [
      {
        name: "Attachment Style Under Stress",
        originator: "Amir Levine & Rachel Heller",
        source: "Attached (2010)",
        file_ref: "jetstream:attachment_stress",
        duration_min: 15,
        modality: "relational",
      },
    ],
    framework_analysis_default: {
      name: "Communication Under Pressure",
      originator: "Marshall Rosenberg",
      source_ref: "NVC (2003)",
      example: "The difference between managing a PIP from fear and managing it from clarity.",
    },
    micro_content:
      "The difference between managing a PIP from fear and managing it from clarity. Fear makes you reactive, compliant, or defiant. Clarity lets you choose. Both paths lead to action. One leads to action you can stand behind.",
    system_notes: "Weekend day. Reduced structure. No new plan exercise.",
    is_onboarding: false,
  },
  {
    day_number: 16,
    week_number: 2,
    title: "Weekend Integration",
    territory: "Reflection. Trust and truth.",
    seed_prompts: [
      {
        prompt: "If you trusted yourself completely right now, what would you do about this PIP? Not what is safe. What is true.",
        purpose: "Access intuitive knowing beneath strategic calculation",
      },
    ],
    coaching_exercises: [],
    overflow_defaults: [
      {
        name: "Four Horsemen Check-In",
        originator: "John Gottman",
        source: "The Seven Principles (1999)",
        file_ref: "jetstream:four_horsemen",
        duration_min: 15,
        modality: "relational",
      },
    ],
    framework_analysis_default: {
      name: "Self-Trust Under Evaluation",
      originator: "Susan David",
      source_ref: "Emotional Agility (2016)",
      example: "Your instincts under evaluation pressure are simultaneously more activated and less reliable.",
    },
    micro_content:
      "The difference between managing a PIP from fear and managing it from clarity. Fear makes you reactive. Clarity lets you choose.",
    system_notes: "Weekend day. Weekly check-in surfaces at end of this day.",
    is_onboarding: false,
  },

  // ══════════════════════════════════════════════════════════════
  //  WEEK 3 — BUILD: Competence, Boundaries, and the Dual Track
  // ══════════════════════════════════════════════════════════════
  {
    day_number: 17,
    week_number: 3,
    title: "The Competence Distortion",
    territory: "Cognitive distortions applied to PIP competence claims.",
    seed_prompts: [
      {
        prompt: "Since the PIP, how has your self-assessment of your own competence changed? Be specific.",
        purpose: "Surface the contamination of self-assessment by PIP",
      },
      {
        prompt: "Which professional capabilities do you trust less now than you did before the PIP? Is that because the PIP revealed something real, or because it contaminated your self-perception?",
        purpose: "Separate valid feedback from evaluation-threat distortion",
      },
    ],
    coaching_exercises: [
      {
        name: "Cognitive Distortion Audit on the PIP's Competence Claims",
        duration_min: 5,
        custom_framing:
          "When we are under threat, our thinking becomes systematically distorted. Psychologist David Burns identified common patterns — called cognitive distortions — where our mind bends reality in predictable ways, especially under stress. This exercise tests both the PIP's claims about you and your own self-assessment against five of these distortions: (1) Overgeneralization — turning one event into a universal truth ('I got this feedback' becomes 'I am bad at my job'), (2) Mental filter — focusing only on the negative and ignoring everything else, (3) Disqualifying the positive — dismissing your strengths or wins as 'not counting,' (4) Magnification/Minimization — making the bad stuff enormous and the good stuff tiny, (5) Labeling — replacing a specific behavior with a global identity statement ('I missed a deadline' becomes 'I am incompetent'). For each distortion, write two things: the distorted version (what your mind actually says) and the accurate version. Important: accurate does not mean positive. It means honest and proportional. The goal is not to talk yourself into feeling better. It is to see your situation clearly instead of through the distortion lens that the PIP activated.",
      },
    ],
    overflow_defaults: [
      {
        name: "Cognitive Distortion Spot-Check",
        originator: "David Burns",
        source: "Feeling Good (1980)",
        file_ref: "common:distortion_check",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Cognitive Distortions Under Evaluation",
      originator: "David Burns / Carol Dweck",
      source_ref: "Feeling Good (1980); Mindset (2006)",
      example:
        "A PIP says you underperformed on X. Your mind says: 'I am bad at everything.' That is overgeneralization. Evaluation threat systematically collapses self-assessment accuracy.",
    },
    micro_content:
      "The PIP is a document. Your self-assessment of competence is a different instrument entirely. When both instruments are distorted by the same threat response, neither produces accurate readings.",
    system_notes:
      "Replaces PARACHUTE's Evidence Collection. More rigorous — tests claims using cognitive framework rather than counter-listing achievements.",
    is_onboarding: false,
  },
  {
    day_number: 18,
    week_number: 3,
    title: "Saboteur Deepening — The Patterns at Work",
    territory: "Aggregated saboteur data. Professional and relational cost accounting.",
    seed_prompts: [
      {
        prompt: "After two and a half weeks of tracking, which saboteur pattern has been most persistent? Not the loudest. The most persistent — the one that runs even when things are relatively calm.",
        purpose: "Distinguish loudness from persistence in saboteur activation",
      },
      {
        prompt: "What has that pattern cost you professionally this month?",
        purpose: "Quantify the saboteur's real-world impact",
      },
    ],
    coaching_exercises: [
      {
        name: "The Saboteur's Professional Cost",
        duration_min: 5,
        custom_framing:
          "You have been tracking your saboteur patterns for over two weeks now. Today, step back and look at the bigger picture. Review your saboteur log entries from Weeks 1 and 2 and focus on your most persistent saboteur — the one that keeps showing up, not necessarily the loudest one but the most frequent. Answer four questions about it: (1) How often did it activate? Count the entries. Getting a real number makes the pattern harder to dismiss. (2) What has it cost you professionally? Be specific — did it make you agree to unrealistic timelines, avoid a conversation with your manager, over-prepare to the point of exhaustion, or withdraw from a meeting where your input was needed? (3) What has it cost you in your relationships? Has it made you irritable at home, emotionally unavailable, or unable to talk about what you are going through? (4) What is the payoff? This is the hardest question. Saboteur patterns persist because they protect us from something that feels even scarier than the cost. What is your saboteur protecting you from — rejection, incompetence, conflict, vulnerability? Understanding the payoff is not about forgiving the pattern. It is about seeing why it has so much power.",
      },
    ],
    overflow_defaults: [
      {
        name: "Saboteur Contingency Plan",
        originator: "Shirzad Chamine",
        source: "Positive Intelligence (2012)",
        file_ref: "jetstream:saboteur_contingency",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "IFS — Protector Parts",
      originator: "Jay Earley / Richard Schwartz",
      source_ref: "Self-Therapy (2009); IFS Therapy (1995)",
      example:
        "Saboteurs persist because they provide something — a sense of control, a reduction in anxiety, an avoidance of the thing that would actually help.",
    },
    micro_content:
      "Saboteurs persist because they provide something — a sense of control, a reduction in anxiety, an avoidance of the thing that would actually help. The cost accounting makes the tradeoff visible.",
    system_notes:
      "Deepening of Week 1 saboteur work with quantitative data. The cost framing makes the impact concrete rather than abstract.",
    is_onboarding: false,
  },
  {
    day_number: 19,
    week_number: 3,
    title: "Boundary Architecture",
    territory: "What you will and will not do. NVC-framed negotiation.",
    seed_prompts: [
      {
        prompt: "What have you agreed to since the PIP started that you would not have agreed to otherwise?",
        purpose: "Surface compliance patterns that cross boundaries",
      },
      {
        prompt: "Where is the line between meeting legitimate expectations and performing compliance?",
        purpose: "Distinguish real accountability from performative submission",
      },
    ],
    coaching_exercises: [
      {
        name: "Boundary Architecture (What You Will and Will Not Do)",
        duration_min: 5,
        custom_framing:
          "When you are on a PIP, there is enormous pressure to say yes to everything — to prove you are cooperative, coachable, and committed. But agreeing to everything without limits is not a strategy. It is a path to burnout that will undermine the very performance you are trying to demonstrate. This exercise asks you to sort the PIP's expectations into three categories. Category 1 — Will do: these are legitimate, actionable requirements that you can meet. Own them fully. Category 2 — Will do with a boundary: these are items that are vague, unrealistic, or need clarification before you can meaningfully act on them. For each one, write a negotiation statement using the communication framework from Days 10-11 — an observation, your need, and a specific request. For example: 'The PIP asks me to improve collaboration. I need clearer metrics for what that looks like. Can we define two or three specific behaviors you would like to see?' Category 3 — Will not do: these cross your ethical, personal, or professional lines. You do not need many items here, but knowing where the line is keeps you from being pushed past it. Practice saying your Category 2 statements out loud. Boundaries during a PIP are not defiance — they are what makes meeting the PIP sustainable.",
      },
    ],
    overflow_defaults: [
      {
        name: "Communication Style Under Stress Audit",
        originator: "All Minds on Deck",
        source: "JETSTREAM Program",
        file_ref: "jetstream:comm_stress_audit",
        duration_min: 15,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Boundaries Under Power Asymmetry",
      originator: "Henry Cloud & John Townsend / Harriet Lerner",
      source_ref: "Boundaries (1992); The Dance of Anger (1985)",
      example:
        "Boundaries during a PIP are not about defiance. They are about sustainability. If you meet the PIP by burning out, you have not passed the PIP. You have just delayed the crash.",
    },
    micro_content:
      "Boundaries during a PIP are not about defiance. They are about sustainability. If you meet the PIP by burning out, you have not passed — you have delayed the crash.",
    system_notes:
      "New exercise. PARACHUTE does not include boundary work because the boundary context does not exist post-layoff.",
    is_onboarding: false,
  },
  {
    day_number: 20,
    week_number: 3,
    title: "The Structural View",
    territory: "PIPs in organizational context. Structural vs. personal shame.",
    seed_prompts: [
      {
        prompt: "How much of this PIP is about your performance, and how much is about organizational dynamics you were caught inside?",
        purpose: "Locate the PIP in systemic context",
      },
      {
        prompt: "What would change if you knew the system, not you, was the primary variable?",
        purpose: "Test the effect of structural framing on shame",
      },
    ],
    coaching_exercises: [
      {
        name: "Perspective on Performance Culture and PIPs",
        duration_min: 5,
        custom_framing:
          "Up to now, the focus has been personal — your patterns, your communication, your boundaries. Today, step back and look at the bigger picture. A PIP is not just a personal event. It exists within an organizational system that uses PIPs for two very different purposes: genuinely developing someone's performance, or creating a paper trail for a managed exit. Most people on a PIP absorb all the shame personally, as if the PIP is entirely about their individual failings. But PIPs also happen inside organizational contexts — restructurings, budget cuts, management changes, shifting priorities, team reorganizations. Ask yourself: What was happening in the organization before and during your PIP? Were there reorgs, leadership changes, or headcount targets? Is your manager new, under pressure themselves, or managing you out for reasons beyond performance? This is not about letting yourself off the hook. It is about separating structural shame (the system's dynamics) from personal shame (your actual development areas). You already did that sorting work in the three-column exercise on Day 5. Today, go deeper on the structural side. Understanding the system does not make the PIP hurt less, but it does make the shame more accurate — and accurate shame is something you can work with.",
      },
    ],
    overflow_defaults: [
      {
        name: "Stress-Response Direction Check",
        originator: "Karen Horney / Bob Anderson",
        source: "Our Inner Conflicts (1945); Mastering Leadership (2016)",
        file_ref: "jetstream:stress_direction",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Psychological Safety and Organizational Systems",
      originator: "Amy Edmondson",
      source_ref: "The Fearless Organization (2019)",
      example:
        "The performance review system in most tech companies is not designed to develop people. It is designed to sort them. A PIP is the sorting mechanism made explicit.",
    },
    micro_content:
      "The performance review system in most tech companies is not designed to develop people. It is designed to sort them. A PIP is the sorting mechanism made explicit. Understanding that does not make it hurt less. It does make the shame less personal.",
    system_notes:
      "Similar to PARACHUTE's Structural View but PIP-specific framing.",
    is_onboarding: false,
  },
  {
    day_number: 21,
    week_number: 3,
    title: "The Dual Track in Practice",
    territory: "Status check on Track A (meet PIP) and Track B (optionality).",
    seed_prompts: [
      {
        prompt: "Where are you on Track A (meeting the PIP) vs. Track B (preparing for departure)?",
        purpose: "Honest dual-track status assessment",
      },
      {
        prompt: "Are you running both tracks, or have you quietly abandoned one?",
        purpose: "Surface implicit decisions being made by avoidance",
      },
    ],
    coaching_exercises: [
      {
        name: "Dual-Track Status Check",
        duration_min: 5,
        custom_framing:
          "Since Day 14, you have been holding two tracks at once — Track A (meeting the PIP) and Track B (preparing for the possibility of leaving). Today is a status check on both. For Track A, look at the PIP's specific requirements: deliverables, metrics, and behavioral changes. Where are you on track? Where are you behind? Be honest, not optimistic or catastrophic. For Track B, revisit the four domains of optionality from Day 13 — financial, legal, professional, and relational. Rate each from 1 to 10 in terms of your preparedness. Has anything improved since you first assessed them? Now connect this to your boundary work from Day 19: for the items you categorized as 'will do with a boundary,' have you actually had those negotiations? If not, what is stopping you? Finally, decide where your energy goes this week. You cannot run both tracks at full intensity forever. Which track needs more attention right now, and what is one concrete action you will take on each? Running a dual track is not disloyal to your employer. It is responsible adult behavior when the outcome is not entirely in your control.",
      },
    ],
    overflow_defaults: [
      {
        name: "Optionality Refresh",
        originator: "All Minds on Deck",
        source: "JETSTREAM Program",
        file_ref: "jetstream:optionality_refresh",
        duration_min: 15,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Dual-Track Strategy",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example:
        "Running a dual track is not disloyal. It is responsible. You can work in good faith to meet a PIP while acknowledging that the outcome is not entirely in your control.",
    },
    micro_content:
      "Running a dual track is not disloyal. It is responsible. You can work in good faith to meet a PIP while also acknowledging that the outcome is not entirely in your control.",
    system_notes: "Week 3 closing. Integrates optionality and boundary work.",
    is_onboarding: false,
  },

  // ── Weekend: Days 22–23 ──
  {
    day_number: 22,
    week_number: 3,
    title: "Weekend Integration",
    territory: "Communication reflection. No new plan exercise.",
    seed_prompts: [
      {
        prompt: "Notice your communication this weekend. Where are you centered? Where does the PIP version of you show up even when you are not at work?",
        purpose: "Observe PIP communication patterns leaking into personal life",
      },
    ],
    coaching_exercises: [],
    overflow_defaults: [
      {
        name: "Bid for Connection Audit",
        originator: "John Gottman",
        source: "The Relationship Cure (2001)",
        file_ref: "jetstream:bids_audit",
        duration_min: 10,
        modality: "relational",
      },
    ],
    framework_analysis_default: {
      name: "Communication Authenticity",
      originator: "Susan David",
      source_ref: "Emotional Agility (2016)",
      example: "The PIP version of you does not clock out at 6pm.",
    },
    micro_content:
      "The difference between a competence narrative contaminated by the PIP and one that holds the PIP's claims at accurate weight — no more, no less.",
    system_notes: "Weekend day. Reduced structure.",
    is_onboarding: false,
  },
  {
    day_number: 23,
    week_number: 3,
    title: "Weekend Integration",
    territory: "Competence reflection.",
    seed_prompts: [
      {
        prompt: "One thing you know to be true about your professional capability that no PIP can change. If you cannot answer that yet, sit with that.",
        purpose: "Access stable competence identity beneath PIP disruption",
      },
    ],
    coaching_exercises: [],
    overflow_defaults: [
      {
        name: "Cognitive Distortion Spot-Check",
        originator: "David Burns",
        source: "Feeling Good (1980)",
        file_ref: "common:distortion_check",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Competence Identity",
      originator: "David Burns",
      source_ref: "Feeling Good (1980)",
      example: "The cognitive distortion work is not a one-time exercise. It is a practice of accuracy.",
    },
    micro_content:
      "The difference between a competence narrative contaminated by the PIP and one that holds the PIP's claims at accurate weight. The cognitive distortion work is a practice, not a one-time exercise.",
    system_notes: "Weekend day. Reduced structure.",
    is_onboarding: false,
  },

  // ══════════════════════════════════════════════════════════════
  //  WEEK 4 — ORIENT: What This Activated and What Comes Next
  // ══════════════════════════════════════════════════════════════
  {
    day_number: 24,
    week_number: 4,
    title: "The Seven Disruptions — Revisited",
    territory: "Reassessment. Same instrument, three weeks of context.",
    seed_prompts: [
      {
        prompt: "Day 1 ratings vs. today. What changed?",
        purpose: "Direct comparison with baseline",
      },
      {
        prompt: "Which disruption are you more at peace with than expected? Which still has its hooks in you?",
        purpose: "Identify resolved vs. persistent disruptions",
      },
    ],
    coaching_exercises: [
      {
        name: "Reassessment",
        duration_min: 5,
        custom_framing:
          "On Day 1, you rated seven areas of your life that the PIP disrupted — psychological safety, sense of competence, professional identity, financial security, trust in the system, relational stability, and future clarity. Three weeks have passed. Today, you are going to rate each one again using the same 1-to-10 scale. Then compare your Day 1 ratings with today's. Where did the number go down (meaning that disruption feels less intense)? Where did it stay the same or go up? Do not judge the results. Some disruptions resolve with awareness and action. Others deepen as you get more honest with yourself. Both are valid data. The point of this reassessment is not to prove progress. It is to see clearly where you are — what has shifted, what has not, and where your attention needs to go in the final week of this program.",
      },
    ],
    overflow_defaults: [
      {
        name: "Stress/Security Check",
        originator: "Enneagram tradition",
        source: "IEQ9 stress/security framework",
        file_ref: "common:stress_security",
        duration_min: 10,
        modality: "integrative",
      },
    ],
    framework_analysis_default: {
      name: "Progress as Data",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example: "Progress is not linear or uniform. You may have resolved the financial anxiety while the trust disruption is untouched. That is normal. It is also useful data.",
    },
    micro_content:
      "Progress is not linear or uniform. You may have resolved the financial anxiety while the trust disruption is untouched. That is normal. It is also useful data for what needs attention next.",
    system_notes: "Bring Day 1 data forward. The comparison is the exercise.",
    is_onboarding: false,
  },
  {
    day_number: 25,
    week_number: 4,
    title: "What This Activated That Is Older",
    territory: "Family patterns. Inherited scripts about authority and evaluation.",
    seed_prompts: [
      {
        prompt: "What did your family believe about people who fail at work? What did failure mean in your house?",
        purpose: "Surface inherited evaluation scripts",
      },
      {
        prompt: "How much of your response to this PIP is about this PIP, and how much is an older pattern wearing new clothes?",
        purpose: "Separate present-tense response from historical pattern",
      },
    ],
    coaching_exercises: [
      {
        name: "The Older Pattern",
        duration_min: 5,
        custom_framing:
          "For three weeks, you have been managing the present — the PIP, your communication, your relationships, your options. Today, look beneath all of that. A PIP hits hard not just because of the job threat, but because it activates older scripts about what it means to be evaluated, to disappoint authority, to fail. These scripts were written long before this job. Think about your family of origin. What did your family believe about people who fail at work? Was your worth conditional on achievement, approval, or being 'the good one'? How did the authority figures in your early life respond to mistakes — with support, with punishment, with withdrawal? Where did you first learn the pattern that the PIP reactivated? Now connect this to your saboteur work. The saboteur you identified as most persistent was not built during this PIP. It was built much earlier — in a family, a school, an early workplace — as a way to survive an environment where being yourself felt risky. The PIP just turned the volume back up. Separate the inherited voice from what you actually believe when that voice is quiet. You do not need to resolve your entire history today. Just see the connection between then and now.",
      },
    ],
    overflow_defaults: [
      {
        name: "Inner Mentor vs. Inner Critic",
        originator: "Tara Mohr",
        source: "Playing Big (2014)",
        file_ref: "jetstream:inner_mentor",
        duration_min: 15,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "IFS — Early Parts and Exiles",
      originator: "Jay Earley / Richard Schwartz / Alice Miller",
      source_ref: "Self-Therapy (2009); IFS (1995); The Drama of the Gifted Child (1979)",
      example:
        "A PIP does not create the belief that your worth depends on approval. It activates a belief that was already there. Seeing the origin gives you a choice about whether to keep running that program.",
    },
    micro_content:
      "Beliefs formed under early evaluation encode with disproportionate weight. A PIP does not create the belief that your worth depends on approval. It activates a belief that was already there. Seeing the origin gives you a choice.",
    system_notes:
      "Deep excavation deferred to here deliberately. By Week 4 the client has enough stability to go here.",
    is_onboarding: false,
  },
  {
    day_number: 26,
    week_number: 4,
    title: "Communication Under Pressure — Full Integration",
    territory: "NVC + saboteur + boundary + Gottman repair. Full simulation.",
    seed_prompts: [
      {
        prompt: "How has your communication changed since Day 10? At work? At home?",
        purpose: "Measure communication growth across the program",
      },
      {
        prompt: "What conversation have you been avoiding that needs to happen before this program ends?",
        purpose: "Surface the avoided conversation for simulation",
      },
    ],
    coaching_exercises: [
      {
        name: "The Centered Conversation",
        duration_min: 5,
        custom_framing:
          "This exercise brings together everything you have practiced — clear communication, saboteur awareness, boundary setting, and relationship repair — into one conversation. Think about the most important conversation ahead of you right now. It might be a PIP check-in, a conversation with your partner about how things have been, or a discussion with a colleague. Write three versions of that conversation. Version 1 — The saboteur's version: what would happen if your automatic patterns ran the conversation unchecked? What would you say, avoid saying, or do? Version 2 — The centered version: using the observation-feeling-need-request framework from Days 10-11, write what you would actually say. Keep your boundaries from Day 19 clear. Say what is true without being reactive. Version 3 — The repair version: real conversations go sideways. What will you do when this one does? What does it look like to acknowledge losing your center, take a pause, and come back? The repair version is not a backup plan — it is often the most important version, because it prepares you for the moment when your saboteur shows up mid-conversation. Practice versions 2 and 3 out loud. Saying the words aloud changes how they land when the moment is real.",
      },
    ],
    overflow_defaults: [
      {
        name: "NVC Self-Expression Practice",
        originator: "Marshall Rosenberg",
        source: "NVC (2003)",
        file_ref: "jetstream:nvc_practice",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Repair Attempts",
      originator: "John Gottman / Marshall Rosenberg / Susan David",
      source_ref: "The Relationship Cure (2001); NVC (2003); Emotional Agility (2016)",
      example:
        "Real conversations do not follow scripts. They go sideways. The goal is not a perfect conversation. It is staying centered when it goes sideways and repairing when you lose center.",
    },
    micro_content:
      "Real conversations do not follow scripts. They go sideways. The goal is not a perfect conversation. It is a conversation where you can stay centered when it goes sideways, repair when you lose center, and walk away knowing you said what was true.",
    system_notes: "Integration exercise combining multiple frameworks into simulated conversation.",
    is_onboarding: false,
  },
  {
    day_number: 27,
    week_number: 4,
    title: "Saboteurs Under Pressure — Final Round",
    territory: "Full-system simulation. All tools integrated.",
    seed_prompts: [
      {
        prompt: "If you walked into the highest-stakes conversation of this PIP tomorrow, which saboteur arrives first?",
        purpose: "Identify the primary saboteur under maximum pressure",
      },
      {
        prompt: "What would it tell you to do? What would happen if you listened? What would you do instead, knowing what you know now after four weeks?",
        purpose: "Contrast saboteur-driven vs. toolkit-driven responses",
      },
    ],
    coaching_exercises: [
      {
        name: "Pattern Testing — The Full System",
        duration_min: 5,
        custom_framing:
          "This is the capstone exercise of the program — a full simulation that tests everything you have built. Think of the highest-stakes conversation or situation ahead of you. It might be a final PIP review, a negotiation about your future, or the moment you tell someone an honest truth. First, write the scene as it would play out if your saboteur were running it completely. What would you do, say, avoid, or perform? Where would your body tense up? How would it end? Now rewrite that same scene using every tool you have built over four weeks: catch the saboteur as it activates (Days 2-3), use your regulation anchor to stay grounded (Day 7), communicate using observation-feeling-need-request (Days 10-11), hold your boundaries (Day 19), check your thinking for distortions (Day 17), and have a repair plan ready (Day 26). After writing both versions, notice something important: which tools feel natural now, like they have become part of how you operate? And which still feel forced or awkward? The natural ones are yours to keep. The forced ones may need more practice, or they may not be the right tools for you — and that is fine too. The difference between these two versions is what you built in four weeks.",
      },
    ],
    overflow_defaults: [
      {
        name: "Saboteur Contingency Plan",
        originator: "Shirzad Chamine",
        source: "Positive Intelligence (2012)",
        file_ref: "jetstream:saboteur_contingency",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Integrated Pattern Work",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example:
        "Knowing your patterns does not prevent them from activating. It gives you a two-second lead. The tools you built are what you do with those two seconds. That is enough.",
    },
    micro_content:
      "Knowing your patterns does not prevent them from activating. It gives you a two-second lead. The tools you built — the saboteur log, the NVC framework, the boundary lines, the regulation toolkit — are what you do with those two seconds. That is enough.",
    system_notes:
      "Capstone exercise. The difference between the two versions is what the client has built over four weeks.",
    is_onboarding: false,
  },
  {
    day_number: 28,
    week_number: 4,
    title: "What's Still Unresolved",
    territory: "Open threads inventory. Professional support referrals.",
    seed_prompts: [
      {
        prompt: "What is still unresolved? Name it without judgment.",
        purpose: "Surface everything that remains open",
      },
      {
        prompt: "Which open thread needs professional support — therapist, employment lawyer, financial advisor, career coach, couples counselor?",
        purpose: "Identify where the program's scope ends and other resources begin",
      },
    ],
    coaching_exercises: [
      {
        name: "Honest Inventory of Open Threads",
        duration_min: 5,
        custom_framing:
          "This program does not tie everything up neatly in 30 days — and pretending it does would be dishonest. Today, name what is still unresolved. Write down every open thread without judgment. Your PIP may still be active. The decision about staying or leaving may still be unmade. You may still be carrying anger or grief. Your relationships may need attention that this program could not provide. The older patterns you uncovered on Day 25 may need deeper therapeutic work than a 30-day program can offer. For each open thread, ask yourself one question: what does this need next? The options are: (1) more time — it is not unresolved, it is just not done yet, (2) a specific resource — a therapist, an employment lawyer, a financial advisor, a career coach, a couples counselor, (3) an avoided conversation — something you need to say to someone, (4) continued practice — a tool from this program that you need to keep using. Naming what is unfinished is not a failure. It is the most honest thing you can do. Closure is overrated. Having tools to keep processing without being consumed — that is what matters.",
      },
    ],
    overflow_defaults: [
      {
        name: "Repair Attempt Practice",
        originator: "John Gottman",
        source: "The Relationship Cure (2001)",
        file_ref: "jetstream:repair_attempt",
        duration_min: 15,
        modality: "relational",
      },
    ],
    framework_analysis_default: {
      name: "Open Threads as Data",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example:
        "Closure is overrated. Most meaningful experiences stay open for a long time. The question is not whether you are done. It is whether you have tools to keep processing without being consumed.",
    },
    micro_content:
      "Closure is overrated. Most meaningful experiences stay open for a long time. The question is not whether you are done. It is whether you have tools to keep processing without being consumed.",
    system_notes: "Open threads at Day 30 are expected. The difference is they are now named and visible.",
    is_onboarding: false,
  },
  {
    day_number: 29,
    week_number: 4,
    title: "Full Review",
    territory: "30-day summary. Letter to future self.",
    seed_prompts: [
      {
        prompt: "What do you know now about how you respond to authority, threat, and evaluation that you did not know 30 days ago?",
        purpose: "Synthesize the program's core learning",
      },
    ],
    coaching_exercises: [
      {
        name: "Letter to Future Self",
        duration_min: 5,
        custom_framing:
          "Before this exercise, the system will generate a summary of your 30-day journey — the patterns you identified, the tools you practiced, the shifts you made. Read it and let it settle. Then write a letter to yourself 90 days from now. This is the person you will be in three months, whether the PIP resolved well or not. In your letter, include: what you learned about how you respond to authority, evaluation, and threat. Which saboteur patterns you now see clearly. Which tools — the regulation anchors, the communication framework, the boundary practice, the distortion checks — you want to carry forward. And most importantly, what you want future-you to remember the next time a high-pressure evaluation or professional crisis happens. Because it will happen again in some form. The question is whether you will face it with the awareness you have built or whether you will have to rebuild from scratch. This letter is your anchor for that moment.",
      },
    ],
    overflow_defaults: [
      {
        name: "Stress-Response Direction Check",
        originator: "Karen Horney / Bob Anderson",
        source: "Our Inner Conflicts (1945); Mastering Leadership (2016)",
        file_ref: "jetstream:stress_direction",
        duration_min: 10,
        modality: "cognitive",
      },
    ],
    framework_analysis_default: {
      name: "Integration",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example: "The practice does not end. The container changes. The tools remain.",
    },
    micro_content:
      "The program ends. The practice does not have to. You retain access to journal history, saboteur logs, communication exercises, and daily capture.",
    system_notes: "System generates 30-day summary for review.",
    is_onboarding: false,
  },
  {
    day_number: 30,
    week_number: 4,
    title: "Where You Are",
    territory: "One sentence. Final disruptions check. Closing.",
    seed_prompts: [
      {
        prompt: "Where are you today? Not where you wish you were. Not where the PIP says you should be. Where you are.",
        purpose: "Final honest placement",
      },
    ],
    coaching_exercises: [
      {
        name: "One Sentence",
        duration_min: 3,
        custom_framing:
          "This is the final exercise. It is simple on purpose. Take a moment to revisit the seven disruptions you rated on Day 1 and Day 24 — notice how they have shifted. Revisit the saboteur patterns you identified on Day 2 — notice which ones still run and which ones you can now catch. Revisit the communication patterns you practiced in Weeks 2 and 4 — notice what has changed in how you speak, listen, and ask for what you need. Now notice what is different from when you started. And notice what is the same. Then write one sentence — just one — that captures where you are today. Not where you wish you were. Not where the PIP says you should be. Not where you think you are supposed to be after 30 days of work. Where you actually are. One honest sentence is worth more than a hundred aspirational ones.",
      },
    ],
    overflow_defaults: [
      {
        name: "Body Scan + Grounding",
        originator: "Jon Kabat-Zinn",
        source: "Full Catastrophe Living (1990)",
        file_ref: "common:body_scan",
        duration_min: 10,
        modality: "somatic",
      },
    ],
    framework_analysis_default: {
      name: "Presence",
      originator: "All Minds on Deck",
      source_ref: "JETSTREAM Program",
      example: "One sentence. Where you are. Not where you wish. Where you actually are.",
    },
    micro_content:
      "The program ends. The practice does not have to. Clients retain access to journal history, saboteur logs, communication exercises, and one-liner capture. The daily prompt cadence stops. The container remains. What happens next is yours to decide.",
    system_notes: "Final day. Keep it simple. One sentence is enough.",
    is_onboarding: false,
  },
];

// ─── Upsert Logic ──────────────────────────────────────────────

async function main() {
  console.log("Seeding JETSTREAM (performance_plan) program...\n");

  // 1. Upsert program
  const { data: prog, error: progErr } = await supabase
    .from("programs")
    .upsert(JETSTREAM_PROGRAM, { onConflict: "slug" })
    .select("id")
    .single();

  if (progErr || !prog) {
    console.error("Failed to upsert program:", progErr?.message);
    process.exit(1);
  }
  console.log(`  ✓ Program upserted  id=${prog.id}\n`);

  // 2. Upsert days
  let ok = 0;
  let fail = 0;

  for (const d of DAYS) {
    const { error } = await supabase.from("program_days").upsert(
      {
        program_id: prog.id,
        day_number: d.day_number,
        week_number: d.week_number,
        title: d.title,
        territory: d.territory,
        seed_prompts: d.seed_prompts,
        coaching_exercises: d.coaching_exercises,
        overflow_defaults: d.overflow_defaults,
        framework_analysis_default: d.framework_analysis_default,
        micro_content: d.micro_content,
        system_notes: d.system_notes,
        is_onboarding: d.is_onboarding,
      },
      { onConflict: "program_id,day_number" }
    );

    if (error) {
      console.warn(`  ⚠ Day ${d.day_number}: ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ Day ${d.day_number}: ${d.title}`);
      ok++;
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log(`Program:   JETSTREAM (performance_plan)`);
  console.log(`Days OK:   ${ok}`);
  console.log(`Days FAIL: ${fail}`);
  console.log("══════════════════════════════════════════");
}

main().catch(console.error);
