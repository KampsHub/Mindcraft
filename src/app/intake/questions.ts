// ── Universal intake questions ──────────────────────────────────────
// These apply to every client regardless of package.
// Grouped by the insight they unlock for the coaching system.

export const universalQuestions = [
  // ── Values & Motivation ──
  {
    id: "values_decision",
    category: "Values",
    question:
      "Think of a decision you made recently that felt right — even if it was hard. What made it feel right?",
    type: "textarea" as const,
  },
  {
    id: "values_alive",
    category: "Values",
    question: "When have you felt most alive in the last year?",
    type: "textarea" as const,
  },
  {
    id: "values_rank",
    category: "Values",
    question:
      "Rank these in order of importance to you (drag or number 1–7):",
    type: "ranking" as const,
    options: [
      "Autonomy",
      "Belonging",
      "Achievement",
      "Security",
      "Growth",
      "Impact",
      "Creativity",
    ],
  },
  {
    id: "values_cost",
    category: "Values",
    question:
      "What's a value you hold that sometimes costs you — at work or in relationships?",
    type: "textarea" as const,
  },

  // ── Family of Origin ──
  {
    id: "family_climate",
    category: "Family of Origin",
    question:
      "Describe the emotional climate of your family growing up. What was the general atmosphere?",
    type: "textarea" as const,
  },
  {
    id: "family_rewarded",
    category: "Family of Origin",
    question:
      "What was rewarded in your family? What was punished or ignored?",
    type: "textarea" as const,
  },
  {
    id: "family_conflict",
    category: "Family of Origin",
    question: "How did your family handle conflict and strong emotions?",
    type: "textarea" as const,
  },
  {
    id: "family_message",
    category: "Family of Origin",
    question:
      "What's a message you absorbed growing up that you're still carrying — even if you know it's not fully true?",
    type: "textarea" as const,
  },

  // ── Identity & Self-Concept ──
  {
    id: "identity_three_words",
    category: "Identity",
    question: "How would you describe yourself in three words?",
    type: "short" as const,
  },
  {
    id: "identity_others",
    category: "Identity",
    question: "How would the people closest to you describe you?",
    type: "short" as const,
  },
  {
    id: "identity_afraid",
    category: "Identity",
    question:
      "What's the version of yourself you're most afraid of being?",
    type: "textarea" as const,
  },
  {
    id: "identity_most_yourself",
    category: "Identity",
    question: "Where do you feel most like yourself? Least?",
    type: "textarea" as const,
  },

  // ── Relationship Patterns ──
  {
    id: "relationship_status",
    category: "Relationships",
    question:
      "Are you currently in a significant relationship? If so, how long?",
    type: "short" as const,
  },
  {
    id: "relationship_pattern",
    category: "Relationships",
    question:
      "What's a recurring tension or pattern in your closest relationships?",
    type: "textarea" as const,
  },
  {
    id: "relationship_hurt",
    category: "Relationships",
    question:
      "When you feel hurt or disconnected, what do you typically do — move toward the person, pull away, or push back?",
    type: "select" as const,
    options: ["Move toward", "Pull away", "Push back", "It depends"],
  },
  {
    id: "relationship_ask",
    category: "Relationships",
    question:
      "What's the hardest thing for you to ask for in a relationship?",
    type: "textarea" as const,
  },

  // ── Inner Critics & Saboteurs ──
  {
    id: "saboteur_voice",
    category: "Inner Patterns",
    question:
      "When things go well, what's the voice in your head that tries to undermine it? What does it say?",
    type: "textarea" as const,
  },
  {
    id: "saboteur_stress",
    category: "Inner Patterns",
    question:
      "What do you tend to do when you're under stress?",
    type: "select" as const,
    options: [
      "Over-control / micromanage",
      "Withdraw / go silent",
      "Perform / people-please",
      "Intellectualise / avoid feeling",
      "Other",
    ],
  },
  {
    id: "saboteur_pattern",
    category: "Inner Patterns",
    question:
      "What's a pattern you know isn't serving you but keep repeating?",
    type: "textarea" as const,
  },

  // ── Work & Professional Context ──
  {
    id: "work_current",
    category: "Work",
    question: "What do you do, and how did you end up there?",
    type: "textarea" as const,
  },
  {
    id: "work_best_environment",
    category: "Work",
    question:
      "What's the best professional environment you've ever been in? What made it work?",
    type: "textarea" as const,
  },
  {
    id: "work_proud",
    category: "Work",
    question:
      "What's a professional moment you're genuinely proud of?",
    type: "textarea" as const,
  },

  // ── Goals & Current Context ──
  {
    id: "goals_why_now",
    category: "Goals",
    question:
      "What's happening in your life right now that made you seek coaching?",
    type: "textarea" as const,
  },
  {
    id: "goals_six_months",
    category: "Goals",
    question:
      "If this process works, what's different in 6 months?",
    type: "textarea" as const,
  },
  {
    id: "goals_tried",
    category: "Goals",
    question: "What have you already tried?",
    type: "textarea" as const,
  },
];

