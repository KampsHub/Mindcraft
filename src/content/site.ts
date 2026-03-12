/**
 * ✏️  ALL WEBSITE COPY LIVES HERE
 *
 * Edit the text below, push to git, and Vercel auto-deploys.
 * No need to touch any React code.
 */

export const content = {
  // ── Brand ──
  brand: {
    name: "Mindcraft Ninja",
    companyName: "All Minds on Deck LLC",
    companyUrl: "https://allmindsondeck.org",
  },

  // ── Header ──
  header: {
    signIn: "Sign in",
    cta: "Start free",
  },

  // ── Hero ──
  // To add a hero video: put your .mp4 file in /public/images/ and update heroVideo below.
  // To use a static image instead: set heroVideo to "" and set heroImage to your image path.
  hero: {
    headline: "You already know",
    headlineAccent: "what needs to change.",
    subheadline:
      "Mindcraft Ninja gives you the daily structure to actually do it. Journal, get reflections that see your real patterns, and do exercises from proven frameworks \u2014 personalised to you.",
    cta: "See how it works",
    heroVideo: "", // e.g. "/images/hero.mp4" — leave empty for no video
    heroImage: "", // e.g. "/images/hero.jpg" — fallback or standalone image
    heroPoster: "", // poster image for video (shown while loading)
  },

  // ── The Problem ──
  problem: {
    headline: "The problem isn't awareness.",
    points: [
      "You've done the therapy. Read the books. Had the breakthroughs.",
      "But insight without structure fades. The same loops run on autopilot.",
      "You don't need more awareness. You need a system that works with what you already know.",
    ],
  },

  // ── Who it's for ──
  audience: {
    line1: "Built for people who already do the inner work —",
    line2: "and want a system to make it stick.",
  },

  // ── What it does ──
  features: {
    headline: "Not another journal app.",
    subheadline:
      "A system that reads what you write, reflects back what it sees, and gives you real exercises — matched to your patterns.",
    cards: [
      {
        title: "Write. Get seen.",
        desc: "Journal freely. Your companion reflects back patterns, blind spots, and growth edges — not platitudes.",
      },
      {
        title: "Do the real work.",
        desc: "Targeted exercises from IFS, ACT, CBT, Gottman, and positive psychology. Matched to your themes. Done in minutes.",
      },
      {
        title: "See what's shifting.",
        desc: "Weekly reviews and monthly summaries surface patterns across entries. Real evidence of what's changing.",
      },
    ],
  },

  // ── Product Preview (mock reflection) ──
  preview: {
    label: "What a reflection looks like",
    userLabel: "You wrote:",
    userEntry:
      '"I keep saying yes to things I don\'t want. Then I resent everyone for it."',
    reflectionLabel: "Mindcraft Ninja reflects:",
    reflectionText:
      "This is the third time this week you've named a pattern of over-committing. The resentment isn't about them \u2014 it's the signal that a boundary was needed and didn't get set. Tomorrow's exercise will work on identifying the moment before the \"yes.\"",
  },

  // ── Interactive Demo (homepage) ──
  // Visitors type a journal entry and see a simulated reflection.
  interactiveDemo: {
    headline: "Try it yourself.",
    subheadline: "Type anything. See how Mindcraft Ninja reflects it back.",
    placeholder: "What\u2019s on your mind right now?",
    buttonText: "See reflection",
    loadingText: "Reading your entry...",
    sampleReflections: [
      "You\u2019re naming a pattern here \u2014 the gap between what you want and what you do. That tension is the starting point, not the problem. Tomorrow\u2019s exercise will help you map the moment before the decision.",
      "There\u2019s a theme across your last few entries: a pull between connection and protection. Neither is wrong. The work is learning when each one serves you.",
      "Notice how you frame this \u2014 \u201cI should\u201d vs \u201cI want.\u201d That split usually signals a boundary that needs setting. We\u2019ll work on identifying the voice behind the \u201cshould\u201d tomorrow.",
    ],
  },

  // ── How it works ──
  steps: {
    headline: "Three steps. Five minutes a day.",
    items: [
      {
        title: "Tell us what you're working on",
        desc: "A short intake maps your patterns and builds a 12-week plan — frameworks matched to your situation, not a generic template.",
      },
      {
        title: "Write. Reflect. Do the exercise.",
        desc: "Each day: journal freely, get a reflection that notices what you miss, and complete an exercise that moves the needle.",
      },
      {
        title: "Watch yourself change",
        desc: "Weekly reviews and monthly summaries track what's actually shifting. Not feelings about progress — evidence of it.",
      },
    ],
  },

  // ── Credibility ──
  credibility: {
    headline: "Built on real frameworks. By real coaches.",
    description:
      "Mindcraft Ninja is built by All Minds on Deck — an ICF & EMCC certified coaching practice with backgrounds in product leadership, positive psychology, and neuroscience. Every exercise comes from a proven methodology. Nothing is made up.",
    stats: [
      { label: "ICF & EMCC", desc: "certified coaches" },
      { label: "12-week", desc: "structured plans" },
      { label: "6+", desc: "proven frameworks" },
      { label: "100%", desc: "your data" },
    ],
  },

  // ── Pricing ──
  pricing: {
    headline: "Start doing the work.",
    subheadline:
      "Daily reflections. Personalised exercises. Pattern tracking. A 12-week plan built around you. Everything you need — for less than a single coaching session.",
    interval: "/month",
    disclaimer: "Cancel anytime. Your data stays yours.",
    cta: "Get Mindcraft Ninja",
  },

  // ── AMOD clients banner ──
  clientsBanner:
    "Active All Minds on Deck coaching clients get free access to Mindcraft Ninja.",

  // ── Subscribe page ──
  subscribe: {
    headline: "Ready to do the work?",
    subheadline:
      "Real coaching frameworks. Personalised exercises. AI-powered reflections. Not theory — real work, every day.",
    pricingLabel: "Monthly",
    features: [
      "Personalised exercises from proven frameworks",
      "AI-powered reflections — not platitudes",
      "12-week coaching plan built around you",
      "Pattern recognition across your entries",
      "Weekly and monthly reviews that surface what matters",
      "Your data. Full stop. No training, ever.",
    ],
    cta: "Start your journey",
    ctaLoading: "Redirecting to checkout...",
    disclaimer: "Cancel anytime. No contracts. Your data stays yours.",
    cancelledMessage:
      "Checkout was cancelled. You can try again when you're ready.",
  },

  // ── Login page ──
  login: {
    headline: "Welcome back",
    subheadline: "Pick up where you left off.",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "you@example.com",
    submitButton: "Sign in",
    submitLoading: "Signing in...",
    newHere: "New here?",
    newHereLink: "Start your journey",
  },

  // ── Signup page ──
  signup: {
    headline: "Create your account",
    subheadline: "One last step. Then the real work starts.",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "you@example.com",
    submitButton: "Sign up",
    submitLoading: "Creating account...",
    haveAccount: "Already have an account?",
    haveAccountLink: "Sign in",
    success: {
      headline: "Check your inbox",
      messageAfter:
        ". Click it, then sign in. Your coaching plan is waiting.",
      backLink: "Back to sign in",
    },
  },

  // ── Intake page ──
  intake: {
    headline: "Let\u2019s build your plan.",
    subheadline:
      "Tell us what brought you here. We\u2019ll match you with the right frameworks and build a 12-week coaching plan around your situation.",
    step2Prefix: "Step 2 of 3 \u2014 Getting to Know You",
    step3Prefix: "Step 3 of 3 \u2014",
    specificHeadline: "About Your Situation",
    rankingHint: "Number each item 1 (most important) to",
    continueButton: "Continue",
    backButton: "Back",
    nextButton: "Next",
    finalQuestionsButton: "Continue to final questions",
    completeButton: "Complete intake",
    savingButton: "Saving...",
    complete: {
      headline: "Got it. Let\u2019s go.",
      subheadline:
        "Your responses are saved. Now we build your personalised 12-week coaching plan \u2014 frameworks matched to your themes, exercises that fit your situation.",
      cta: "Generate my coaching plan",
    },
  },

  // ── Dashboard page ──
  dashboard: {
    headline: "The work continues.",
    oneLinerLabel: "What\u2019s on your mind?",
    oneLinerPlaceholder: "A thought. A feeling. Something you noticed.",
    captureButton: "Capture",
    capturedFlash: "Thought captured",
    stats: {
      streak: "day streak",
      entries: "entries this week",
      exerciseDone: "exercise done",
      exercisePending: "exercise pending",
      noExercise: "no exercise",
    },
    themesHeading: "Themes this week",
    navLinks: [
      { href: "/journal", label: "Journal", desc: "Write. Get seen." },
      { href: "/exercise", label: "Exercise", desc: "Today\u2019s real work" },
      { href: "/plan", label: "Plan", desc: "Your 12-week map" },
      {
        href: "/weekly-review",
        label: "Review",
        desc: "What showed up this week",
      },
      {
        href: "/monthly-summary",
        label: "Monthly",
        desc: "See the patterns",
      },
      { href: "/privacy", label: "Privacy", desc: "Your data. Full stop." },
    ],
    recentEntriesHeading: "Recent entries",
    entryTypes: { thought: "thought", journal: "journal" },
  },

  // ── Journal page ──
  journal: {
    headline: "Write freely.",
    subheadline:
      "No filters. Your companion reflects back what it notices \u2014 patterns, blind spots, growth edges.",
    placeholder:
      "What\u2019s real right now? What are you noticing, feeling, working through?",
    submitButton: "Submit",
    submitLoading: "Reflecting...",
    loadingText: "Reading your entry...",
    reflectionHeading: "Coaching Reflection",
  },

  // ── Exercise page ──
  exercise: {
    headline: "Do the work.",
    emptyMessage:
      "No exercise yet today. We\u2019ll pull one from proven frameworks, matched to your themes. Completed in minutes.",
    generateButton: "Generate today\u2019s exercise",
    generatingButton: "Generating...",
    generatingText: "Matching an exercise to your themes...",
    exerciseHeading: "The Exercise",
    completedMessage:
      "\u2713 Done. Head to your journal to process what came up.",
    completeButton: "Mark as complete",
    loadingText: "Loading today\u2019s exercise...",
  },

  // ── Plan page ──
  plan: {
    headline: "Your 12-Week Map",
    emptyMessage:
      "No plan yet. Complete your intake, then we build your personalised coaching plan \u2014 frameworks matched to your situation.",
    generatingText: "Building your plan \u2014 about 15 seconds...",
    generateButton: "Generate my plan",
    generatingButton: "Generating...",
    goToIntake: "Go to intake",
    startJournaling: "Start journaling",
    packageLabels: {
      layoff: "Layoff Recovery",
      international_move: "International Move",
      new_manager: "New Manager",
      general: "General Growth",
    } as Record<string, string>,
    goalsHeading: "Goals",
    focusAreasHeading: "Focus Areas",
    basedOn: "Based on:",
    weeklyJourneyHeading: "12-Week Journey",
    loadingText: "Loading your coaching plan...",
  },

  // ── Privacy page ──
  privacy: {
    headline: "Your Data. Full Stop.",
    subheadline: "You own everything. Control exactly how it\u2019s used.",
    dataUsage:
      "Your journal entries, exercises, and coaching data belong to you. Full control over sharing, export, and deletion. No training on your entries. Ever.",
    toggles: {
      aiProcessing: {
        title: "AI Processing",
        badge: "Required",
        description:
          "Your entries are processed by Claude (Anthropic) to generate coaching reflections, theme tags, and exercise recommendations. This is required for the service to function. Entries are not used to train AI models.",
      },
      coachSharing: {
        title: "Share with Coach",
        badge: "Optional",
        description:
          "Allow your coach to view your journal entries, reflections, and monthly summaries. Your coach can use this to personalise live sessions. You can revoke access at any time.",
      },
      aggregateAnalytics: {
        title: "Aggregate Analytics",
        badge: "Optional",
        description:
          "Contribute anonymised, aggregated data to help improve the coaching framework library. No individual entries are ever shared \u2014 only theme trends and usage patterns across all users.",
      },
    },
    dataRights: {
      heading: "Your Data Rights",
      rights: [
        { right: "Access", desc: "Download all your data at any time" },
        {
          right: "Deletion",
          desc: "Request complete deletion of your account and all data",
        },
        {
          right: "Portability",
          desc: "Export your journal entries, plans, and assessments",
        },
        {
          right: "Rectification",
          desc: "Correct any inaccurate personal information",
        },
      ],
      contactText:
        "To exercise any of these rights, contact privacy@allmindsondeck.com",
    },
    saveButton: "Save preferences",
    savingButton: "Saving...",
    savedButton: "Saved \u2713",
  },

  // ── Weekly Review page ──
  weeklyReview: {
    headline: "Weekly Review",
    stats: {
      journalEntries: "journal entries",
      quickThoughts: "quick thoughts",
      exercisesDone: "exercises done",
    },
    themesHeading: "Themes This Week",
    trendHeading: "Accountability Trend",
    rating: {
      heading: "How did you show up?",
      scale: "1 = barely here \u00b7 5 = fully in it",
    },
    reflection: {
      heading: "What stood out?",
      subheadline:
        "What did you notice? What surprised you? What shifted?",
      placeholder: "Write freely \u2014 this is for you.",
    },
    adjustments: {
      heading: "Anything to adjust?",
      subheadline:
        "Shift focus? Change pace? Try a different approach next week?",
      placeholder:
        "Optional \u2014 leave blank if the current plan feels right.",
    },
    saveButton: "Save review",
    savingButton: "Saving...",
    savedButton: "Saved \u2713",
    printButton: "Print",
    pastReviewsHeading: "Past Reviews",
    loadingText: "Loading your week...",
  },

  // ── Monthly Summary page ──
  monthlySummary: {
    headline: "The Month. At a Glance.",
    printButton: "Print",
    stats: {
      totalEntries: "total entries",
      journals: "journals",
      exercises: "exercises",
      avgRating: "avg rating",
    },
    themeDistribution: "Theme Distribution",
    activityByDay: "Activity by Day",
    progressVsGoals: "Progress vs Goals",
    relatedEntries: "related entries",
    weeklyReflections: "Weekly Reflections",
    shareWithCoach: "Share with coach",
    shareDescription: "Allow your coach to view this monthly summary",
    loadingText: "Loading your month...",
  },

  // ── Coach Dashboard page ──
  coach: {
    headline: "Coach Dashboard",
    clientsHeading: "Clients",
    noClients: "No clients yet",
    selectClient: "Select a client to view their details",
    loadingClient: "Loading client data...",
    coachingPlan: "Coaching Plan",
    enneagram: {
      heading: "Enneagram Data",
      typeLabel: "Type",
      notesLabel: "Notes",
      notesPlaceholder: "Wing, instinct, observations...",
      saveButton: "Save",
      savingButton: "Saving...",
    },
    recentEntries: "Recent Entries",
    noEntries: "No entries in the last 30 days",
    loadingText: "Loading coach view...",
  },

  // ── Footer ──
  footer: {
    text: "Mindcraft Ninja \u2014 built by",
  },
};
