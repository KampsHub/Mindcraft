/**
 * ✏️  ALL WEBSITE COPY LIVES HERE
 *
 * Edit the text below, push to git, and Vercel auto-deploys.
 * No need to touch any React code.
 */

export const content = {
  // ── Brand ──
  brand: {
    name: "Mindcraft",
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
    headline: "Laid off. Put on a PIP. Thrown into a role you didn\u2019t see coming.",
    headlineAccent: "Now what?",
    subheadline:
      "A 30-day coaching program matched to your exact situation. 250+ real frameworks. Daily exercises adapted to what\u2019s actually showing up.",
    cta: "Find your program",
    heroVideo: "", // e.g. "/images/hero.mp4" — leave empty for no video
    heroImage: "", // e.g. "/images/hero.jpg" — fallback or standalone image
    heroPoster: "", // poster image for video (shown while loading)
  },

  // ── Differentiator Strip ──
  differentiator: {
    items: [
      "Not meditation. Not therapy. Not a chatbot.",
      "A structured coaching program for the career moment you\u2019re in.",
      "250+ real frameworks. Exercises matched to your journal. Patterns tracked across weeks.",
    ],
  },

  // ── Reframe Block ──
  reframe: {
    text: "You\u2019ve read the books. Done the 1:1s. Maybe even tried meditating. But when you\u2019re spiraling on a PIP, frozen after a layoff, or white-knuckling through a role you didn\u2019t see coming \u2014 the generic advice stops reaching. Not because something\u2019s wrong with you. Because the situation needs something more specific than a productivity hack or a blank journal page.",
  },

  // ── What a Day Looks Like ──
  dailyPreview: {
    headline: "What a day actually looks like.",
    subheadline: "15\u201330 minutes. Five steps. Each one builds on the last.",
    steps: [
      {
        number: "01",
        label: "Thread",
        title: "Your patterns from the last 2\u20133 days, named.",
        desc: "Before you write a word, the AI reads across your recent entries and surfaces what\u2019s recurring \u2014 the themes you keep circling, the shifts you haven\u2019t noticed, the thing you\u2019re avoiding. Not a generic check-in. A mirror.",
      },
      {
        number: "02",
        label: "Journal",
        title: "Write what\u2019s real. AI reads what\u2019s underneath.",
        desc: "Guided prompts matched to where you are in your program \u2014 or skip them and free-write. Either way, the AI doesn\u2019t just respond to what you typed. It reads for what you didn\u2019t say.",
      },
      {
        number: "03",
        label: "Exercises",
        title: "4 exercises from 250+ frameworks, matched to today.",
        desc: "Not a static library you scroll through. Each exercise is selected from real coaching frameworks \u2014 IFS, ACT, Gottman, polyvagal, performance psychology \u2014 based on what showed up in your journal that morning. Cognitive, somatic, relational. Cited and explained in plain language.",
      },
      {
        number: "04",
        label: "Insights",
        title: "What moved. What\u2019s stuck. What\u2019s emerging.",
        desc: "A daily summary that connects the dots: what shifted from yesterday, what patterns are strengthening, what\u2019s new. Weekly deep dives go further \u2014 mapping themes across days and tracking real behavioral change.",
      },
      {
        number: "05",
        label: "Summary",
        title: "Tomorrow\u2019s thread seed. What to watch for.",
        desc: "Each day closes with a seed for tomorrow \u2014 a pattern to notice, a question to sit with, a theme the AI will pick back up. Your story doesn\u2019t reset overnight. It builds.",
      },
    ],
  },

  // ── Programs ──
  programs: {
    headline: "What brought you here?",
    subheadline:
      "One month. One program. Built around what you\u2019re actually dealing with.",
    cards: [
      {
        tag: "Layoff",
        title: "Stabilize first. Then figure out what\u2019s next.",
        desc: "30 days of coach-designed exercises to get past the shock, find the patterns underneath it, and rebuild clarity \u2014 about the next move, and about who you are without the title.",
        href: "/parachute",
      },
      {
        tag: "PIP",
        title: "Separate the panic from the actual problem.",
        desc: "30 days of coach-designed exercises to sort real feedback from fear, and build a concrete plan you can execute under pressure \u2014 not just survive.",
        href: "/jetstream",
      },
      {
        tag: "New Role",
        title: "The hardest part isn\u2019t the job. It\u2019s the doubt.",
        desc: "Get grounded before imposter syndrome writes the narrative. Build real confidence in your new role, not the performed kind.",
        href: "/basecamp",
      },
    ],
    cta: "Find your program",
  },

  // ── How it works ──
  steps: {
    headline: "How it works",
    items: [
      {
        title: "Pick your situation. Not a personality type.",
        desc: "No quiz. No archetype. You choose the program that matches your actual moment \u2014 layoff, PIP, new role. That choice shapes your entire 30-day arc, your frameworks, and your intake questions.",
      },
      {
        title: "A real coaching intake. Not a signup form.",
        desc: "30 to 45 minutes of the questions a good coach asks in a first session \u2014 because that\u2019s who wrote them. Your values, work history, what brought you here, what you\u2019ve already tried. This is the foundation everything builds on.",
      },
      {
        title: "Your goals. From your words, not a template.",
        desc: "Based on your intake, you\u2019ll get 3 to 6 goals \u2014 each one traced back to something you actually said. You approve, adjust, or add your own before Day 1.",
      },
      {
        title: "Daily sessions adapt to what\u2019s showing up.",
        desc: "Each day\u2019s journal prompts and exercises respond to where you actually are \u2014 not a pre-set curriculum. The daily flow is 15\u201330 minutes and builds on itself across the month.",
      },
      {
        title: "Watch what actually shifts.",
        desc: "Weekly reflections and monthly pattern reports track what\u2019s changing \u2014 recurring themes, emotional movement, behavioral shifts. Not metrics for metrics\u2019 sake. Real observations about real change.",
      },
    ],
  },

  // ── After the Month ──
  afterMonth: {
    headline: "The program ends. You decide what\u2019s next.",
    body: "Most people keep going. $50/month, same depth, same personalization. No lock-in. Stay because it\u2019s helping, not because we made it hard to leave.",
    price: "$50/month",
  },

  // ── The Human Layer ──
  humanLayer: {
    headline: "When you need more than a screen.",
    body: "The daily program does a lot \u2014 but some moments call for a real person. We\u2019re connected to a network of certified coaches with deep expertise in leadership and team dynamics. Many of them have worked in tech or still do. You can export part of your data to share with a coach to get them up to speed fast.",
    cta: "Book a session",
  },

  // ── Who Built This ──
  builtBy: {
    headline: "Who built this.",
    body: "Getting laid off sent me through an emotional rollercoaster I wasn\u2019t prepared for. As a product leader and certified coach, I channeled that experience into building what I wished had existed \u2014 a structured way to help people actually process these career-defining moments. I\u2019ve since coached people through layoffs, PIPs, and disorienting new roles, picking up frameworks and tools along the way that genuinely move the needle. I wish I\u2019d had all of this when it happened to me, because that experience stayed with me for years.",
    name: "Stefanie Kamps",
    title: "Founder \u00b7 Certified Leadership Coach, Team Facilitator, and Product Manager",
    linkedin: "https://www.linkedin.com/in/stefanie-kamps/",
  },

  // ── Takeaways ──
  takeaways: {
    headline: "What you walk away with after 30 days.",
    subheadline: "Not just insights. Tangible changes you can point to.",
    items: [
      {
        title: "A map of your patterns and growth edges",
        desc: "By Day 30, you\u2019ll have a clear picture of the recurring themes, default reactions, and blind spots that shape how you show up under pressure. Named, tracked, and connected across your entries.",
      },
      {
        title: "A development profile that evolved with you",
        desc: "Your coaching plan isn\u2019t static. It adapted as your journal entries revealed new patterns. You leave with a living document: goals, frameworks used, what shifted, and what still needs attention.",
      },
      {
        title: "Real behavioral changes, not just awareness",
        desc: "The exercises aren\u2019t theoretical. They\u2019re designed to shift how you actually respond \u2014 in meetings, in conflict, in the moments where old patterns used to run the show. Weekly reviews track whether the shifts are sticking.",
      },
      {
        title: "A toolkit you keep using",
        desc: "Every framework is cited and explained. By the end, you\u2019ll know which tools work for you \u2014 IFS parts work for that inner critic, ACT defusion for the spiraling thoughts, somatic grounding for the 2 a.m. panic. They\u2019re yours to use long after the program ends.",
      },
    ],
  },

  // ── FAQ ──
  faq: {
    headline: "FAQ",
    items: [
      {
        q: "How is this different from Headspace or Calm?",
        a: "Those are meditation and mindfulness apps. We\u2019re a coaching program. Headspace teaches you to breathe. Mindcraft gives you a 30-day structured plan to process a layoff, survive a PIP, or build real confidence in a new role \u2014 with exercises from 250+ coaching frameworks adapted to what\u2019s showing up in your journal entries. Different problem, different tool.",
      },
      {
        q: "Is this therapy?",
        a: "No. Therapy processes the past with a licensed clinician. This gives you daily structure for the present \u2014 specific exercises, pattern tracking, and coached reflections matched to your career situation. If you need therapy, get therapy. We\u2019re not a substitute. But if you\u2019re also in therapy, this can complement it by giving you daily practice between sessions.",
      },
      {
        q: "How is this different from a journaling app like Rosebud or Reflectly?",
        a: "A journaling app gives you a blank page and maybe a mood tracker. Mindcraft reads your entries longitudinally \u2014 tracking patterns across days, not just reflecting on today. It matches you to specific coaching exercises from real frameworks, adapts your program based on what\u2019s emerging, and builds a narrative thread across your entire month. The journal is one step in a five-step daily process, not the whole product.",
      },
      {
        q: "How is this different from ChatGPT?",
        a: "ChatGPT responds to what you type right now. Mindcraft knows your intake history, tracks your patterns across 30 days of entries, follows a structured coaching arc designed by certified coaches, and selects exercises from frameworks like IFS, ACT, and Gottman \u2014 not just whatever sounds helpful in the moment. It\u2019s the difference between asking a friend for advice and working with a coach who\u2019s read your file.",
      },
      {
        q: "What if I\u2019m too busy?",
        a: "The required exercises take about 5 minutes. A full session is 15\u201330 minutes. The AI adapts to the time you have \u2014 if you can only do the journal and one exercise, it adjusts. Most people find that 15 minutes of structured reflection replaces an hour of spiraling.",
      },
      {
        q: "Does AI actually work for coaching?",
        a: "The AI reads your entries and matches you to frameworks from neuroscience, performance psychology, and mindfulness research. It doesn\u2019t replace a human \u2014 it does the daily work most people skip between coaching sessions. And when you need more than a screen, real coaches are available who can pick up where the AI left off.",
      },
      {
        q: "Is this woo-woo?",
        a: "No. Every exercise comes from evidence-based frameworks \u2014 IFS, ACT, Gottman, polyvagal theory, performance psychology. Each one is cited, sourced, and explained in plain language. No vision boards. No manifesting. Just tested methods from the rooms where these situations actually get worked through.",
      },
      {
        q: "Can my company pay?",
        a: "Yes. Many companies cover this under professional development or coaching budgets. The first month is free, and ongoing is $50/month \u2014 well within most L&D allowances.",
      },
      {
        q: "Who sees my data?",
        a: "You. That\u2019s it. Your entries never train any AI model. No third parties. No exceptions. Export or delete everything at any time.",
      },
      {
        q: "What happens after my program month?",
        a: "Keep going at $50/month with the same depth and personalization, add live coaching sessions, or stop. No contracts. No lock-in. No \u2018are you sure?\u2019 emails. You stay because it\u2019s working, not because we made it hard to leave.",
      },
    ],
  },

  // ── Checkout ──
  checkout: {
    cancelledMessage: "Checkout was cancelled. No charge was made. You can try again whenever you\u2019re ready.",
  },

  // ── Final CTA ──
  finalCta: {
    headline: "You don\u2019t have to figure this out alone.",
    subtext: "One month. One program. No contracts.",
    primaryCta: "Find your program",
  },

  // ── Subscribe page ──
  subscribe: {
    headline: "Ready to do the work?",
    subheadline:
      "Real coaching frameworks. Personalised exercises. AI-powered reflections. Not theory — real work, every day.",
    pricingLabel: "Monthly",
    features: [
      "Personalised exercises from proven frameworks",
      "AI-powered reflections — not platitudes",
      "4-week coaching plan built around you",
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
        ". We\u2019ve sent you a verification link to confirm your Mindcraft account. Click it, then sign in \u2014 your coaching plan is waiting.",
      backLink: "Back to sign in",
    },
  },

  // ── Intake page ──
  intake: {
    headline: "Let\u2019s build your plan.",
    subheadline:
      "Tell us what brought you here. We\u2019ll match you with the right frameworks and build a 4-week coaching plan around your situation.",
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
        "Your responses are saved. Now we build your personalised 4-week coaching plan \u2014 frameworks matched to your themes, exercises that fit your situation.",
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
      { href: "/mindful-journal", label: "Journal", desc: "Write. Get seen." },
      { href: "/exercise", label: "Exercise", desc: "Today\u2019s real work" },
      { href: "/plan", label: "Plan", desc: "Your 4-week map" },
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
    contact: {
      heading: "Get in touch",
      issueTypes: [
        "Technical problem",
        "Feedback on an exercise",
        "Feedback on insights and summaries",
        "Question for a Coach",
      ],
      messagePlaceholder: "Tell us what's on your mind...",
      submitButton: "Send",
      submittingButton: "Sending...",
      successHeading: "Message sent",
      successMessage: "Got it. We'll get back to you within 48 hours at the latest.",
    },
    upsell: {
      sectionHeading: "Go deeper",
      enneagram: {
        badge: "Deepest insight",
        title: "Add Enneagram",
        description: "The IEQ9 assessment + 1-hour debrief with a certified coach. Your results refine every exercise and goal.",
        price: "$275",
        cta: "Learn more",
      },
      coaching: {
        badge: "Human support",
        title: "1:1 Coaching",
        description: "A 3-month partnership with a certified coach who already knows your patterns from the program.",
        cta: "Apply",
      },
    },
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

  // ── Mindful Journal page ──
  mindfulJournal: {
    headline: "Mindful Journal",
    subheadline:
      "Notice what you\u2019re feeling, what you need, and what\u2019s alive in your body.",
    placeholder:
      "Write freely. What\u2019s present for you right now?",
    submitButton: "Save entry",
    submitLoading: "Saving...",
    savedMessage: "Entry saved \u2014 it will be part of your next summary.",
    feelingsSatisfiedTitle: "Feelings \u2014 needs satisfied",
    feelingsUnsatisfiedTitle: "Feelings \u2014 needs not satisfied",
    needsTitle: "Needs",
    somaticTitle: "Somatic sensations",
    groundingHeading: "Grounding exercises",
    attribution:
      "Feelings and Needs inventories adapted from the work of Marshall B. Rosenberg and the Center for Nonviolent Communication (CNVC), as compiled by Nati Beltran and colleagues. Somatic sensations list developed collaboratively by NVC practitioners. Used with gratitude.",
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
    headline: "Your 4-Week Map",
    emptyMessage:
      "No plan yet. Complete your intake, then we build your personalised coaching plan \u2014 frameworks matched to your situation.",
    generatingText: "Building your plan \u2014 about 15 seconds...",
    generateButton: "Generate my plan",
    generatingButton: "Generating...",
    goToIntake: "Go to intake",
    startJournaling: "Start journaling",
    packageLabels: {
      layoff: "Layoff Recovery",
      new_role: "New Role",
      performance_plan: "Performance Plan",
    } as Record<string, string>,
    goalsHeading: "Goals",
    focusAreasHeading: "Focus Areas",
    basedOn: "Based on:",
    weeklyJourneyHeading: "4-Week Journey",
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
        "To exercise any of these rights, contact stefanie@allmindsondeck.org",
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

  // ── Interactive Demo ──
  interactiveDemo: {
    sampleReflections: [
      "There's something interesting in how you described that situation \u2014 the language shifts from 'I chose' to 'it happened to me' halfway through. That's worth sitting with.",
      "You mentioned control three times without naming it. What would it look like to let go of just one of those things this week?",
      "The anger you're describing has a different texture than last week's. It sounds less like reaction and more like clarity. That's movement.",
      "You're holding two things that feel contradictory \u2014 wanting to be seen and wanting to disappear. Both are real. Neither needs to win right now.",
    ],
    placeholder: "What\u2019s on your mind right now? Write a sentence or two.",
    buttonText: "Get reflection",
    loadingText: "Reading your entry...",
  },

  // ── Preview ──
  preview: {
    reflectionLabel: "Coaching Reflection",
  },

  // ── Footer ──
  footer: {
    text: "Mindcraft \u2014 built by",
    copyright: "\u00a9 2026 Mindcraft",
    privacyLink: "Privacy Policy",
  },
};