// ── Package-specific questions ─────────────────────────────────────

export const packageQuestions: Record<string, typeof universalQuestions> = {
  parachute: [
    {
      id: "layoff_timeline",
      category: "Layoff Context",
      question: "When did the layoff happen, and how much notice did you get?",
      type: "short",
    },
    {
      id: "layoff_identity",
      category: "Layoff Context",
      question:
        "How much of your identity was tied to your role or company? What feels different about you now that it's gone?",
      type: "textarea",
    },
    {
      id: "layoff_narrative",
      category: "Layoff Context",
      question:
        "What's the story you're telling yourself about why this happened?",
      type: "textarea",
    },
    {
      id: "layoff_unsaid",
      category: "Layoff Context",
      question:
        "What's something about this experience you haven't said out loud to anyone yet?",
      type: "textarea",
    },
    {
      id: "layoff_fear",
      category: "Layoff Context",
      question:
        "What are you most afraid of right now — financially, professionally, or personally?",
      type: "textarea",
    },
    {
      id: "layoff_opportunity",
      category: "Layoff Context",
      question:
        "Is there any part of you — even a small part — that feels relieved or sees an opportunity in this?",
      type: "textarea",
    },
  ],

  basecamp: [
    {
      id: "newrole_context",
      category: "New Role Context",
      question:
        "What is the context of this transition? Were you recruited, did you apply, is this an internal move, or are you returning from leave?",
      type: "textarea",
    },
    {
      id: "newrole_details",
      category: "New Role Context",
      question:
        "What is your new role? Include title, function, team size, and whether you are remote, hybrid, or in-person.",
      type: "textarea",
    },
    {
      id: "newrole_culture",
      category: "New Role Context",
      question:
        "What do you already know about the culture? What feels different from where you came from — pace, communication norms, hierarchy, how decisions get made?",
      type: "textarea",
    },
    {
      id: "newrole_manager",
      category: "New Role Context",
      question:
        "What are your first impressions of your manager? What do you think they need from you?",
      type: "textarea",
    },
    {
      id: "newrole_emotional",
      category: "New Role Context",
      question:
        "How would you describe your emotional starting point — excited, anxious, both, numb, cautious, relieved, pressured?",
      type: "textarea",
    },
    {
      id: "newrole_relationship",
      category: "New Role Context",
      question:
        "How is this transition affecting the people closest to you — partner, family, close friends? Where is the stress landing at home?",
      type: "textarea",
    },
  ],

  jetstream: [
    {
      id: "pip_timeline",
      category: "PIP Context",
      question:
        "When was the PIP issued? What preceded it — how was it delivered, and what is the formal duration?",
      type: "textarea",
    },
    {
      id: "pip_reasons",
      category: "PIP Context",
      question:
        "What are the stated reasons on the PIP document? Be as specific as you can — verbatim if possible.",
      type: "textarea",
    },
    {
      id: "pip_honest",
      category: "PIP Context",
      question:
        "Your honest assessment: which feedback is valid, which is political, and which you genuinely cannot tell?",
      type: "textarea",
    },
    {
      id: "pip_manager",
      category: "PIP Context",
      question:
        "Describe your manager relationship history. When did it shift? What did you notice? What did you ignore?",
      type: "textarea",
    },
    {
      id: "pip_financial",
      category: "PIP Context",
      question:
        "Financial runway: roughly how many months can you sustain current spending if you lost this income? Who knows about the PIP, and who is helping?",
      type: "textarea",
    },
    {
      id: "pip_relationship",
      category: "PIP Context",
      question:
        "How is this PIP affecting your partner, family, or close friendships? Where are you withdrawing? If single, where is isolation showing up?",
      type: "textarea",
    },
  ],
};

export const packages = [
  {
    id: "parachute",
    name: "Layoff Recovery",
    description:
      "Navigate the emotional, professional, and identity dimensions of job loss. Rebuild from a grounded place.",
  },
  {
    id: "jetstream",
    name: "Performance Improvement Plan",
    description:
      "Stay clear-headed during a PIP. Separate performance gaps from emotional spirals. Build optionality while meeting requirements.",
  },
  {
    id: "basecamp",
    name: "New Role",
    description:
      "Navigate the transition wave of a new job with strategic clarity and self-awareness. Read the culture, know your patterns, establish from alignment.",
  },
];
