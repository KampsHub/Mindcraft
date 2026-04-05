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
    companyName: "All Minds On Deck",
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
    headline: "You\u2019re not broken.",
    headlineAccent: "You\u2019re just overwhelmed.",
    subheadline:
      "A career crisis can be one of the most difficult phases you\u2019ll handle in life. This is 30 days of structure at a time when you can\u2019t even finish your morning coffee. See clearly. Handle anxiety. Pick up insight about yourself. Gain interpersonal skills.",
    cta: "Find your program",
    heroVideo: "/hero-bg-v5.mp4",
    heroImage: "", // e.g. "/images/hero.jpg" - fallback or standalone image
    heroPoster: "", // poster image for video (shown while loading)
  },

  // ── Differentiator Strip ──
  differentiator: {
    items: [
      "A career crisis takes your clear thinking first. And the tools that could help all need something from you \u2014 the right questions, the right person, the right timing.",
      "Mindcraft removes that barrier. It starts revealing your blind spots, reactive patterns, and buried strengths by week one. Come up with pragmatic action \u2014 fast.",
    ],
  },

  // ── Reframe Block ──
  reframe: {
    text: "Everyone says \u201Cpush through.\u201D Update your LinkedIn. Network harder. Stay positive. But research shows that job loss, a PIP, or a disorienting new role rank among life\u2019s most stressful events. You don\u2019t need another productivity tip. You need a way to slow down, see what\u2019s actually happening inside, and work through it \u2014 not around it.",
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
        desc: "Before you write a word, the system reads across your recent entries and surfaces what\u2019s recurring \u2014 the themes you keep circling, the shifts you haven\u2019t noticed, the thing you\u2019re avoiding. Not a generic check-in. A mirror.",
      },
      {
        number: "02",
        label: "Journal",
        title: "Write what\u2019s real. The system reads what\u2019s underneath.",
        desc: "Guided prompts matched to where you are in your program \u2014 or skip them and free-write. Either way, the system doesn\u2019t just respond to what you typed. It reads for what you didn\u2019t say.",
      },
      {
        number: "03",
        label: "Exercises",
        title: "4 exercises from 350+ frameworks, matched to today.",
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
        desc: "Each day closes with a seed for tomorrow \u2014 a pattern to notice, a question to sit with, a theme the system will pick back up. Your story doesn\u2019t reset overnight. It builds.",
      },
    ],
  },

  // ── Programs ──
  programs: {
    headline: "What\u2019s your situation?",
    subheadline:
      "Each program is built for a specific moment \u2014 not a generic self-help arc. One month of structure when everything feels like chaos.",
    cards: [
      {
        tag: "PIP",
        title: "The panic is louder than the feedback?",
        desc: "Separate the signal from the noise. Think clearly when everything feels personal.",
        href: "/jetstream",
        modules: ["Feedback vs. fear", "Managing up", "The inner critic", "What you control", "Both outcomes", "Performing without spiraling"],
      },
      {
        tag: "Layoff",
        title: "It wasn\u2019t just a job. And this isn\u2019t just a transition?",
        desc: "Grieve what you lost. Rebuild what matters. Figure out what\u2019s next without pretending you\u2019re fine.",
        href: "/parachute",
        modules: ["The 3am money math", "Identity without the title", "Unnamed grief", "Days without structure", "The story you\u2019re telling", "Trusting yourself again"],
      },
      {
        tag: "New Role",
        title: "You got the job. So why does it feel this hard?",
        desc: "Land with confidence instead of survival mode. Prove yourself without losing yourself.",
        href: "/basecamp",
        modules: ["Starting from zero", "Reading the room", "Earning credibility", "Old identity vs. new role", "Defining success here", "When nothing feels natural"],
      },
    ],
    cta: "Find your program",
  },

  // ── How it works ──
  steps: {
    headline: "How it works.",
    subheadline: "",
    items: [
      {
        icon: "compass",
        title: "Pick your program.",
        desc: "Layoff, PIP, or new role. 30 days built for that specific moment.",
      },
      {
        icon: "daily",
        title: "15 minutes a day.",
        desc: "Journal, matched exercises, pattern detection, and weekly insights. The program adapts to what surfaces.",
      },
      {
        icon: "human",
        title: "Go deeper if you need to.",
        desc: "Connect with a professional coach who already has your context. No starting from scratch.",
      },
    ],
    outcomes: [
      {
        title: "See clearly",
        desc: "Name the patterns underneath the panic \u2014 what triggers you, what you avoid, what keeps looping.",
      },
      {
        title: "Handle the anxiety",
        desc: "Exercises that change how you actually respond under pressure \u2014 the 1:1, the spiral, the interview.",
      },
      {
        title: "Pick up real insight",
        desc: "Track your own shifts week over week. When your brain says \u2018nothing\u2019s working,\u2019 you have data.",
      },
      {
        title: "Keep the tools",
        desc: "Evidence-based frameworks explained in plain language. By Day 30, you know which ones work for you.",
      },
    ],
  },

  // ── After the Month ──
  afterMonth: {
    headline: "After 30 days, you decide what\u2019s next.",
    body: "Some people feel ready to move on. Some keep going \u2014 $49/month, same depth, same personalization. No lock-in. You stay because it\u2019s helping, not because we made it hard to leave.",
    price: "$49/month",
  },

  // ── The Human Layer ──
  humanLayer: {
    headline: "Sometimes you need a real person.",
    body: "Some moments need a human voice. We\u2019re connected to certified coaches with deep expertise in career transitions \u2014 many of them have been through it themselves. If you choose to share your program data, they already know your story when you walk in. No starting from scratch. No sharing without your say-so.",
    cta: "Book a session",
  },

  // ── Who Built This ──
  builtBy: {
    headline: "Powered by lemons.",
    body: "I lost a job I loved and spent years untangling what it did to me - to my confidence, my identity, even relationships I thought were solid. That experience pulled me toward coaching. I trained, got certified, and started working with people through layoffs, PIPs, and disorienting new roles. What I kept seeing surprised me. People didn\u2019t just recover. They came out of it clearer. Kinder to themselves. More honest about what they actually want. As a product manager and coach with the kind of background people politely call \u2018eclectic,\u2019 I had everything I needed to build something that actually helps in the moment of crisis - and keeps the momentum going every day. So I made my own lemonade \u2014 and called it Mindcraft.",
    name: "Stefanie Kamps",
    title: "Founder \u00b7 Certified Leadership Coach, Team Facilitator, and Product Manager",
    linkedin: "https://www.linkedin.com/in/stefanie-kamps/",
  },

  // ── Takeaways ──
  takeaways: {
    headline: "What\u2019s different in 30 days.",
    subheadline: "30 days of structure when you can\u2019t even finish your morning coffee.",
    items: [
      {
        title: "See clearly",
        desc: "Name the patterns underneath the panic \u2014 what triggers you, what you avoid, what keeps looping.",
      },
      {
        title: "Handle the anxiety",
        desc: "Exercises that change how you actually respond under pressure \u2014 the 1:1, the spiral, the interview.",
      },
      {
        title: "Pick up real insight",
        desc: "Track your own shifts week over week. When your brain says \u2018nothing\u2019s working,\u2019 you have data.",
      },
      {
        title: "Keep the tools",
        desc: "Evidence-based frameworks explained in plain language. By Day 30, you know which ones work for you.",
      },
    ],
  },

  // ── FAQ ──
  faq: {
    headline: "FAQ",
    topics: ["The program", "Pricing", "Data & privacy", "About"],
    items: [
      {
        topic: "The program",
        q: "How is this different from ChatGPT or using AI on my own?",
        a: "AI can analyze anything \u2014 but you have to know what to ask, and analysis alone won\u2019t shift behavior. Mindcraft wraps AI inside a coaching structure: sequenced exercises, pattern detection across days, and 350+ professional frameworks. You don\u2019t need to be your own coach.",
      },
      {
        topic: "The program",
        q: "How is this different from hiring a coach?",
        a: "Cost: $150\u2013300/hr vs. $49/mo. Availability: 3 a.m. vs. business hours. Ramp-up: weeks vs. same day. Mindcraft tracks your patterns daily, not just in sessions. And when you need a human coach, they\u2019re available \u2014 and they already have your full context.",
      },
      {
        topic: "The program",
        q: "How much time does this take each day?",
        a: "15\u201330 minutes. The core practice takes about 15 minutes. If you do all the optional exercises, closer to 30. You decide each day based on your time and energy.",
      },
      {
        topic: "The program",
        q: "Is this therapy?",
        a: "No. We don\u2019t diagnose or treat. We help you understand your patterns at work, practice hard conversations, and build skills. If patterns surface that need clinical support, the program will flag that clearly.",
      },
      {
        topic: "The program",
        q: "Where do the exercises come from?",
        a: "A curated library of 350+ frameworks from Positive Intelligence, IFS parts work, NVC, Gottman, polyvagal theory, cognitive distortion work, and more. Every exercise is cited, explained in plain language, and matched to what showed up in your journal that day.",
      },
      {
        topic: "The program",
        q: "Will this fix my situation?",
        a: "We don\u2019t promise fixes. We give you structure to think clearly, tools to shift how you respond, and insights about patterns you can\u2019t see alone. What you do with that is yours.",
      },
      {
        topic: "The program",
        q: "What happens after the 30 days?",
        a: "Your access doesn\u2019t get cut at Day 30. You can continue at $49/month with the same depth and personalization. No lock-in. You stay because it\u2019s helping, not because we made it hard to leave.",
      },
      {
        topic: "The program",
        q: "Can I do this on my phone?",
        a: "Yes. The program runs in your browser \u2014 phone, tablet, or desktop. No app to download.",
      },
      {
        topic: "Pricing",
        q: "What\u2019s included in the first month?",
        a: "Full access to your program. A personalized coaching plan built from your intake, daily journal with pattern detection, 4 matched exercises per day from 350+ frameworks, weekly reviews, and monthly summaries. No credit card required.",
      },
      {
        topic: "Pricing",
        q: "Why should I pay for this when there are free resources?",
        a: "There are excellent free resources. What they don\u2019t do is personalize to your specific situation, track your patterns over time, select the right exercise on the right day, or hold your goals across 30 days. This is not content. It\u2019s a coach-designed practice that adapts to you.",
      },
      {
        topic: "Pricing",
        q: "Is this woo-woo?",
        a: "Every framework is cited and evidence-based. Positive Intelligence, IFS parts work, DBT, polyvagal theory, NVC, Gottman \u2014 all grounded in research. No affirmations. No vision boards.",
      },
      {
        topic: "Data & privacy",
        q: "Who sees my data?",
        a: "No one. Your journal entries are processed by AI to personalize your experience. No human reads them unless you choose to share with a coach. Your data is encrypted, downloadable, and deletable at any time.",
      },
      {
        topic: "Data & privacy",
        q: "What happens to my data if I stop?",
        a: "Nothing changes. Your data stays accessible and downloadable. If you want it deleted, request it and it\u2019s gone within 24 hours. We don\u2019t sell, share, or use your data for anything other than running your program.",
      },
      {
        topic: "Data & privacy",
        q: "Do you train AI on my entries?",
        a: "No. We use Anthropic\u2019s Claude API for processing \u2014 they do not train on your data. Your entries are used only to generate your coaching reflections and exercises. Nothing else. Ever.",
      },
      {
        topic: "The program",
        q: "Can I pause my program?",
        a: "Yes. You can pause and resume your program at any time from your account settings. Your progress and journal entries are saved — pick up where you left off whenever you're ready.",
      },
      {
        topic: "Data & privacy",
        q: "How do I export my data?",
        a: "Go to My Account and click 'Download my data.' You'll get a complete export of your journal entries, exercises, goals, and insights in JSON format.",
      },
      {
        topic: "Data & privacy",
        q: "Can I share my progress with a therapist or coach?",
        a: "Yes. You can generate shareable summaries of your coaching progress and share them with your therapist or coach. You review and approve everything before it's shared — they never see your raw journal entries.",
      },
      {
        topic: "About",
        q: "Who built this?",
        a: "Getting laid off broke something open I didn\u2019t know was sealed shut. That experience changed how I show up for people. As a certified coach, I\u2019ve since sat with people through layoffs, PIPs, and the quiet panic of a new role. Mindcraft came from knowing what it feels like when the ground disappears. \u2014 Stefanie Kamps, Founder",
      },
      {
        topic: "About",
        q: "How is this different from BetterUp or other coaching platforms?",
        a: "Those platforms connect you with a coach for scheduled sessions. This is a daily practice \u2014 a system that reads what you write, selects exercises from 350+ sourced tools, tracks your patterns, and adapts every day. Different model, different price point, different depth.",
      },
    ],
  },

  // ── Checkout ──
  checkout: {
    cancelledMessage: "Checkout was cancelled. No charge was made. You can try again whenever you\u2019re ready.",
  },

  // ── Stats Bar (below hero) ──
  statsBar: {
    items: [
      { number: "15", unit: "min/day", label: "Structured daily practice" },
      { number: "350+", unit: "", label: "Evidence-based frameworks" },
      { number: "30", unit: "days", label: "One structured program" },
    ],
  },

  // ── Pain-Point Marquee ──
  marquee: {
    circles: [
      "Your patterns",
      "Your patterns with others",
      "Other people\u2019s patterns",
    ],
    // Your patterns - what you do to yourself
    row1: [
      "3 a.m. thought spirals",
      "Imposter syndrome on repeat",
      "Numbing out after work",
      "The shame spiral after a bad meeting",
      "Knowing what to do but not doing it",
      "Over-functioning to feel worthy",
      "Performing confidence you don\u2019t feel",
      "Waking up already exhausted",
      "Procrastinating on the thing that matters most",
      "Perfectionism disguised as high standards",
      "The inner critic that never takes a day off",
      "Catastrophizing before anything has happened",
      "Replaying conversations you can\u2019t change",
      "Anxiety that shows up as productivity",
      "Emotional eating at 10 p.m.",
      "Doom-scrolling instead of sleeping",
      "Self-sabotaging right before a breakthrough",
      "The Sunday scaries that start on Friday",
    ],
    // Interactional patterns - what happens between you and others
    row2: [
      "Snapping at the people you love",
      "Saying yes when you mean no",
      "Making yourself small to keep the peace",
      "Carrying it alone because you don\u2019t want to burden anyone",
      "Losing yourself in someone else\u2019s crisis",
      "Avoiding the hard conversation",
      "Apologizing for having needs",
      "Shutting down instead of speaking up",
      "Over-explaining yourself to people who aren\u2019t listening",
      "Keeping score instead of keeping it real",
      "Giving advice you won\u2019t take yourself",
      "Walking on eggshells in your own home",
      "Fixing everyone else to avoid fixing yourself",
      "Going cold when you actually want closeness",
      "Picking fights to test if they\u2019ll stay",
      "Performing fine so nobody asks questions",
      "Being the reliable one who never asks for help",
      "Matching someone\u2019s energy instead of holding your own",
    ],
    // Other people\u2019s patterns - what you need to recognize and process
    row3: [
      "The manager who takes credit for your work",
      "The boss who moves the goalpost every time",
      "The colleague who undermines you in meetings",
      "The leader who confuses control with leadership",
      "The partner who shuts down when you need to talk",
      "The friend who only calls when they need something",
      "The parent whose approval you\u2019re still chasing",
      "The voice in the room that silences yours",
      "The coworker who makes everything about them",
      "The person who punishes you with silence",
      "The one who keeps you guessing where you stand",
      "The mentor who only sees their own reflection in you",
      "The executive who manages up and bullies down",
      "The teammate who agrees in the meeting and undermines after",
      "The person who calls it feedback but means control",
      "The leader who takes loyalty but never gives it back",
      "The client who moves the deadline then blames you",
      "The peer who competes with you instead of collaborating",
    ],
    // The deeper layer - what it all points to
    row4: [
      "The gap between who you are and who you show",
      "Grieving a life you chose to leave",
      "Waiting for permission to want more",
      "The identity crisis nobody warned you about",
      "Refreshing LinkedIn like it\u2019s a slot machine",
      "Comparing yourself to everyone",
      "Sunday dread",
      "Feeling fine but never good",
      "Outgrowing people you still love",
      "Success that doesn\u2019t feel like yours",
      "The loneliness of being the strong one",
      "Wanting something you can\u2019t name yet",
      "Not knowing who you are without the role",
      "Mourning the version of yourself you performed",
      "The ambition that feels like it\u2019s eating you alive",
      "Realizing your coping mechanism became your personality",
      "The quiet dread of being seen clearly",
      "Building a life that looks right but feels wrong",
      "The tension in your jaw you only notice at midnight",
    ],
    // The body keeps the score - somatic and nervous system patterns
    row5: [
      "The tension in your jaw you only notice at midnight",
      "Holding your breath during every email",
      "The knot in your stomach before every 1:1",
      "Chest tightness that isn\u2019t a heart attack",
      "Grinding your teeth through another reorg",
      "The headache that arrives every Sunday evening",
      "Shoulders up by your ears all day",
      "Exhaustion that sleep doesn\u2019t fix",
      "Your body saying no while your mouth says yes",
      "The panic that hits in the parking lot",
      "Stress showing up as back pain",
      "Appetite gone or appetite out of control",
      "The restlessness that won\u2019t let you sit still",
      "Crying in the car before you walk in",
      "The fatigue that shows up as brain fog",
      "Heart racing in a meeting about nothing",
    ],
    // New territory - first-time managers, global relocation, career leaps
    row6: [
      "Managing people who used to be your peers",
      "Giving feedback that could hurt someone",
      "Homesick for a country that\u2019s moved on without you",
      "Leading a team when you barely trust your own judgment",
      "Culture shock that hits three months in, not three days",
      "Learning to say no to your own team",
      "The loneliness of being the only foreigner in the room",
      "Having authority you never asked for",
      "Missing holidays nobody here has heard of",
      "Your team doesn\u2019t respect you yet and they\u2019re not wrong",
      "Making friends as an adult in a country where you don\u2019t speak the language",
      "The meeting where you realize you\u2019re the decision-maker now",
      "Feeling like a tourist in your own life",
      "Being responsible for someone else\u2019s career",
      "The guilt of leaving family behind",
      "Navigating politics you don\u2019t understand yet",
    ],
    // Ambition, growth, the next chapter
    row7: [
      "Wanting a promotion but not wanting to play the game",
      "Outgrowing your role but afraid to say it out loud",
      "Watching less qualified people get ahead",
      "The gap between your title and your capability",
      "Not knowing if you want the corner office or the exit",
      "Building a case for yourself that doesn\u2019t feel like begging",
      "The performance review that says nothing useful",
      "Stuck between loyalty and ambition",
      "Wanting more money but feeling guilty about it",
      "Planning your next move while pretending this one\u2019s fine",
      "The mentor who stopped mentoring",
      "Networking that feels like performing",
      "Knowing you\u2019re ready but nobody else sees it",
      "The raise that didn\u2019t come and the conversation you didn\u2019t have",
      "Career envy you won\u2019t admit to anyone",
      "Building skills on your own time because nobody invested in you",
    ],
  },

  // ── Pricing ──
  pricing: {
    headline: "Simple, honest pricing.",
    subheadline: "No hidden fees. No upsells. No contracts.",
    tiers: [
      {
        name: "First month",
        price: "Free",
        period: "",
        desc: "Full access to your program. Daily exercises, pattern tracking, journal, weekly reviews. No credit card required.",
        cta: "Start free",
        highlighted: false,
      },
      {
        name: "Monthly",
        price: "$49",
        period: "/month",
        desc: "Same depth, same personalization. Stay because it\u2019s helping, not because we made it hard to leave. Cancel anytime.",
        cta: "Continue your journey",
        highlighted: true,
      },
    ],
    footer: "Need coaching? 1:1 sessions available separately. Your company may cover this under L&D budgets.",
  },

  // ── Social Proof ──
  socialProof: {
    headline: "What people are saying.",
    items: [
      {
        quote: "I\u2019d spend Sunday nights rehearsing what to say in Monday\u2019s check-in. Not because I didn\u2019t know my stuff - because I couldn\u2019t tell anymore if my manager wanted me to improve or wanted me gone. Everyone kept saying \u2018just do your best.\u2019 That\u2019s not helpful when your best feels like it\u2019s never enough. The thing that clicked was realizing I was reacting to two things at once - the actual PIP and every criticism I\u2019d ever received, all stacked on top of each other. Once I pulled those apart, the real situation was still hard but it was manageable.",
        attribution: "Product manager at big tech company",
        tag: "PIP",
      },
      {
        quote: "People kept asking what I was going to do next. I didn\u2019t have an answer. I barely had a reason to get out of bed. The worst part wasn\u2019t losing the job - it was realizing how much of my identity was built on having one. Without the title, the team, the daily rhythm, I didn\u2019t know who I was. What helped was learning to separate the job from the person. Mapping out which parts of my confidence were real and which ones only existed inside that role.",
        attribution: "Senior engineer - Laid off after 6 years",
        tag: "Layoff",
      },
      {
        quote: "Everyone else in the room seemed so sure of themselves. I felt like I was faking it every single day. This program helped me understand that the lack of confidence wasn\u2019t about being new - it was something I\u2019d carried into every role I\u2019d ever had. Exacerbated by having been unemployed for a prolonged time before. This program helped see that more clearly.",
        attribution: "Director - New role after 1 year of unemployment",
        tag: "New Role",
      },
    ],
  },

  // ── Comparison Table ──
  // values: true = ✓, false = ✗, "partial" = ~
  comparison: {
    headline: "Intelligent Coaching + Intelligent Tech",
    subheadline: "",
    columns: ["Live coaching", "DIY with AI", "Mindcraft"],
    footnote: "",
    rows: [
      // ── Group: Ready when you are ──
      { group: "Ready when you are" },
      {
        feature: "There at 3 a.m. when the thoughts won\u2019t stop",
        values: [false, true, true] as (boolean | "partial" | string)[],
      },
      {
        feature: "Start the same day \u2014 no intake forms, no waitlist",
        values: [false, true, true] as (boolean | "partial" | string)[],
      },
      {
        feature: "Tracks your progress and mindset daily",
        values: [false, false, true] as (boolean | "partial" | string)[],
      },
      // ── Group: Knows what you\u2019re dealing with ──
      { group: "Knows what you\u2019re dealing with" },
      {
        feature: "Situation-specific plan curated by professional coaches",
        values: [true, false, true] as (boolean | "partial" | string)[],
      },
      {
        feature: "Learns how you think, react, and get stuck \u2014 within days",
        values: [true, "partial", true] as (boolean | "partial" | string)[],
      },
      // ── Group: Works on what happens between people ──
      { group: "Works on what happens between people" },
      {
        feature: "Rehearsal space for high-stakes conversations",
        values: [true, "partial", true] as (boolean | "partial" | string)[],
      },
      {
        feature: "Read the room \u2014 what\u2019s driving someone else\u2019s reaction",
        values: [true, "partial", true] as (boolean | "partial" | string)[],
      },

      // ── Group: Backed by real tools ──
      { group: "Backed by real tools" },
      {
        feature: "350+ curated frameworks \u2014 sequenced, not just available",
        values: ["partial", "partial", true] as (boolean | "partial" | string)[],
      },
      {
        feature: "A human coach when you need one \u2014 with your full context",
        values: [true, false, true] as (boolean | "partial" | string)[],
      },

      // ── Group: Designed to end ──
      { group: "Designed to end" },
      {
        feature: "Teaches you the skills \u2014 not just gets you through",
        values: [true, "partial", true] as (boolean | "partial" | string)[],
      },
      {
        feature: "Program length",
        values: ["3\u201312 months", "Open-ended", "30 days"] as (boolean | "partial" | string)[],
      },

      // ── Group: Cost ──
      { group: "Cost" },
      {
        feature: "Cost",
        values: ["$150\u2013$650/hr", "Free\u2013$20/mo", "$49 for 30 days"] as (boolean | "partial" | string)[],
      },
    ],
  },

  // ── Final CTA ──
  finalCta: {
    headline: "You don\u2019t have to white-knuckle through this.",
    subtext: "One month of structure. One program built for your situation.",
    primaryCta: "Find your program",
  },

  // ── Subscribe page ──
  subscribe: {
    headline: "You don\u2019t have to figure this out alone.",
    subheadline:
      "30 days of structure when you need it most. Real frameworks, personalised exercises, and a program that adapts to you. Human coaches available anytime.",
    pricingLabel: "Monthly",
    features: [
      "Personalised exercises from proven frameworks",
      "Pattern-powered reflections - not platitudes",
      "4-week coaching plan built around you",
      "Pattern recognition across your entries",
      "Weekly and monthly reviews that surface what matters",
      "Your data. Full stop. No training, ever.",
    ],
    cta: "Start your first month free",
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
    subheadline: "One last step. Then we\u2019ll start building your plan.",
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
    headline: "Welcome back.",
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
      { href: "/exercise", label: "Exercise", desc: "Today\u2019s exercise" },
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
        "General Feedback",
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
    headline: "Today\u2019s exercise.",
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
        title: "System Processing",
        badge: "Required",
        description:
          "Your entries are processed to generate coaching reflections, theme tags, and exercise recommendations. This is required for the service to function. Entries are never used to train models.",
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
        "To exercise any of these rights, contact crew@allmindsondeck.com",
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
