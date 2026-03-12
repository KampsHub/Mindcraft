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
  layoff: [
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

  international_move: [
    {
      id: "move_where",
      category: "Move Context",
      question:
        "Where are you moving from and to? Is this your first international move?",
      type: "textarea",
    },
    {
      id: "move_leaving",
      category: "Move Context",
      question:
        "What are you leaving behind that matters most — people, routines, a version of yourself?",
      type: "textarea",
    },
    {
      id: "move_identity",
      category: "Move Context",
      question:
        "How do you think this move will change who you are — or who people see you as?",
      type: "textarea",
    },
    {
      id: "move_language",
      category: "Move Context",
      question:
        "Will you be operating in a second language? How does that affect how you show up?",
      type: "textarea",
    },
    {
      id: "move_relationship",
      category: "Move Context",
      question:
        "If you're moving with a partner or family, how is the move affecting your relationship dynamics?",
      type: "textarea",
    },
    {
      id: "move_grief",
      category: "Move Context",
      question:
        "What part of this transition are you not allowing yourself to grieve?",
      type: "textarea",
    },
  ],

  new_manager: [
    {
      id: "manager_context",
      category: "New Manager Context",
      question:
        "How long have you been in this role? Is this your first management position?",
      type: "short",
    },
    {
      id: "manager_surprise",
      category: "New Manager Context",
      question:
        "What has surprised you most about managing people — what nobody warned you about?",
      type: "textarea",
    },
    {
      id: "manager_authority",
      category: "New Manager Context",
      question:
        "How comfortable are you with authority? Do you tend to over-assert or under-assert when you have power?",
      type: "textarea",
    },
    {
      id: "manager_conflict",
      category: "New Manager Context",
      question:
        "What's the hardest conversation you've had to have as a manager — or the one you've been avoiding?",
      type: "textarea",
    },
    {
      id: "manager_model",
      category: "New Manager Context",
      question:
        "Who was the best manager you ever had? What specifically did they do that worked for you?",
      type: "textarea",
    },
    {
      id: "manager_identity",
      category: "New Manager Context",
      question:
        "What kind of manager do you want to be — and what kind are you afraid of becoming?",
      type: "textarea",
    },
  ],

  general: [
    {
      id: "general_stuck",
      category: "Growth Context",
      question:
        "Where do you feel most stuck right now — and how long have you felt that way?",
      type: "textarea",
    },
    {
      id: "general_wheel",
      category: "Growth Context",
      question:
        "Rate your satisfaction (1–10) in each area: Career, Relationships, Health, Fun, Personal Growth, Finances, Family, Spirituality.",
      type: "textarea",
    },
    {
      id: "general_pattern",
      category: "Growth Context",
      question:
        "If there's one thing you keep bumping into — the same kind of problem showing up in different contexts — what is it?",
      type: "textarea",
    },
    {
      id: "general_admire",
      category: "Growth Context",
      question:
        "Who do you admire — and what specifically do you admire about them?",
      type: "textarea",
    },
    {
      id: "general_courage",
      category: "Growth Context",
      question:
        "What would you do differently if you weren't afraid of the consequences?",
      type: "textarea",
    },
    {
      id: "general_ready",
      category: "Growth Context",
      question:
        "What do you think you already know about yourself that you haven't acted on yet?",
      type: "textarea",
    },
  ],
};

export const packages = [
  {
    id: "layoff",
    name: "Layoff Recovery",
    description:
      "Navigate the emotional, professional, and identity dimensions of job loss. Rebuild from a grounded place.",
  },
  {
    id: "international_move",
    name: "International Move",
    description:
      "Process the grief, excitement, and identity shifts that come with relocating across cultures.",
  },
  {
    id: "new_manager",
    name: "New Manager",
    description:
      "Develop your leadership identity, handle authority, and navigate the transition from peer to boss.",
  },
  {
    id: "general",
    name: "General Growth",
    description:
      "For anyone ready to look at their patterns, values, and growth edges — no specific life event required.",
  },
];
