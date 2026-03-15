/**
 * Seed BASECAMP (new_role) program + all 30 program_days into Supabase.
 *
 * Run: npx tsx scripts/seed-basecamp-program.ts
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

const BASECAMP_PROGRAM = {
  slug: "new_role",
  name: "BASECAMP",
  tagline: "A 30-Day Program for Starting a New Role",
  description:
    "BASECAMP is a 30-day program for navigating a new role with both strategic clarity and self-awareness. Know your values. Identify your patterns. Read the new culture accurately. Take deliberate action from alignment rather than from anxiety, imposter syndrome, or old habits. Designed for tech professionals accustomed to ramping fast and delivering under ambiguity.",
  duration_days: 30,
  weekly_themes: [
    {
      week: 1,
      name: "ORIENT",
      title: "Read the Room and Know Yourself",
      territory:
        "Establish an honest baseline of how this transition is affecting you. Clarify your operational values. Identify your saboteurs and default patterns. Start reading the culture and mapping key stakeholders.",
    },
    {
      week: 2,
      name: "CONNECT",
      title: "Build Relationships and Map the System",
      territory:
        "Have the real conversations with people who know the history. Map power and proximity. Develop a strategy for the manager relationship. Practice deep listening and calibrate your communication style to this culture.",
    },
    {
      week: 3,
      name: "ACT",
      title: "Start Contributing From Alignment, Not Anxiety",
      territory:
        "Select early wins that match both your values and your manager's priorities. Distinguish creative from reactive contributions. Calibrate how you communicate. Navigate imposter syndrome and your first real friction.",
    },
    {
      week: 4,
      name: "CALIBRATE",
      title: "Check What You Assumed Against What Is True",
      territory:
        "Reassess your disruptions and update your cultural and power maps with real data. Navigate the neutral zone between old and new identity. Audit your values and relationships. Design a sustainable practice for beyond Day 30.",
    },
  ],
  intake_config: {
    pre_start_questions: [
      {
        id: "transition_context",
        question: "What is the context of this transition?",
        type: "select",
        options: [
          "Recruited externally",
          "Applied externally",
          "Internal move",
          "Return from leave",
          "Other",
        ],
      },
      {
        id: "role_details",
        question: "Describe your new role: title, function, team size, remote/hybrid/in-person.",
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
          "Competence Confidence",
          "Social Belonging",
          "Cultural Fluency",
          "Identity Continuity",
          "Clarity of Expectations",
          "Routine and Rhythm",
          "Authority and Credibility",
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

const days: ProgramDay[] = [
  // ═══════════════════════════════════════════════════════════════
  // WEEK 1: ORIENT — Read the Room, Know Yourself
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 1,
    week_number: 1,
    title: "Arrival",
    territory: "Seven disruptions baseline, emotional starting point, honest assessment",
    seed_prompts: [
      { prompt: "What is true about your situation right now? Not what might happen. What is actually true today.", purpose: "Ground in present reality" },
      { prompt: "Which of the seven new-role disruptions is loudest right now?", purpose: "Identify primary disruption" },
      { prompt: "What excites you about this role? What scares you? Both are data.", purpose: "Surface ambivalence" },
    ],
    coaching_exercises: [
      {
        name: "The Seven Disruptions Inventory (New Role Version)",
        duration_min: 5,
        custom_framing: "Starting a new role disrupts more than just your calendar. Even when it's exciting, it can quietly shake your confidence, sense of belonging, and daily rhythm. Rate each area from 1 (barely affected) to 10 (strongly affected): Competence confidence (do you trust you can do this job?), Social belonging (do you feel part of the team yet?), Cultural fluency (do you understand how things work here?), Identity continuity (does this role still feel like you?), Clarity of expectations (do you know what success looks like?), Routine and rhythm (have you found your daily flow?), Authority and credibility (do people here respect your expertise?). Be honest — this is your starting point, not a performance review.",
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
      example: "If journal shows anxiety: system identifies sympathetic activation in context of new environment. If numbness or flatness: dorsal. Matched regulation tools for transition stress.",
    },
    micro_content: "Disorientation is a normal response for a competent person who has lost their infrastructure. You knew how things worked. Now you don't. Seven systems are offline simultaneously. (Bridges, Transitions; Watkins, The First 90 Days.)",
    system_notes: "Day 1. Step 1 draws from intake data since there is no prior journal. Barrier low. The inventory is concrete and structured.",
    is_onboarding: true,
  },
  {
    day_number: 2,
    week_number: 1,
    title: "How You Want to Show Up",
    territory: "Operational values, decision-making commitments, professional identity",
    seed_prompts: [
      { prompt: "Describe the best version of yourself at work. What does that person do when things get uncertain?", purpose: "Surface ideal professional self" },
      { prompt: "What do you want to be known for in this new environment?", purpose: "Clarify values-driven identity" },
      { prompt: "Where have you drifted from your values under pressure in previous roles?", purpose: "Identify drift patterns" },
    ],
    coaching_exercises: [
      {
        name: "Operational Values",
        duration_min: 5,
        custom_framing: "This exercise helps you define how you want to behave in specific work situations — before the pressure hits. For each scenario below, complete the sentence with what you'd commit to doing:\n\n- When I disagree with my manager, I will...\n- When I don't know the answer, I will...\n- When someone takes credit for my work, I will...\n- When I'm asked to override my own judgment, I will...\n- When I feel the pull to overwork, I will...\n- When I'm performing rather than being genuine, I will...\n- When the culture asks me to be someone I'm not, I will...\n\nThese aren't aspirations — they're commitments. You'll revisit them throughout the program to see where you held steady and where you drifted.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Values-Behavior Gap Analysis",
      originator: "Hayes / ACT",
      source_ref: "01:130",
      example: "If journal reveals tension between stated values and actual behavior: maps the gap. Where is the client already living their values? Where is pressure creating drift?",
    },
    micro_content: "Operational values are different from aspirational values. These are the commitments you make about how you will behave in specific situations. You will revisit these on Days 12, 25, and 30. (Original exercise design.)",
    system_notes: "Day 2. These values become the reference document for the rest of the program. Client returns to them repeatedly.",
    is_onboarding: true,
  },
  {
    day_number: 3,
    week_number: 1,
    title: "Your Patterns Under Uncertainty",
    territory: "Saboteur identification, centers of intelligence, reactive tendencies",
    seed_prompts: [
      { prompt: "When you don't know the rules, what is your default move? Overwork? People-please? Withdraw? Control?", purpose: "Surface default pattern" },
      { prompt: "What does your inner critic say about you in this new role? Write its exact words.", purpose: "Name the inner critic" },
      { prompt: "Which part of you takes over when you feel incompetent — the thinker, the feeler, or the doer?", purpose: "Identify dominant center" },
    ],
    coaching_exercises: [
      {
        name: "Saboteurs, Centers, and Reactive Tendencies (Integrated)",
        duration_min: 5,
        custom_framing: "When we're in unfamiliar territory, automatic patterns take over. This exercise looks at yours from three angles:\n\n**1. Your protection strategies ('saboteurs'):** Under stress, we all default to strategies that once helped us cope. Common ones include: the Pleaser (agrees to everything), the Hyper-Achiever (overworks to prove worth), the Expert (needs to know everything before acting), the Controller (micromanages), the Avoider (pulls back from hard conversations), and the Hyper-Vigilant (scans for threats constantly). Which 2-3 are loudest for you in this new role?\n\n**2. Your go-to intelligence center:** When uncertain, do you lead with thinking (analyzing, researching), feeling (reading the room, seeking connection), or doing (taking action, staying busy)? Which do you neglect?\n\n**3. Your reactive pattern:** Under pressure, do you tend to comply (go along, people-please), protect (withdraw, become the expert), or control (take charge, push harder)?\n\nNotice how these three might connect — for example, a Pleaser who leads with feeling and tends to comply.",
      },
    ],
    overflow_defaults: [
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "6 F's Parts Work", originator: "Schwartz", source: "IFS", file_ref: "04:54", duration_min: 5, modality: "integrative" },
      { name: "Prediction Process", originator: "BEabove / Barrett", source: "BEabove", file_ref: "01:61", duration_min: 3, modality: "cognitive" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
    ],
    framework_analysis_default: {
      name: "Immunity to Change",
      originator: "Kegan & Lahey",
      source_ref: "07:88",
      example: "If journal shows wanting to contribute but holding back: surfaces hidden competing commitment. Goal > behaviors against it > hidden commitment > big assumption.",
    },
    micro_content: "Three lenses on the same behavior pattern. Your saboteurs, your dominant center of intelligence, and your reactive tendency under pressure all point to the same protective strategy — but from different angles. (Chamine; Enneagram tradition; Anderson & Adams, Mastering Leadership.)",
    system_notes: "After Day 3: system generates 6 goals. Client approves before Day 4. This is the cornerstone exercise.",
    is_onboarding: true,
  },
  {
    day_number: 4,
    week_number: 1,
    title: "Reading the New Culture",
    territory: "Cultural dimensions mapping, gaps between your style and the culture",
    seed_prompts: [
      { prompt: "What communication norms have you noticed that are different from where you came from?", purpose: "Surface cultural observations" },
      { prompt: "What unwritten rules have you already bumped into?", purpose: "Identify invisible norms" },
      { prompt: "Where have you already adapted your behavior — consciously or not?", purpose: "Track adaptation" },
    ],
    coaching_exercises: [
      {
        name: "Cultural Dimensions Mapping",
        duration_min: 5,
        custom_framing: "Every workplace has an invisible operating system — unspoken rules about how people communicate, make decisions, and handle conflict. When you start a new role, you are learning a new cultural language whether you realize it or not. This exercise helps you map that culture deliberately instead of figuring it out through trial and error.\\n\\nPart 1 — Your style vs. the culture (six dimensions): For each dimension below, rate how the new culture operates on a scale of 1-10, then rate your own natural style. The gap between them shows where you will need to adapt most. The six dimensions are: Directness (do people say what they mean, or speak between the lines?), Enthusiasm (are people expressive or reserved?), Formality (is the culture casual or structured?), Assertiveness (do people push their ideas forward or defer?), Self-promotion (do people highlight their accomplishments or let work speak for itself?), Personal disclosure (do people share personal details or keep things professional?).\\n\\nPart 2 — How this culture compares to your last one: Now think about six broader patterns: How does this culture communicate (explicit or implicit)? How do they evaluate performance (direct feedback or indirect)? How do leaders lead (top-down or consensus)? How are decisions made (one person decides or group decides)? How is trust built (through tasks or through relationships)? How do people disagree (openly or behind the scenes)? Compare these to your previous workplace. The biggest differences are where misfires are most likely.",
      },
    ],
    overflow_defaults: [
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "Multiple Perspectives Exercise", originator: "CBT/systemic", source: "CBT", file_ref: "01:225", duration_min: 5, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Window of Tolerance Tracking", originator: "Siegel/Ogden", source: "Sensorimotor", file_ref: "03:20", duration_min: 1, modality: "somatic" },
    ],
    framework_analysis_default: {
      name: "Cultural Dimensions Analysis",
      originator: "Molinsky / Meyer",
      source_ref: "07:life",
      example: "If journal reveals communication misfires: maps them to specific cultural dimension gaps. Where is the client's natural style misaligned with the new culture's expectations?",
    },
    micro_content: "Every organization has an operating system — how decisions get made, how conflict is handled, how feedback is given. You don't yet speak this language. Translation errors are invisible until they are costly. (Molinsky, Global Dexterity; Meyer, The Culture Map.)",
    system_notes: "First cultural reading. Will be revisited and updated on Day 24 with lived data.",
    is_onboarding: false,
  },
  {
    day_number: 5,
    week_number: 1,
    title: "The People You Need to Talk To",
    territory: "Stakeholder mapping, five conversation categories, specific questions",
    seed_prompts: [
      { prompt: "Who in this organization knows how things really work — not what the handbook says?", purpose: "Identify informal knowledge holders" },
      { prompt: "Who has been here long enough to know the history — why things are the way they are?", purpose: "Find historians" },
      { prompt: "Who are you avoiding talking to? Why?", purpose: "Surface relational avoidance" },
    ],
    coaching_exercises: [
      {
        name: "Stakeholder Map — The Five Conversations",
        duration_min: 5,
        custom_framing: "In any new role, your success depends partly on the relationships you build. A stakeholder map helps you see who matters and why — not to be political, but to be intentional. There are five types of people you need to find, each serving a different purpose in helping you get oriented.\\n\\n(1) Historians — these are people who have been around long enough to know why things are the way they are. They can tell you the backstory behind current tensions, decisions, and structures. (2) Cultural Interpreters — these people can explain the unwritten rules: how meetings really work, who you need to loop in before making a decision, what gets rewarded vs. what gets you in trouble. (3) Integrators — people who bridge different groups or teams. They can help you understand how the pieces fit together and introduce you across silos. (4) Technical Experts — people who hold deep institutional knowledge about the systems, processes, or domain you need to learn. (5) Pulse-Readers — people who know the informal dynamics: who is frustrated, what is shifting, where the energy is.\\n\\nFor each category, write down 1-2 names. Then write a specific question you want to ask each person. For example, for a Historian: 'What is one decision from the last year that still shapes how the team operates?' Having specific questions makes it far more likely you will actually have these conversations.",
      },
    ],
    overflow_defaults: [
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Stakeholder Analysis",
      originator: "Watkins",
      source_ref: "07:first90",
      example: "If journal reveals isolation or uncertainty about who to trust: maps the relational landscape. Who holds knowledge? Who holds influence? Where are the gaps?",
    },
    micro_content: "You are building a relationship map, not a network. Each category serves a different purpose. Historians tell you why. Cultural interpreters tell you how. Integrators connect you. (Watkins, The First 90 Days.)",
    system_notes: "This map will be updated on Days 13 and 24.",
    is_onboarding: false,
  },
  {
    day_number: 6,
    week_number: 1,
    title: "Week 1 Reflection",
    territory: "Integration, what surprised you, what you don't yet know",
    seed_prompts: [
      { prompt: "Sit with the mapping you've done this week. What surprised you?", purpose: "Integration" },
      { prompt: "What do you not yet know that you need to know?", purpose: "Identify knowledge gaps" },
      { prompt: "How is your body carrying this transition? What does it need?", purpose: "Somatic check-in" },
    ],
    coaching_exercises: [
      {
        name: "Week 1 Integration",
        duration_min: 3,
        custom_framing: "This week you created five different assessments: your disruption ratings (where this transition is hitting hardest), your operational values (how you want to show up), your saboteur and pattern profile (your default moves under pressure), your cultural map (how this workplace operates differently from what you are used to), and your stakeholder map (the people you need to build relationships with). Each one tells part of the story. This exercise asks you to look across all five and notice where they connect.\\n\\nFor example, if your biggest disruption is 'competence confidence' and your loudest saboteur is 'the Expert,' those are reinforcing each other. Or if your cultural map shows the culture is very direct but your pattern is to people-please, that is a specific tension to watch. Look across your five assessments and write down: What patterns do you see connecting two or more of them? What is the biggest tension you are carrying into Week 2? What is one thing you already know about yourself in this new environment that you did not know on Day 1?",
      },
    ],
    overflow_defaults: [
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
    ],
    framework_analysis_default: {
      name: "Integration Analysis",
      originator: "Program Architecture",
      source_ref: "basecamp:w1",
      example: "Synthesizes patterns across the five baseline assessments. Where do saboteurs, cultural gaps, and values intersect?",
    },
    micro_content: "First week is sustained observation — of the environment and of yourself in it. You now have terrain map, values compass, pattern profile, and people list. Next: turn observation into relationship, understanding into action.",
    system_notes: "Reflection day. Lighter exercise load.",
    is_onboarding: false,
  },
  {
    day_number: 7,
    week_number: 1,
    title: "Values Testing",
    territory: "Have your operational values been tested? First real-world data",
    seed_prompts: [
      { prompt: "Have any of your Day 2 operational values been tested this week? What happened?", purpose: "Track values in action" },
      { prompt: "Where did you feel pressure to be someone you are not?", purpose: "Identify authenticity strain" },
      { prompt: "What one thing do you want to carry into next week?", purpose: "Forward intention" },
    ],
    coaching_exercises: [
      {
        name: "Values Test Review",
        duration_min: 3,
        custom_framing: "On Day 2 you wrote down specific commitments about how you would behave in difficult situations — things like what you would do when you disagree with your manager or when you feel pressure to overwork. This exercise checks those commitments against your first week of real experience.\\n\\nPull up your Day 2 operational values and go through each one. For each commitment, ask: Was this tested this week? If yes, what happened — did you hold the line or drift? If you drifted, what pulled you off course? Often it is one of the protective patterns you identified on Day 3 (your saboteurs). For example, if you committed to 'speak up when I disagree' but the Pleaser pattern kept you quiet in a meeting, that is useful data — not a failure. If a value was not tested yet, note that too. Some values only get tested under specific pressure, and that pressure may not have arrived yet. This is your first real-world data on whether your commitments hold up when it matters.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Values-Behavior Tracking",
      originator: "Hayes / ACT",
      source_ref: "01:130",
      example: "Compares stated values with behavioral data from the week. Where alignment? Where drift? What drove the drift?",
    },
    micro_content: "You now have terrain map, values compass, pattern profile, people list. Next week: turn observation into relationship, understanding into action. The real work begins when you start talking to people. (Watkins; Molinsky.)",
    system_notes: "End of Week 1. Transition to relational work in Week 2.",
    is_onboarding: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 2: CONNECT — Build Relationships, Map the System
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 8,
    week_number: 2,
    title: "The Historian Conversations",
    territory: "Three levels of listening, approaching stakeholder conversations",
    seed_prompts: [
      { prompt: "What are you hoping to learn from the people who have been here longest?", purpose: "Clarify learning goals" },
      { prompt: "What are you afraid to discover about this organization?", purpose: "Surface fears" },
      { prompt: "When you approach new people, what does your saboteur do — perform, withdraw, or over-prepare?", purpose: "Track saboteur in relational context" },
    ],
    coaching_exercises: [
      {
        name: "Three Levels of Listening",
        duration_min: 5,
        custom_framing: "Most of us think listening means hearing words. But there are actually three levels of listening, and the deeper levels pick up information that words alone cannot carry. This framework comes from the Co-Active coaching tradition and it is one of the most useful tools for someone entering a new environment.\\n\\nLevel 1 is internal listening — you hear what the other person says, but you are processing it through your own lens. You are comparing it to your own experience, forming opinions, planning what to say next. This is how most people listen most of the time. Level 2 is focused listening — your full attention is on the other person. You hear their words, but you also notice their tone, their emotions, and what they emphasize. You can reflect back what you are hearing and they feel genuinely understood. Level 3 is global listening — you are aware of everything happening in the room. Body language, energy shifts, tension, what is not being said, the mood that changes when a certain topic comes up. This is the level that catches the unwritten rules of a new culture.\\n\\nYour practice this week: In your conversations with the historians and stakeholders you identified on Day 5, deliberately practice Level 3. Afterwards, write down one thing you noticed at Level 3 that you would have completely missed if you had been listening at Level 1.",
      },
    ],
    overflow_defaults: [
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Listening Level Analysis",
      originator: "Kimsey-House et al.",
      source_ref: "co-active",
      example: "If journal shows learning from conversations: which level were they listening at? What did Level 3 reveal that Level 1 would have missed?",
    },
    micro_content: "Level 3 listening is the learning stance for a new environment. It catches what words cannot carry — body language, energy shifts, what is not being said. This is your primary intelligence-gathering tool. (Kimsey-House et al., Co-Active Coaching; Carnegie; Voss.)",
    system_notes: "Listening framework introduced here. Applied throughout remaining days.",
    is_onboarding: false,
  },
  {
    day_number: 9,
    week_number: 2,
    title: "Mapping the Power Structure",
    territory: "Power sources, informal influence, relational proximity mapping",
    seed_prompts: [
      { prompt: "Who in this organization holds more influence than their title suggests?", purpose: "Identify informal power" },
      { prompt: "Where does the org chart lie — where do real decisions get made?", purpose: "Map informal structures" },
      { prompt: "Whose opinion about you matters most for your success here?", purpose: "Identify key stakeholders" },
    ],
    coaching_exercises: [
      {
        name: "Power & Proximity Mapping",
        duration_min: 5,
        custom_framing: "In every organization, there is the official structure (the org chart) and the real structure (how things actually get done, who actually has influence). Understanding both is essential when you are new. This exercise maps the real power structure so you can navigate it intentionally.\\n\\nPart 1 — Analytical Map: Think about the key people who affect your work and map where their influence comes from. There are five sources of power in organizations: (1) Formal authority — their title and position give them decision-making power. (2) Control of resources — they control budgets, headcount, or tools you need. (3) Control of information — they know things others do not and can decide who gets access. (4) Network position — they are connected to many people across the organization and serve as a hub. (5) Reputation — people respect their expertise or judgment, so their opinion carries weight regardless of title. For each key person, note which power sources they hold and how that relates to your role.\\n\\nPart 2 — Relational Map: On a blank page, place yourself in the center. Then position the key players around you based on how close or distant the relationship feels right now. People you feel connected to go closer; people who feel distant or unknown go further out. Notice: Are there clusters of people who are tight with each other? Where are you on the periphery? Where are you closer to the center? The combination of these two maps — who has power and where your relationships stand — shows you where to invest your energy.",
      },
    ],
    overflow_defaults: [
      { name: "Multiple Perspectives Exercise", originator: "CBT/systemic", source: "CBT", file_ref: "01:225", duration_min: 5, modality: "cognitive" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Power Dynamics Analysis",
      originator: "Pfeffer / Fridjhon & Fuller",
      source_ref: "07:power",
      example: "If journal reveals political observations: maps them to Pfeffer's power sources. Where is the client positioned? Where are the alliances and tensions?",
    },
    micro_content: "The analytical map shows you who holds power and why. The constellation shows you how it feels to be in the system. Both are necessary. Neither is complete alone. (Pfeffer, Power; Fridjhon & Fuller, Creating Intelligent Teams; Greene, 48 Laws.)",
    system_notes: "This map will be revised on Day 24 with three weeks of lived data.",
    is_onboarding: false,
  },
  {
    day_number: 10,
    week_number: 2,
    title: "The Manager Relationship",
    territory: "Implicit contract, communication style reading, manager strategy",
    seed_prompts: [
      { prompt: "What does your manager need from you that they haven't said explicitly?", purpose: "Read implicit expectations" },
      { prompt: "How does your manager prefer to communicate — written or verbal, summary or detail, scheduled or ad hoc?", purpose: "Map communication preferences" },
      { prompt: "What is your reactive tendency doing in the manager relationship?", purpose: "Track saboteur in authority relationship" },
    ],
    coaching_exercises: [
      {
        name: "Reading Your Manager (Implicit Contract + Communication Style)",
        duration_min: 5,
        custom_framing: "Your relationship with your manager is probably the single most important relationship in your new role. But much of what your manager needs from you is never stated explicitly — it is an implicit contract that you have to figure out through observation and conversation. This exercise helps you read that contract deliberately.\\n\\nPart 1 — The Implicit Contract: Answer each of these based on what you have observed so far (it is fine to have gaps — note those too). What does your manager need from you beyond the job description? How do they define success — is it results, visibility, reliability, innovation, or something else? How do they prefer to communicate — Slack, email, scheduled meetings, or ad hoc? Do they want detailed updates or just headlines? How do they give feedback — directly, indirectly, in the moment, or saved for 1:1s? What pressures are they under from their own manager or the business? What are the landmines — topics, approaches, or behaviors that would damage trust?\\n\\nPart 2 — Their Communication Style: People tend to lead with one of three orientations in how they work. Some lead with thinking — they want data, analysis, and well-reasoned arguments before making decisions. Some lead with feeling — they want to sense connection and trust before getting into the content. Some lead with doing — they want directness, action items, and momentum. Which orientation does your manager lead with? Knowing this helps you frame your communication in a way that lands. For example, if your manager leads with thinking and you lead with feeling, you might need to bring more data to your proposals than feels natural to you.",
      },
    ],
    overflow_defaults: [
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Manager Relationship Analysis",
      originator: "Watkins / Hebenstreit",
      source_ref: "07:first90",
      example: "If journal shows uncertainty about manager: maps the implicit contract. What does the manager actually need? How does their communication style differ from the client's default?",
    },
    micro_content: "Your manager has an implicit contract with you that neither of you has discussed. Reading it accurately is the difference between early wins and early misfires. (Watkins, The First 90 Days; Hebenstreit, The How and Why; Greene, 48 Laws — Law 1.)",
    system_notes: "Manager strategy informs early wins selection on Day 15.",
    is_onboarding: false,
  },
  {
    day_number: 11,
    week_number: 2,
    title: "Reading Your Colleagues",
    territory: "Communication style mapping, instinctual priorities, relationship building",
    seed_prompts: [
      { prompt: "Who is easiest to communicate with on your team? What makes it easy?", purpose: "Identify natural alignment" },
      { prompt: "Where have you already had a communication misfire — even a small one?", purpose: "Surface early friction" },
      { prompt: "How are you prioritizing relationships — going deep with a few or broad with many?", purpose: "Track relational strategy" },
    ],
    coaching_exercises: [
      {
        name: "Communication Style Map + Instinctual Priorities",
        duration_min: 5,
        custom_framing: "You do not need to become a different person for every colleague. But small adjustments in how you communicate can dramatically improve how well your ideas land and how quickly trust builds. This exercise helps you observe your key colleagues' communication preferences and make one deliberate adjustment per person.\\n\\nPart 1 — Mapping Your Colleagues: Pick 3-5 colleagues you interact with regularly. For each one, notice where they fall on these five spectrums: Do they need data and evidence before they buy in, or do they trust their gut and want the headline? Do they need to feel heard and connected before getting to business, or are they task-first? Do they prefer working independently, or do they want to collaborate and check in frequently? Do they gravitate toward big-picture vision, or do they want concrete structure and details? Do they prioritize harmony and consensus, or do they prefer directness even when it is uncomfortable? For each person, write down one specific way you could adjust your approach to match their preference. Keep it small — one adjustment per person is enough to shift the dynamic.\\n\\nPart 2 — Your Relationship Priorities: People tend to focus their energy on one of three areas in social settings. Self-preservation focus means you prioritize security, comfort, and protecting your territory (making sure you have what you need). Social focus means you pay close attention to group dynamics, hierarchy, and your position in the group. One-to-one focus means you invest deeply in individual relationships and seek intensity and depth in connection. Which of these three are you leading with in this new role? Which are you neglecting? The one you neglect often holds the key to what is missing in your transition.",
      },
    ],
    overflow_defaults: [
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Communication Style Analysis",
      originator: "Hebenstreit / Enneagram",
      source_ref: "07:hebenstreit",
      example: "If journal reveals relationship-building patterns: which instinctual orientation is the client leading with? What would 10% more attention to the neglected orientation look like?",
    },
    micro_content: "You are not typing people. You are recognizing observable preferences and adapting your delivery. One small adjustment per person is enough to shift the dynamic. (Hebenstreit, The How and Why; Enneagram tradition.)",
    system_notes: "Communication map feeds into Day 17 communication calibration.",
    is_onboarding: false,
  },
  {
    day_number: 12,
    week_number: 2,
    title: "Cultural Calibration",
    territory: "Authenticity-adaptation tension, flex categories, values filter",
    seed_prompts: [
      { prompt: "Where are you adapting your behavior to fit the culture? How does it feel?", purpose: "Track adaptation experience" },
      { prompt: "Which adaptations feel sustainable and which are starting to cost you?", purpose: "Identify authenticity strain" },
      { prompt: "Have any of your Day 2 values been tested by cultural norms this week?", purpose: "Connect values to cultural pressure" },
    ],
    coaching_exercises: [
      {
        name: "The Authenticity-Adaptation Map",
        duration_min: 5,
        custom_framing: "Every new role asks you to adapt. Some adaptations are easy — you adjust your meeting style, you learn new tools, you show up earlier. But some adaptations start to wear on you because they bump up against something that matters to you. The key question is: which adaptations are fine, which need watching, and which cross a line you should not cross?\\n\\nPull up the cultural gaps you identified on Day 4 and anything you have noticed during Week 2. For each gap between your natural style and the culture's expectations, put it in one of three categories:\\n\\n(1) Flex comfortably — this adaptation is easy and costs you nothing meaningful. You can do it without feeling like you are losing yourself. (2) Flex with awareness — this adaptation is manageable, but it touches something that matters to you. It needs monitoring because the cost could accumulate over time if you are not careful. (3) Non-negotiable — this would violate one of the operational values you set on Day 2. This is the line. You do not cross it, even if the culture expects it.\\n\\nOne important thing to watch: your protective patterns from Day 3 can distort this sorting. If you tend to people-please, you might put too much in the 'flex comfortably' category — absorbing costs you should not be absorbing. If you tend to control, you might put too much in 'non-negotiable' — refusing to adapt where flexibility would serve you. Be honest about whether your sorting is accurate or whether your pattern is doing the sorting for you.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Authenticity-Adaptation Analysis",
      originator: "Molinsky / Greene",
      source_ref: "07:molinsky",
      example: "If journal reveals tension between fitting in and being yourself: maps each adaptation to a flex category. Where is the saboteur distorting the categorization?",
    },
    micro_content: "The tension between authenticity and adaptation is the core of cultural navigation. The goal is not to eliminate it — it is to know which category each adaptation falls in and to protect the non-negotiables. (Molinsky, Global Dexterity; Greene, 48 Laws — Law 38.)",
    system_notes: "This map is revisited on Day 25 as a real-world audit.",
    is_onboarding: false,
  },
  {
    day_number: 13,
    week_number: 2,
    title: "Week 2 Reflection",
    territory: "Level 3 learning, relationship progress, cultural calibration",
    seed_prompts: [
      { prompt: "What has Level 3 listening taught you this week that words alone could not?", purpose: "Assess listening practice" },
      { prompt: "Which relationship is forming most naturally? Which needs more attention?", purpose: "Relational awareness" },
      { prompt: "Where did body language or energy reveal something that words hid?", purpose: "Deepen observation skills" },
    ],
    coaching_exercises: [
      {
        name: "Week 2 Integration",
        duration_min: 3,
        custom_framing: "This week you built several relationship and communication tools: your listening practice (noticing what is happening beneath the words), your power map (who holds influence and where you stand), your manager strategy (what your manager needs and how they communicate), your colleague communication map (how to adjust your style for different people), and your authenticity-adaptation map (where you can flex and where you draw the line). Each of these gives you a different view of the same system you are navigating.\\n\\nLook across all of them and write down: What patterns are you noticing across multiple maps? For example, is there a relationship that shows up as important on both the power map and the communication map? Is there a cultural adaptation that is also creating tension in your manager relationship? Where are you making the most progress in connecting with people? What is still unclear or feels like you are guessing? What is one thing you want to pay closer attention to in Week 3?",
      },
    ],
    overflow_defaults: [
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
    ],
    framework_analysis_default: {
      name: "Week 2 Pattern Synthesis",
      originator: "Program Architecture",
      source_ref: "basecamp:w2",
      example: "Synthesizes relational, cultural, and power dynamics data. Where do the maps converge? What story is emerging about the client's position in the system?",
    },
    micro_content: "You now have cultural read, power map, manager strategy, communication guide for colleagues, and framework for deciding where to adapt. Most people at this stage are still figuring out where the bathroom is.",
    system_notes: "Reflection day. Consolidation before action-oriented Week 3.",
    is_onboarding: false,
  },
  {
    day_number: 14,
    week_number: 2,
    title: "Looking Forward",
    territory: "Power map and constellation revisited, setting Week 3 intentions",
    seed_prompts: [
      { prompt: "Look at your power map and constellation. Where do you want to be in 60 days?", purpose: "Set relational trajectory" },
      { prompt: "What relationship do you need to invest in next week?", purpose: "Prioritize connections" },
      { prompt: "What is one thing you want to contribute next week — from alignment, not from anxiety?", purpose: "Bridge to Week 3" },
    ],
    coaching_exercises: [
      {
        name: "Forward Positioning",
        duration_min: 3,
        custom_framing: "On Day 9 you drew a relational map — placing yourself and key people to show how close or distant those relationships felt. Pull that map out and look at it with fresh eyes after a full week of relationship-building.\\n\\nFirst, update the map: Where has the distance changed? Which relationships are closer than they were a week ago? Which are still distant? Are there new people who should be on the map now? Then think forward: Where do you want to be positioned in this system 60 days from now? Not in terms of org chart, but in terms of trust, access, and connection. What specific relationships would need to develop for that to happen? What actions would move those relationships forward — a conversation, a collaboration, a question you have been putting off?\\n\\nFinally, set 2-3 specific intentions for Week 3. These should be things you will actually do (not things you hope will happen), and they should align with the values you set on Day 2. For example: 'I will have a one-on-one conversation with [name] and ask them about [specific topic]' rather than 'I will try to connect more.'",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Transition Progress Assessment",
      originator: "Watkins / Bridges",
      source_ref: "07:first90",
      example: "Maps client's trajectory against Watkins' break-even point concept. Where is the client relative to net contribution? What would accelerate without overextending?",
    },
    micro_content: "You have crossed from observation to understanding. Next week: from understanding to action. Contributions being made, communication being calibrated, patterns tested by real stakes.",
    system_notes: "End of Week 2. Transition to action in Week 3.",
    is_onboarding: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 3: ACT — Deliver From Alignment
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 15,
    week_number: 3,
    title: "Early Wins — From Alignment, Not Anxiety",
    territory: "Selecting contributions, manager priorities, ambition calibration",
    seed_prompts: [
      { prompt: "What contribution are you itching to make — and is it genuine value or proving you belong?", purpose: "Distinguish value from performance" },
      { prompt: "What does your manager's first priority tell you about what would count as an early win?", purpose: "Align with manager needs" },
      { prompt: "Where is the Hyper-Achiever pushing you to over-deliver too early?", purpose: "Track saboteur in action" },
    ],
    coaching_exercises: [
      {
        name: "Selecting Your Early Wins",
        duration_min: 5,
        custom_framing: "When you are new, there is a natural urge to prove yourself — to show people you belong. But the best early contributions are not about proving anything. They are about delivering genuine value in a way that builds trust and credibility. The key is choosing the right contribution at the right time, rather than doing too much too fast.\\n\\nA good early win has four properties: (1) It is visible to the right people — not hidden work that no one notices, but something your manager and key stakeholders will see and appreciate. (2) It is aligned with your manager's priorities — you mapped these on Day 10, so use that. What does your manager actually need right now? (3) It is achievable with what you currently know and have access to — do not pick something that requires relationships or knowledge you do not have yet. (4) It is consistent with your operational values from Day 2 — it should feel like you, not like a performance.\\n\\nIdentify 2-3 potential early wins that meet all four criteria. Then calibrate your ambition: research on new role transitions suggests it takes about six months to reach the point where you are contributing more value than you are consuming in support and onboarding. You are at the halfway mark of your first month. Lead with one focused contribution, not twenty scattered ones. Strategic patience — doing less but doing it well — builds more credibility than trying to change everything at once.",
      },
    ],
    overflow_defaults: [
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Early Win Analysis",
      originator: "Watkins / Greene",
      source_ref: "07:first90",
      example: "If journal shows desire to contribute: assesses each potential win against the four properties. Is this aligned or anxiety-driven?",
    },
    micro_content: "Early wins serve learning, not ego. The best early win is visible, aligned, achievable, and values-consistent. The saboteur wants you to do more. (Watkins, The First 90 Days; Greene, 48 Laws — Laws 3, 4.)",
    system_notes: "Early wins should be informed by manager strategy from Day 10 and cultural read from Day 12.",
    is_onboarding: false,
  },
  {
    day_number: 16,
    week_number: 3,
    title: "The Tension Between Proving and Learning",
    territory: "Creative vs. reactive contributions, temporary incompetence",
    seed_prompts: [
      { prompt: "Is the Expert saboteur making it hard to ask questions or admit what you don't know?", purpose: "Track Expert saboteur" },
      { prompt: "What do you need to learn that requires admitting ignorance?", purpose: "Identify learning needs" },
      { prompt: "Are you operating from creative competencies or reactive tendencies this week?", purpose: "Self-assess contribution quality" },
    ],
    coaching_exercises: [
      {
        name: "Creative vs. Reactive Contribution",
        duration_min: 5,
        custom_framing: "There is an important difference between contributions that come from a grounded, authentic place and contributions that come from anxiety or self-protection. This exercise helps you tell the difference in your own work.\\n\\nReactive contributions are driven by fear, even when they look productive on the surface. They come in three flavors: Complying — you deliver what you think people want to hear, agreeing with the group even when you see things differently, prioritizing approval over honesty. Protecting — you hold back your ideas until they are perfect, stay quiet because you are not sure enough, withhold your real perspective to avoid being wrong. Controlling — you push your agenda too fast, try to change things before you have earned the trust to do so, or micromanage because letting go feels unsafe.\\n\\nCreative contributions come from a different place: Relating — you are building genuine connections, not just networking. Self-awareness — you notice when your protective patterns activate and choose differently. Authenticity — you offer your real perspective even when it is tentative, saying 'I am not sure yet, but here is what I am noticing.' Systems awareness — you see patterns others miss precisely because you are new and have fresh eyes. Achieving — you deliver genuine value that is aligned with an actual need, not just with your need to prove yourself.\\n\\nLook at the early wins you identified yesterday and any contributions you have made so far. For each one, honestly assess: was this creative or reactive? What drove it? Also remember that feeling incompetent is a normal and temporary part of any new role — it is not evidence that you are failing. It is the price of admission to learning something new.",
      },
    ],
    overflow_defaults: [
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Creative vs. Reactive Analysis",
      originator: "Anderson & Adams / Schein",
      source_ref: "07:lcp",
      example: "If journal shows contribution anxiety: maps each contribution to creative or reactive. What makes creative contribution possible? What triggers reactive?",
    },
    micro_content: "Learning requires vulnerability. Contribution requires voice. The tension between them is the work. 'Temporary incompetence' is the price of admission to any new context. (Anderson & Adams, Mastering Leadership; Schein, Humble Inquiry.)",
    system_notes: "This framework makes contribution assessment concrete rather than abstract.",
    is_onboarding: false,
  },
  {
    day_number: 17,
    week_number: 3,
    title: "Communicating in the New Culture",
    territory: "Five communication acts, cultural gaps, say less than necessary",
    seed_prompts: [
      { prompt: "How do people disagree here? How is that different from your default?", purpose: "Map disagreement norms" },
      { prompt: "Where have you held back from advocating for an idea? What stopped you?", purpose: "Identify advocacy patterns" },
      { prompt: "What have you said too much of, or too little?", purpose: "Calibrate communication volume" },
    ],
    coaching_exercises: [
      {
        name: "Communication Calibration",
        duration_min: 5,
        custom_framing: "How you communicate at work is not just about what you say — it is about how, when, and to whom. Every culture has different norms for the hardest communication moments: disagreeing, advocating, declining, and giving or receiving feedback. If you carry over the norms from your previous workplace without adjusting, you will create friction without understanding why.\\n\\nFor each of the five communication acts below, write down how the new culture handles it and how your natural default compares. Note the gap.\\n\\n(1) Disagreeing — How direct are people here when they disagree? Do they do it publicly in meetings or privately afterwards? Do they frame disagreement as a question ('Have we considered...?') or as a position ('I think we should...')? How does your default compare? (2) Advocating for an idea — Do people pitch ideas individually to a decision-maker, or is consensus-building expected first? Do they lead with data or with narrative? Is pre-alignment (getting buy-in before the meeting) the norm? (3) Saying no — Is it acceptable to decline requests directly, or do people say 'let me look into that' and then quietly deprioritize? What happens when someone says no? (4) Giving feedback — Is feedback direct and specific, or wrapped in positive framing? Does it happen in the moment or in scheduled sessions? (5) Receiving feedback — What response is expected when you receive feedback — gratitude, discussion, pushback? Is the full message in the words, or is the real message in what is implied?\\n\\nFor each gap you identify, refer back to your Day 12 categories: is this a comfortable flex, one that needs monitoring, or a non-negotiable? A useful principle for your first month: when in doubt, say less than necessary. You can always say more later, but you cannot unsay something that landed wrong in a culture you are still learning.",
      },
    ],
    overflow_defaults: [
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "Multiple Perspectives Exercise", originator: "CBT/systemic", source: "CBT", file_ref: "01:225", duration_min: 5, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Communication Gap Analysis",
      originator: "Meyer / Molinsky / Greene",
      source_ref: "07:culture",
      example: "If journal shows communication friction: maps to specific gap between client default and cultural norm. Which act needs calibration? What does 'say less than necessary' look like here?",
    },
    micro_content: "Culture has communication preferences. Yours may differ. The goal is not to become someone else — it is to know where the gaps are and calibrate deliberately. (Meyer, The Culture Map; Molinsky, Global Dexterity; Greene, 48 Laws — Law 4.)",
    system_notes: "Broader than JETSTREAM's communication work — maps five acts across full cultural context.",
    is_onboarding: false,
  },
  {
    day_number: 18,
    week_number: 3,
    title: "The Imposter Arrives",
    territory: "Imposter competence types, cognitive distortion testing",
    seed_prompts: [
      { prompt: "When did you first feel like a fraud in this new role? What triggered it?", purpose: "Identify imposter activation" },
      { prompt: "What specific claim is your imposter making — that you are not smart enough, not experienced enough, not working hard enough?", purpose: "Name the specific claim" },
      { prompt: "Would you call a friend in this same situation a fraud? Why or why not?", purpose: "Create perspective distance" },
    ],
    coaching_exercises: [
      {
        name: "Imposter Pattern Identification",
        duration_min: 5,
        custom_framing: "Imposter syndrome is the feeling that you are a fraud — that you do not really belong, and that it is only a matter of time before people figure that out. Nearly everyone experiences it during a role transition, but not everyone experiences it the same way. Research by Dr. Valerie Young identified five distinct patterns. Knowing which one is yours helps you challenge it more precisely.\\n\\n(1) The Perfectionist — you feel like a fraud because your work is not flawless. Anything less than perfect feels like evidence you are not good enough. (2) The Superwoman/man — you feel like a fraud unless you are working harder than everyone else. If you are not overworking, you feel like you are falling behind. (3) The Natural Genius — you feel like a fraud because things are hard. You are used to picking things up quickly, so struggling feels like proof you do not belong here. (4) The Soloist — you feel like a fraud if you need help. Asking for support feels like admitting you cannot handle it. (5) The Expert — you feel like a fraud because you do not know everything. Any gap in your knowledge feels like a disqualifying weakness.\\n\\nWhich type is loudest for you right now? How does it connect to the protective patterns (saboteurs) you identified on Day 3? Often they reinforce each other — for example, the Expert imposter type and the Expert saboteur are the same pattern seen from different angles.\\n\\nFinally, take the specific claim your imposter is making (for example, 'I am not technical enough for this role') and test it: Is this an all-or-nothing statement? Am I mind-reading what others think? Am I discounting evidence that contradicts this claim? Am I confusing a learning curve with a permanent limitation? The imposter makes sweeping generalizations. Your job is to get specific.",
      },
    ],
    overflow_defaults: [
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Transforming Inner Critic", originator: "NVC adaptation", source: "NVC", file_ref: "02:127", duration_min: 5, modality: "relational" },
      { name: "Cognitive Defusion", originator: "Hayes", source: "ACT", file_ref: "01:203", duration_min: 3, modality: "cognitive" },
      { name: "6 F's Parts Work", originator: "Schwartz", source: "IFS", file_ref: "04:54", duration_min: 5, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Imposter Pattern Analysis",
      originator: "Young / Burns / Clance & Imes",
      source_ref: "01:burns",
      example: "If journal shows self-doubt: identifies the imposter type, tests the specific claim against Burns' distortion categories, and separates legitimate learning curve from distorted self-assessment.",
    },
    micro_content: "The imposter is not evidence of incompetence. It is evidence that you are in a context where your competence has not yet been demonstrated. Every imposter type has a different trigger and a different cognitive distortion. Name the type to break the generalization. (Young; Clance & Imes; Burns.)",
    system_notes: "More comprehensive than JETSTREAM's brief imposter exercise. Five types with behavioral mapping.",
    is_onboarding: false,
  },
  {
    day_number: 19,
    week_number: 3,
    title: "First Friction",
    territory: "Navigating disagreement, values-based response, separating signal from noise",
    seed_prompts: [
      { prompt: "Where has your first real friction shown up — manager, peer, culture, expectations, yourself?", purpose: "Name the friction" },
      { prompt: "What is the friction actually about? Not what it looks like. What it is.", purpose: "Identify root cause" },
      { prompt: "Which saboteur activated when the friction hit?", purpose: "Track saboteur under friction" },
    ],
    coaching_exercises: [
      {
        name: "Navigating Friction From Values",
        duration_min: 5,
        custom_framing: "By the third week in a new role, some kind of friction usually shows up — a disagreement with your manager, a misunderstanding with a colleague, a cultural norm that rubs you the wrong way, or expectations that do not match reality. Friction is not a sign that something is wrong. It is information. The question is how to respond to it thoughtfully instead of reactively.\\n\\nStart by naming the friction clearly: what happened, who was involved, and how it felt. Then look at it through four lenses:\\n\\n(1) Cultural lens — Is this friction actually a cultural gap? For example, you might be used to giving direct feedback, but this culture wraps it. The friction is not personal — it is a translation error. Is this a political dynamic (someone protecting territory) or a genuine disagreement on substance? (2) Saboteur lens — Which of your protective patterns from Day 3 got activated? For example, did the Controller want to take charge? Did the Pleaser want to smooth it over? Did the Avoider want to pretend it did not happen? Your saboteur will push you toward a response that feels urgent but may not be wise. (3) Values lens — Does this friction touch one of your non-negotiables from Day 12, or is it something flexible? Not every friction requires a stand. (4) Communication lens — If you do need to take action, how would you frame it? A useful structure: state what you observed (facts, not interpretations), share the impact on you, say what you need, and make a specific request.\\n\\nFinally, decide: Does this need action now (a conversation, a boundary, a clarification)? Or does it need more observation (more data needed, too early to act)? Your saboteur will almost always tell you it is urgent. The situation usually has a longer timeline than your anxiety suggests.",
      },
    ],
    overflow_defaults: [
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Friction Navigation Analysis",
      originator: "Rosenberg / David",
      source_ref: "02:nvc",
      example: "If journal shows friction: applies four lenses systematically. Is this a cultural misread, a saboteur-driven reaction, a values violation, or a communication gap?",
    },
    micro_content: "Friction is data, not failure. The question is not how to avoid it — it is how to respond to it from alignment rather than from reactivity. (Rosenberg, NVC; David, Emotional Agility.)",
    system_notes: "General-purpose friction framework. Different from JETSTREAM's PIP-specific friction navigation.",
    is_onboarding: false,
  },
  {
    day_number: 20,
    week_number: 3,
    title: "Week 3 Reflection",
    territory: "Three weeks in, what you know now, what you would tell yourself on day one",
    seed_prompts: [
      { prompt: "Three weeks in. What do you know that you couldn't have known from outside?", purpose: "Track learning" },
      { prompt: "What would you tell yourself on offer-acceptance day that you know now?", purpose: "Measure growth" },
      { prompt: "Where are you most proud of how you showed up? Where do you wish you had done differently?", purpose: "Honest self-assessment" },
    ],
    coaching_exercises: [
      {
        name: "Week 3 Integration",
        duration_min: 3,
        custom_framing: "Week 3 was about action — moving from observing and relationship-building into actually contributing and communicating in your new environment. This reflection asks you to look across everything that happened and find the through-line.\\n\\nReview what you worked on this week: the early wins you selected (and whether they met the four criteria), whether your contributions came from a grounded or anxious place (creative vs. reactive), how you calibrated your communication for this culture, how imposter syndrome showed up and what you did with it, and how you handled your first real friction. Now step back and look at the whole picture: What is the theme of your Week 3? What pattern is emerging in how you navigate this transition? Are there moments where you were genuinely proud of how you showed up? Are there moments where you can see your old protective patterns running the show? What is the single most important insight from this week that you want to carry into Week 4?",
      },
    ],
    overflow_defaults: [
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Week 3 Pattern Synthesis",
      originator: "Program Architecture",
      source_ref: "basecamp:w3",
      example: "Synthesizes action-phase data. How is the client contributing? Where are patterns helping vs. hindering?",
    },
    micro_content: "You have crossed from observer to participant. Contributions are being received, communication is being calibrated, and patterns are being tested by real stakes.",
    system_notes: "Reflection day before calibration week.",
    is_onboarding: false,
  },
  {
    day_number: 21,
    week_number: 3,
    title: "Progress Check",
    territory: "Honest stock-taking, forward momentum, relationship inventory",
    seed_prompts: [
      { prompt: "What are you most proud of in how you have shown up over three weeks?", purpose: "Acknowledge progress" },
      { prompt: "Where do you wish you had done things differently?", purpose: "Honest self-assessment" },
      { prompt: "Which relationship needs the most attention going into Week 4?", purpose: "Prioritize relational work" },
    ],
    coaching_exercises: [
      {
        name: "Progress Assessment",
        duration_min: 3,
        custom_framing: "After Day 3, the system generated a set of goals for your transition based on your disruption ratings, values, and patterns. This exercise is an honest check-in on how those goals are going.\\n\\nPull up your goals and rate your progress on each one — you can use a simple scale like 'strong progress,' 'some movement,' 'stalled,' or 'not started.' For each goal, ask: What accelerated progress — was it a specific action, a relationship, a shift in your mindset? What stalled — was it circumstance, avoidance, or something you could not have predicted? Have any new goals emerged that were not in the original set? Sometimes the most important goals only become visible once you are inside the role.\\n\\nFinally, looking at the full picture, identify one focus for Week 4. Not five things. One. What is the single most important area to give your attention to in the final week of this program? Choose something where focused effort in the next seven days would make a real difference.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Goal Progress Analysis",
      originator: "Program Architecture",
      source_ref: "basecamp:goals",
      example: "Maps journal themes against stated goals. Where is movement? Where is avoidance? What does the gap reveal about the client's transition process?",
    },
    micro_content: "Three weeks of structured observation, relationship-building, and deliberate action. The foundation is set. Week 4 is about calibrating what you have built and building practices that outlast the program.",
    system_notes: "End of Week 3. Transition to calibration and sustainability.",
    is_onboarding: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 4: CALIBRATE — Adjust, Integrate, Sustain
  // ═══════════════════════════════════════════════════════════════
  {
    day_number: 22,
    week_number: 4,
    title: "The Seven Disruptions — Revisited",
    territory: "Reassessment, what shifted, what didn't, what surprised you",
    seed_prompts: [
      { prompt: "Return to your Day 1 disruption ratings. Rate each again. What changed?", purpose: "Measure disruption shifts" },
      { prompt: "Which disruption resolved faster than expected? Which is stickier than expected?", purpose: "Track resolution patterns" },
      { prompt: "Have any new disruptions emerged that you didn't anticipate?", purpose: "Surface new challenges" },
    ],
    coaching_exercises: [
      {
        name: "Seven Disruptions Reassessment",
        duration_min: 5,
        custom_framing: "On Day 1, you rated seven areas of disruption that a new role creates — from competence confidence to routine and rhythm. Three weeks have passed. This exercise asks you to rate each one again and compare the two scores side by side.\\n\\nGo through the same seven areas and rate each from 1 (barely affected) to 10 (strongly affected): Competence confidence, Social belonging, Cultural fluency, Identity continuity, Clarity of expectations, Routine and rhythm, Authority and credibility. Then compare your Day 1 ratings to today's ratings for each area.\\n\\nAs you compare, notice: Which disruptions have improved the most? What drove that improvement — was it something you did deliberately, or did time and familiarity do the work? Which disruptions are stickier than expected — still high despite three weeks of effort? Which surprises are there — maybe something you rated low on Day 1 is now higher because the reality of the role revealed challenges you did not anticipate? The point is not that all scores should be lower. Some disruptions resolve through action, some through time, and some need specific attention that you may not have given them yet. Knowing which is which helps you focus your energy in the final week.",
      },
    ],
    overflow_defaults: [
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Disruption Trajectory Analysis",
      originator: "Program Architecture",
      source_ref: "basecamp:disruptions",
      example: "Compares Day 1 and Day 22 disruption ratings. What does the trajectory tell us about the client's transition? Which disruptions need continued attention?",
    },
    micro_content: "Progress is not linear or uniform. You may have resolved the competence confidence disruption while the cultural fluency disruption deepens. That is normal. (Bridges, Transitions.)",
    system_notes: "Recalibration point. Data from here informs remaining days.",
    is_onboarding: false,
  },
  {
    day_number: 23,
    week_number: 4,
    title: "The Neutral Zone",
    territory: "Bridges' developmental phase, identity between versions, stress/security",
    seed_prompts: [
      { prompt: "Do you feel like you belong yet? Or is there a low-grade hum of not-quite-there?", purpose: "Assess belonging" },
      { prompt: "Are you operating from your secure self — open, flexible, experimenting — or your stressed self — rigid, reactive, defended?", purpose: "State assessment" },
      { prompt: "What shifts you between secure and stressed? Be specific.", purpose: "Map triggers" },
    ],
    coaching_exercises: [
      {
        name: "Naming the Neutral Zone",
        duration_min: 5,
        custom_framing: "By Week 4 of a new role, many people feel a strange in-between sensation — you are no longer the outsider who just arrived, but you do not fully feel like you belong either. Transition researcher William Bridges calls this the 'neutral zone.' It is a normal developmental phase between your old professional identity and the new one that is forming. Common signs include: inconsistent confidence (great one day, shaky the next), heightened sensitivity to social signals (reading too much into a short email or an uninvited meeting), a persistent feeling of being behind, and uncertainty about who you are in this context.\\n\\nThis exercise also introduces a useful framework from the Enneagram tradition: the stress-security dynamic. When you feel secure — psychologically safe, supported, clear on expectations — you tend to be open, flexible, curious, and willing to experiment. When you feel stressed — threatened, uncertain, evaluated — you tend to become rigid, reactive, and saboteur-driven. Both states are normal. The key is recognizing which state you are in and what triggers the shift.\\n\\nYour task: First, describe where you are in the neutral zone right now. Do you feel closer to belonging or closer to outsider? Then map your stress-security triggers: What specific situations, people, or moments shift you into your secure self? What shifts you into your stressed self? Name at least three triggers for each. This awareness is what allows you to deliberately move toward security rather than waiting for it to happen.",
      },
    ],
    overflow_defaults: [
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Neutral Zone Analysis",
      originator: "Bridges / Enneagram",
      source_ref: "07:bridges",
      example: "If journal shows oscillating confidence: normalizes it as neutral zone. Maps stress/security triggers. What moves the client toward growth vs. reactivity?",
    },
    micro_content: "The neutral zone is not a problem to solve. It is a developmental phase to be in. You are between versions of yourself. That is uncomfortable and it is exactly where growth happens. (Bridges, Transitions; Enneagram stress/security framework.)",
    system_notes: "Normalizing exercise. Many clients feel they should be further along by now.",
    is_onboarding: false,
  },
  {
    day_number: 24,
    week_number: 4,
    title: "Updating Your Maps",
    territory: "Map revision with lived data, cultural accuracy, power shifts, relationships",
    seed_prompts: [
      { prompt: "Your Week 1 cultural read — what was right? What was wrong? What norms are only now visible?", purpose: "Revise cultural map" },
      { prompt: "Who turned out more or less influential than you expected?", purpose: "Update power map" },
      { prompt: "Which relationship have you been avoiding? What is the cost of avoiding it?", purpose: "Identify relational gap" },
    ],
    coaching_exercises: [
      {
        name: "Map Revision",
        duration_min: 5,
        custom_framing: "In the first two weeks, you built several maps of your new environment — a cultural read (Day 4), a stakeholder map (Day 5), and a power/influence map (Day 9). Those maps were based on limited information. Now, with three weeks of lived experience, it is time to update them with what you actually know.\\n\\nThis exercise has three parts. Part 1 — Cultural Map Revision: Return to your Day 4 cultural dimensions work. Which of your initial reads were accurate? Which were off? What cultural norms are only visible now that you have been inside the system for a few weeks — the unwritten rules about email response times, how disagreements are handled, who really makes decisions, what gets rewarded versus what gets praised? Part 2 — Power and Influence Revision: Return to your Day 9 power mapping. Who turned out to be more influential than you expected? Less? Where have alliances shifted? Where do you sit in the constellation now compared to three weeks ago — closer to the center or still on the edges? Part 3 — Relationship Inventory: Which of your key relationships are working well? Which need more attention? Where is trust building naturally, and where is it stalled? Is there a conversation you have been avoiding — and what is the cost of continuing to avoid it?\\n\\nThe point of this exercise is not to get everything right. It is to practice updating your understanding with real data instead of clinging to first impressions.",
      },
    ],
    overflow_defaults: [
      { name: "Multiple Perspectives Exercise", originator: "CBT/systemic", source: "CBT", file_ref: "01:225", duration_min: 5, modality: "cognitive" },
      { name: "Staying on Your Side of the Net", originator: "Bradford & Robin", source: "IPD/Stanford", file_ref: "02:214", duration_min: 2, modality: "relational" },
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "Somatic Grounding", originator: "Levine/Ogden", source: "Sensorimotor", file_ref: "03:122", duration_min: 1, modality: "somatic" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Map Accuracy Analysis",
      originator: "Molinsky / Meyer / Pfeffer / Fridjhon",
      source_ref: "07:revision",
      example: "Compares initial and revised maps. Where was the initial read accurate? Where did it miss? What does the revision reveal about the client's growing understanding?",
    },
    micro_content: "First read is always partial. The point is not to get it right — it is to have something to update. Three weeks of lived data makes the second read significantly more accurate. (Molinsky; Meyer; Pfeffer; Fridjhon & Fuller.)",
    system_notes: "Revision exercise. Specific to having created the original maps on Days 4, 9.",
    is_onboarding: false,
  },
  {
    day_number: 25,
    week_number: 4,
    title: "Relationship and Values Alignment Audit",
    territory: "Values drift check, authenticity-adaptation update, relational audit",
    seed_prompts: [
      { prompt: "Return to your Day 2 operational values. Where have you been acting from them? Where have you drifted?", purpose: "Values accountability" },
      { prompt: "Are your Day 12 adaptations sustainable, or are some starting to cost more than expected?", purpose: "Adaptation sustainability" },
      { prompt: "How is this transition landing at home? What are the people closest to you experiencing?", purpose: "Relational impact check" },
    ],
    coaching_exercises: [
      {
        name: "Values Alignment Check + Relational Audit",
        duration_min: 5,
        custom_framing: "This exercise checks two things that often drift without you noticing during a transition: your values and your relationships outside work.\\n\\nPart 1 — Values Alignment Check: Return to the operational values you wrote on Day 2 — the commitments you made about how you would show up in specific situations. For each one, ask: Has this value been tested yet? If so, did you hold the line or did you drift? Was the drift conscious (a deliberate compromise you chose) or unconscious (you did not notice until afterward)? Is the drift accumulating a cost — in your self-respect, your energy, your sense of who you are here? Also revisit the authenticity-adaptation map from Day 12. Which of your adaptations are sustainable, and which are starting to feel like they cost more than they are worth?\\n\\nPart 2 — Relational Audit: Job transitions do not just affect the person in the new role — they affect everyone around them. Using the Gottman framework, check in on your closest relationships. Are any of the Four Horsemen showing up — criticism, contempt, defensiveness, or stonewalling? When the people closest to you make bids for your attention or connection, are you turning toward them or turning away? If you live alone, check for isolation: Are you withdrawing from friendships or social connections because the new role is consuming all your energy? Name what is happening honestly. Transitions strain relationships in predictable ways — catching it early is much easier than repairing it later.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "Blending Check", originator: "Schwartz", source: "IFS", file_ref: "04:17", duration_min: 1, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Values-Relationship Alignment Analysis",
      originator: "Gottman / Molinsky",
      source_ref: "02:gottman",
      example: "If journal touches relationships: identifies which Horseman is showing up, tracks bids for connection. Connects values drift to relational strain.",
    },
    micro_content: "Values drift is usually unconscious. The cost accumulates before you notice. The relational audit ensures the transition is not happening at the expense of the people closest to you. (Gottman; Molinsky.)",
    system_notes: "Combines values and relational work. Authenticity-adaptation map gets first real-world audit.",
    is_onboarding: false,
  },
  {
    day_number: 26,
    week_number: 4,
    title: "Saboteurs and Patterns — What Held and What Shifted",
    territory: "Pattern review with four weeks of data, creative competencies, center balance",
    seed_prompts: [
      { prompt: "Which saboteur has been most persistent over four weeks? Where did you catch it and choose differently?", purpose: "Track saboteur evolution" },
      { prompt: "Your Day 3 reactive tendency — where did it show up? Where did you operate from creative competencies instead?", purpose: "Assess creative growth" },
      { prompt: "Which center of intelligence have you been neglecting? What would it offer?", purpose: "Balance centers" },
    ],
    coaching_exercises: [
      {
        name: "Pattern Review",
        duration_min: 5,
        custom_framing: "On Day 3, you identified your protective patterns — your saboteurs, your default intelligence center (thinking, feeling, or doing), and your reactive tendency (comply, protect, or control). That was based on self-knowledge and past experience. Now you have four weeks of real data in a new environment. This exercise reviews those patterns with the evidence of how they actually showed up.\\n\\nSaboteur review: Which saboteur has been most active over the past four weeks? What has it cost you — missed opportunities, strained relationships, energy wasted on the wrong things? Were there moments when you caught the saboteur in real time and chose a different response? What made that possible? Reactive tendency review: Did the reactive pattern you identified on Day 3 (comply, protect, or control) dominate your first month? When was it genuinely helpful — protecting you when you needed protection, or helping you navigate a tricky situation? When did it overstay its welcome — keeping you in a defensive posture when the situation no longer required it? Center review: Which intelligence center have you been leading with — thinking, feeling, or doing? Has the balance shifted since Day 3? Are you starting to access the center you were neglecting? Creative competencies: Were there moments when you operated from genuine openness, curiosity, or courage rather than from reactivity? What conditions made that possible — safety, preparation, a relationship, a conscious choice?\\n\\nThe goal is not to eliminate your patterns. It is to see them clearly enough that you can choose when to use them and when to try something different.",
      },
    ],
    overflow_defaults: [
      { name: "Saboteur Check + PQ Reps", originator: "Chamine", source: "Positive Intelligence", file_ref: "01:394", duration_min: 5, modality: "cognitive" },
      { name: "6 F's Parts Work", originator: "Schwartz", source: "IFS", file_ref: "04:54", duration_min: 5, modality: "integrative" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Prediction Process", originator: "BEabove / Barrett", source: "BEabove", file_ref: "01:61", duration_min: 3, modality: "cognitive" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
    ],
    framework_analysis_default: {
      name: "Pattern Evolution Analysis",
      originator: "Chamine / Anderson & Adams / Enneagram",
      source_ref: "01:394",
      example: "Tracks saboteur activation patterns across 4 weeks. Where is the gap between activation and awareness shortening? Where is the client choosing creative over reactive?",
    },
    micro_content: "The gap between activation and awareness shortens with practice. Four weeks is enough to see the pattern clearly. It is not enough to eliminate it. But seeing it clearly is the precondition for choosing differently. (Chamine; Anderson & Adams; Enneagram tradition.)",
    system_notes: "Deepening exercise. Requires four weeks of journal data for meaningful analysis.",
    is_onboarding: false,
  },
  {
    day_number: 27,
    week_number: 4,
    title: "Building the Forward Practice",
    territory: "Sustainable habits, minimum viable practice, what continues beyond Day 30",
    seed_prompts: [
      { prompt: "What from this program will you realistically continue? Be honest — not aspirational.", purpose: "Assess sustainability" },
      { prompt: "What habit or practice has been most useful? What would you drop?", purpose: "Identify highest-value practices" },
      { prompt: "Where do you need support that goes beyond what this program provides?", purpose: "Identify next steps" },
    ],
    coaching_exercises: [
      {
        name: "Sustainable Practice Design (New Role Version)",
        duration_min: 5,
        custom_framing: "This program ends at Day 30, but your transition does not. Research suggests it takes 6 to 12 months to fully land in a new role. The question is: what practices from the last four weeks are worth keeping, and what is the minimum you need to maintain awareness without it feeling like a second job?\\n\\nThis exercise asks you to design a sustainable forward practice built around four habits. Habit 1 — Weekly Self-Check-In (15 minutes): Once a week, sit down and ask yourself three questions: Which saboteur was most active this week? Where did my values drift? Which relationship needs my attention? This is not journaling — it is a quick, honest scan. Habit 2 — Pre-Meeting Pause (60 seconds): Before any meeting that matters, take one minute to name the saboteur most likely to show up, identify what you actually need from the meeting, and ground yourself with three breaths. This tiny practice changes how you walk into a room. Habit 3 — Monthly Map Update (30 minutes): Once a month, revisit your cultural map, power map, and relationship constellation. What shifted? Who gained or lost influence? Where are the new unwritten rules? This keeps your understanding current instead of frozen at Week 2. Habit 4 — Level 3 Listening (one meeting per week): Choose one meeting each week where you deliberately practice Level 3 listening — noticing what is not being said, reading the energy in the room, catching the subtext. Afterward, write down one thing you noticed that you would have missed at Level 1.\\n\\nFour habits. That is the minimum viable practice. Everything else from this program is optional going forward. If you can only do one, do the weekly check-in.",
      },
    ],
    overflow_defaults: [
      { name: "Values Clarification", originator: "Hayes / ACT", source: "ACT", file_ref: "01:130", duration_min: 5, modality: "cognitive" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Body Scan", originator: "Kabat-Zinn", source: "MBSR", file_ref: "07:418", duration_min: 3, modality: "somatic" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "IFS Daily Check-in", originator: "Schwartz", source: "IFS", file_ref: "04:9", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Practice Sustainability Analysis",
      originator: "Program Architecture",
      source_ref: "basecamp:forward",
      example: "Assesses which practices the client is likely to maintain. Recommends minimum viable practice based on their engagement patterns and highest-value exercises.",
    },
    micro_content: "Four habits. That is the minimum viable practice. Weekly check-in, pre-meeting pause, monthly map update, and one Level 3 listening session per week. Everything else is optional. (Original design integrating program frameworks.)",
    system_notes: "Sustainability design. Keep it realistic.",
    is_onboarding: false,
  },
  {
    day_number: 28,
    week_number: 4,
    title: "What's Still Unresolved",
    territory: "Open threads, honest inventory, what needs support beyond this program",
    seed_prompts: [
      { prompt: "What remains unresolved — a difficult relationship, a cultural gap, an expectation mismatch, an imposter pattern, a values tension?", purpose: "Name open threads" },
      { prompt: "Which of these needs more time, and which needs a specific resource — coach, therapist, mentor, colleague?", purpose: "Triage support needs" },
      { prompt: "What impact is this transition having on your life outside work that you have not addressed?", purpose: "Check life impact" },
    ],
    coaching_exercises: [
      {
        name: "Honest Inventory of Open Threads",
        duration_min: 5,
        custom_framing: "Not everything resolves in 30 days. Transitions take 6 to 12 months, and honest acknowledgment of what is still unfinished is more useful than pretending everything is handled. This exercise asks you to name your open threads — clearly and without judgment.\\n\\nWrite down everything that remains unresolved. This might include: a difficult relationship with a colleague or manager, a cultural gap you still have not figured out how to navigate, an expectation mismatch between what was promised and what is real, an imposter pattern that still gets triggered, a values tension between who you are and what the culture seems to require, or something in your personal life that this transition has disrupted. For each open thread, categorize it: Does it need more time (it is actively resolving and just needs patience)? Does it need a specific resource — a coach, a therapist, a mentor, a trusted colleague? Does it need a conversation you have been avoiding? Or does it need continued practice with the tools from this program? Finally, honestly assess the impact on your life outside work. Are you sleeping well? Are your closest relationships getting the attention they need? Is your body telling you something you have been ignoring? The goal is not to solve everything today. It is to see what is open so you can make deliberate choices about what to do next.",
      },
    ],
    overflow_defaults: [
      { name: "Check the Facts", originator: "Linehan", source: "DBT", file_ref: "01:171", duration_min: 3, modality: "cognitive" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Open Threads Analysis",
      originator: "Program Architecture",
      source_ref: "basecamp:threads",
      example: "Identifies unresolved themes across the full journal arc. Categorizes by type and recommended next step.",
    },
    micro_content: "Open threads at Day 30 are expected. Transitions take 6-12 months. The program builds the foundation. What you do with it beyond Day 30 determines the trajectory. (Watkins; Bridges.)",
    system_notes: "Honest assessment. Not everything resolves in 30 days.",
    is_onboarding: false,
  },
  {
    day_number: 29,
    week_number: 4,
    title: "Full Review",
    territory: "30-day summary, pattern shifts, letter to future self",
    seed_prompts: [
      { prompt: "Read the system-generated 30-day summary. What resonates? What surprises you?", purpose: "Review and integrate" },
      { prompt: "What do you know now about how you navigate new environments?", purpose: "Extract learning" },
      { prompt: "What do you want the person you will be at Day 90 to remember?", purpose: "Future self wisdom" },
    ],
    coaching_exercises: [
      {
        name: "Letter to Day 90",
        duration_min: 5,
        custom_framing: "Before this exercise, the system generates a comprehensive 30-day summary of your entire journey — the themes that emerged across your journal entries, how your patterns shifted, how your understanding of the culture evolved, how your key relationships developed, your progress on each coaching goal, and the open threads that remain. Read that summary carefully before continuing.\\n\\nNow, write a letter to the person you will be at Day 90 — two months from now. This is not a goal-setting exercise or a motivational pep talk. It is a letter from someone who has just spent 30 days in structured self-awareness to someone who will be deeper into the role but further from this level of reflection. In your letter, address: What do you now know about how you navigate new environments — your patterns, your strengths, your blind spots? What tools from this program will you carry forward, and how will you use them? What specific patterns should Day-90-you watch for when pressure increases — which saboteur, which reactive tendency, which values are most likely to drift? What do you want them to remember about who you are underneath the role?\\n\\nWrite it as if you are speaking to a future version of yourself who might need a reminder of what you learned when things were fresh and clear.",
      },
    ],
    overflow_defaults: [
      { name: "Narrative Reframe", originator: "White & Epston", source: "Narrative Therapy", file_ref: "01:328", duration_min: 5, modality: "cognitive" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "Self-Connection Practice", originator: "NVC", source: "NVC", file_ref: "02:26", duration_min: 3, modality: "relational" },
    ],
    framework_analysis_default: {
      name: "Full Arc Analysis",
      originator: "Program Architecture",
      source_ref: "basecamp:review",
      example: "Comprehensive analysis of the 30-day arc. What patterns emerged? What shifted? What is the client's transition signature?",
    },
    micro_content: "Thirty days builds the foundation. Real integration takes 6-12 months. The letter to Day 90 is not aspirational — it is your own voice, informed by four weeks of structured self-awareness, telling you what you know.",
    system_notes: "System generates comprehensive 30-day summary for review.",
    is_onboarding: false,
  },
  {
    day_number: 30,
    week_number: 4,
    title: "Where You Are",
    territory: "One-sentence capture, disruptions revisited, program close",
    seed_prompts: [
      { prompt: "Revisit the seven disruptions one final time with your Day 29 summary. What is different? What is the same?", purpose: "Final baseline comparison" },
      { prompt: "Write one sentence that captures where you are today. Not where you wish you were. Where you are.", purpose: "Honest present-state capture" },
      { prompt: "What is the one thing you will take from this month into the rest of your time in this role?", purpose: "Distill the takeaway" },
    ],
    coaching_exercises: [
      {
        name: "One-Sentence Capture",
        duration_min: 3,
        custom_framing: "This is the final exercise of the program, and it asks for two things: radical honesty and a clean comparison.\\n\\nFirst, write one sentence that captures where you are in this transition right now. Not where you wish you were. Not where you think you should be. Not a summary of what you learned. Just one honest sentence about where you are today. This is harder than it sounds — most people want to wrap the experience in a narrative. Resist that. One sentence. Present tense.\\n\\nSecond, return to the seven disruptions one final time. Rate each area from 1 to 10: Competence confidence, Social belonging, Cultural fluency, Identity continuity, Clarity of expectations, Routine and rhythm, Authority and credibility. Now compare three data points: your Day 1 ratings (your starting point), your Day 22 ratings (your mid-program reassessment), and today's Day 30 ratings. Where did the biggest shifts happen? Were any shifts surprising — areas that improved more than expected, or areas that are stickier than you thought? Are there disruptions that actually increased — sometimes deeper self-awareness temporarily makes things feel harder before they feel better?\\n\\nThis comparison is not a report card. It is a record of movement. Some areas will have shifted significantly. Others will need more time. Both are expected. The foundation is set. What you do with it from here is up to you.",
      },
    ],
    overflow_defaults: [
      { name: "Narrative Reframe", originator: "White & Epston", source: "Narrative Therapy", file_ref: "01:328", duration_min: 5, modality: "cognitive" },
      { name: "RAIN Practice", originator: "Tara Brach", source: "Mindfulness", file_ref: "03:477", duration_min: 5, modality: "somatic" },
      { name: "Mourn-Celebrate-Learn", originator: "NVC", source: "NVC", file_ref: "02:63", duration_min: 5, modality: "relational" },
      { name: "Wheel of Life Check-In", originator: "Co-Active", source: "CTI", file_ref: "04:118", duration_min: 3, modality: "integrative" },
      { name: "8 C's Self-Energy Scan", originator: "Schwartz", source: "IFS", file_ref: "04:31", duration_min: 2, modality: "integrative" },
    ],
    framework_analysis_default: {
      name: "Transition State Assessment",
      originator: "Bridges / Watkins",
      source_ref: "07:bridges",
      example: "Final assessment of where the client stands in their transition. What has landed? What is still in motion? Where does the trajectory point?",
    },
    micro_content: "Thirty days. Foundation set. The daily prompt cadence stops. The container remains. You retain access to journal history, pattern data, and the tools that worked. The transition continues. You are more equipped for it now than you were on Day 1.",
    system_notes: "Program close. Container remains for continuation subscribers.",
    is_onboarding: false,
  },
];

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding BASECAMP (new_role) program...\n");

  // 1. Upsert program
  const { data: program, error: progErr } = await supabase
    .from("programs")
    .upsert(BASECAMP_PROGRAM, { onConflict: "slug" })
    .select()
    .single();

  if (progErr) {
    console.error("Program upsert failed:", progErr.message);
    process.exit(1);
  }

  console.log(`Program upserted: ${program.name} (${program.id})\n`);

  // 2. Upsert each day
  let ok = 0;
  for (const day of days) {
    const { error } = await supabase.from("program_days").upsert(
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

    if (error) {
      console.error(`Day ${day.day_number} failed:`, error.message);
    } else {
      ok++;
      console.log(`  Day ${day.day_number}: ${day.title}`);
    }
  }

  console.log(`\nDone. ${ok}/${days.length} days seeded.`);
}

main().catch(console.error);
