/**
 * Scenario overlays for exercises.
 * Maps exercise IDs to scenario text + pre-populated data.
 * These simulate what the AI coaching system would generate
 * based on the user's journal entry.
 */

export const SCENARIOS: Record<string, { scenario?: string; prePopulated?: Record<string, unknown> }> = {
  // ── Cognitive ──
  "abc-model": {
    scenario: "I keep replaying the conversation with my manager. She said 'we need to talk about your trajectory' and I immediately thought — I'm about to be fired. My stomach dropped. I couldn't focus for the rest of the day. I know I'm catastrophizing but I can't stop.",
  },
  "check-the-facts": {
    scenario: "My skip-level cancelled our 1:1 for the third time. I'm convinced he's avoiding me because he knows something I don't. Everyone else seems to have their meetings. I feel singled out.",
  },
  "pattern-name": {
    scenario: "I noticed I did it again — someone gave me positive feedback in the team meeting and I immediately deflected. 'Oh it was a team effort.' Why can't I just say thank you? It happens every single time.",
  },
  "three-circles": {
    scenario: "I'm spinning on everything at once — the job search, the severance timeline, whether my former colleagues think less of me, the economy, AI taking over my field. I can't tell what I can actually do something about versus what I'm just worrying about.",
  },
  "saboteur-check": {
    scenario: "I spent four hours preparing for a 30-minute networking call. I rewrote my talking points six times. Then I almost cancelled because I 'wasn't ready.' The call went fine. I do this every time.",
  },

  // ── Somatic ──
  "window-of-tolerance": {
    scenario: "I woke up at 4am again with my heart pounding. Couldn't get back to sleep. By 9am I was exhausted but wired. Snapped at my partner over something small. I feel like I'm running on fumes but can't slow down.",
  },
  "body-scan": {
    scenario: "During the interview prep today I realized my jaw was clenched so tight it was giving me a headache. I've been grinding my teeth at night too. My shoulders feel like they're touching my ears.",
  },
  "emotion-wave": {
    scenario: "The anger hit me out of nowhere today. I was reading a LinkedIn post from my former VP — the one who signed off on my layoff — and he was posting about 'investing in our people.' I wanted to scream. It felt like it would never stop.",
  },

  // ── Relational ──
  "ofnr-practice": {
    scenario: "My manager said 'I need you to be more proactive' in our 1:1 and I just shut down. I kept thinking — what does that even mean? I do everything she asks. On the drive home I realized I was furious but I couldn't explain why. I think the word 'proactive' triggered something.",
    prePopulated: {
      leftColumnLabel: "Step",
      rightColumnLabel: "Your response",
      rows: [
        { id: "1", leftText: "Observation — What was actually said or done?", rightText: "She said: 'I need you to be more proactive.'", tags: [] },
        { id: "2", leftText: "Feeling — What emotion came up? (not a judgment like 'attacked', but the actual feeling)", rightText: "", tags: [] },
        { id: "3", leftText: "Need — What need is underneath that feeling?", rightText: "", tags: [] },
        { id: "4", leftText: "Request — What specific, doable thing would you ask for?", rightText: "", tags: [] },
      ],
      availableTags: [],
    },
  },
  "enemy-image-process": {
    scenario: "I can't stop being angry at Sarah from HR. She smiled the whole time she was reading my termination letter. She didn't even look uncomfortable. I've been rehearsing what I should have said for three weeks.",
  },
  "four-horsemen-antidotes": {
    scenario: "My partner asked how the job search was going and I snapped 'You always ask at the worst time.' Then they got quiet and I could feel them pulling away. We barely talked the rest of the night. This keeps happening.",
    prePopulated: {
      cards: [
        { id: "c1", label: "⚡ 'You always ask at the worst time.'" },
        { id: "c2", label: "⚡ Rolling eyes when they bring up the job search" },
        { id: "c3", label: "⚡ 'I only snapped because you kept pushing'" },
        { id: "c4", label: "⚡ Going silent and barely talking for the rest of the night" },
        { id: "a1", label: "✦ 'When you ask about the search right when I walk in, I feel pressured. Could I have some time first?'" },
        { id: "a2", label: "✦ 'I appreciate that you care about how the search is going.'" },
        { id: "a3", label: "✦ 'You're right — I have been shutting down when you ask.'" },
        { id: "a4", label: "✦ 'I'm feeling flooded. Can we take 20 minutes and come back to this?'" },
      ],
      buckets: [
        { id: "criticism", label: "Criticism → Gentle Startup", color: "#D4A84E" },
        { id: "contempt", label: "Contempt → Appreciation", color: "#D25858" },
        { id: "defensiveness", label: "Defensiveness → Take Responsibility", color: "#7B9AAD" },
        { id: "stonewalling", label: "Stonewalling → Self-Soothe", color: "#8A9199" },
      ],
      allowAdd: true,
    },
  },

  // ── Integrative ──
  "ifs-daily-checkin": {
    scenario: "There's a part of me that wants to just give up the job search and take the first thing that comes along. And another part that's furious at that part — saying I'm selling myself short. They've been arguing all morning.",
    prePopulated: {
      voices: [
        { id: "quitter", label: "The part that wants to give up", color: "#7B9AAD" },
        { id: "standards", label: "The part that says you're selling yourself short", color: "#D4A84E" },
        { id: "self", label: "Self — stepping back", color: "#6AB282" },
      ],
      turns: [
        { id: "1", voice: "quitter", prompt: "What are you feeling right now?", content: "" },
        { id: "2", voice: "quitter", prompt: "What are you afraid will happen if you keep searching?", content: "" },
        { id: "3", voice: "quitter", prompt: "What do you need from me right now?", content: "" },
        { id: "4", voice: "standards", prompt: "What are you feeling right now?", content: "" },
        { id: "5", voice: "standards", prompt: "What are you afraid will happen if I settle?", content: "" },
        { id: "6", voice: "standards", prompt: "What do you need from me right now?", content: "" },
        { id: "7", voice: "self", prompt: "Now that you've heard from both parts — what does the calmer, curious part of you notice? Can you hold both without choosing a side?", content: "" },
      ],
    },
  },
  "self-led-journaling": {
    scenario: "The perfectionist part is so loud today. Every cover letter I write, it says 'not good enough, rewrite it.' I've been on the same application for three days. I know it's a part, not all of me, but it feels like all of me.",
  },
  "immunity-to-change": {
    scenario: "I keep saying I want to network more — I know it's the fastest way to find a role. But every time I have a chance, I find a reason not to. I prepared for two events this week and cancelled both. Something is blocking me and I don't understand what.",
  },

  // ── Systems ──
  "force-field-analysis": {
    scenario: "I got an offer. It's not perfect — the salary is 15% less than my last role, the commute is longer, but the team seems great and the work is meaningful. I keep going back and forth. One minute I want to accept, the next I think I should hold out.",
  },
  "paper-constellation": {
    scenario: "I'm trying to figure out who I can actually trust at the new company. My manager seems supportive but political. The team lead is warm but I've heard mixed things. HR has been responsive. I need to map this out before I make any moves.",
  },

  // ── Core program exercises ──
  "parachute-day-1": {
    scenario: "It's been two weeks since the layoff. I'm still waking up at 6am out of habit, reaching for my laptop, then remembering there's nowhere to log in. The days feel shapeless. I don't know where to start.",
    prePopulated: {
      categories: ["Income", "Routine", "Identity", "Belonging", "Competence", "Future", "Skills"],
      values: [5, 5, 5, 5, 5, 5, 5],
    },
  },
  "parachute-day-2": {
    prePopulated: {
      events: [
        { id: "start", label: "First signs of a shift", date: "6+ months ago", emotion: "" },
        { id: "mid", label: "A key moment", date: "A few months ago", emotion: "" },
        { id: "end", label: "The day it happened", date: "Recently", emotion: "" },
      ],
    },
  },
  "parachute-day-4": {
    scenario: "I noticed that voice again — the one that says 'you should have seen this coming' and 'if you were better, this wouldn't have happened.' It's loudest at 3am and right before I open LinkedIn.",
    prePopulated: {
      cards: [
        { id: "s1", label: "The Judge — 'You should have seen this coming'" },
        { id: "s2", label: "The Perfectionist — 'If you were better, this wouldn't have happened'" },
        { id: "s3", label: "The People-Pleaser — 'You should reach out to everyone and say yes to everything'" },
        { id: "s4", label: "The Controller — 'You need a plan for every scenario'" },
        { id: "s5", label: "The Hyper-Achiever — 'Your worth depends on your next title'" },
        { id: "s6", label: "The Avoider — 'Just don't think about it and it'll be fine'" },
        { id: "s7", label: "The Victim — 'Nothing you do will make a difference'" },
        { id: "s8", label: "The Restless — 'You need to do something NOW, anything'" },
        { id: "s9", label: "The Hyper-Vigilant — 'Watch for every sign that something else will go wrong'" },
        { id: "s10", label: "The Comparer — 'Everyone else is doing better than you'" },
      ],
      buckets: [
        { id: "top", label: "This is me — loud and frequent", color: "#D25858" },
        { id: "sometimes", label: "Shows up sometimes", color: "#D4A84E" },
        { id: "not-me", label: "Not really my pattern", color: "#8A9199" },
      ],
      allowAdd: true,
    },
  },
  "parachute-day-5": {
    prePopulated: {
      items: [
        { id: "f1", label: "Severance timeline", x: 25, y: 70 },
        { id: "f2", label: "Monthly expenses", x: 20, y: 80 },
        { id: "f3", label: "Health insurance", x: 30, y: 60 },
        { id: "f4", label: "Never finding a job", x: 75, y: 75 },
        { id: "f5", label: "Savings runway", x: 20, y: 50 },
        { id: "f6", label: "Industry collapse", x: 80, y: 40 },
        { id: "f7", label: "Mortgage / rent", x: 15, y: 85 },
        { id: "f8", label: "Being seen as a failure", x: 85, y: 55 },
      ],
      axisLabels: { top: "Urgent", bottom: "Not Urgent", left: "Based on Evidence", right: "Based on Fear" },
    },
  },
  "parachute-day-6": {
    prePopulated: {
      leftColumnLabel: "Anchor",
      rightColumnLabel: "When",
      rows: [
        { id: "1", leftText: "Physical — e.g. a walk, stretching, cooking", rightText: "", tags: [] },
        { id: "2", leftText: "Reflective — e.g. journaling, this program, reading", rightText: "", tags: [] },
        { id: "3", leftText: "Connective — e.g. a call, a text, being around people", rightText: "", tags: [] },
      ],
      availableTags: [],
    },
  },
  "parachute-day-7": {
    scenario: "Some days I feel like I've accepted what happened. Other days the anger comes back so hard it surprises me. Yesterday I was fine. Today I can barely get off the couch. I don't know where I am in this process.",
    prePopulated: {
      labels: ["Shock", "Anger", "Bargaining", "Sadness", "Acceptance"],
      value: 25,
    },
  },
  "parachute-day-8": {
    prePopulated: {
      leftLabel: "The Job",
      rightLabel: "Me",
      items: [
        { id: "i1", label: "Job title" },
        { id: "i2", label: "Salary & benefits" },
        { id: "i3", label: "Office / workspace" },
        { id: "i4", label: "Team I built" },
        { id: "i5", label: "Curiosity" },
        { id: "i6", label: "How I solve problems" },
        { id: "i7", label: "Empathy" },
        { id: "i8", label: "Ability to stay calm" },
        { id: "i9", label: "Strategic thinking" },
        { id: "i10", label: "Sense of humor" },
        { id: "i11", label: "Daily structure" },
        { id: "i12", label: "Being a mentor" },
        { id: "i13", label: "Industry expertise" },
        { id: "i14", label: "Resilience" },
      ],
    },
  },
  "parachute-day-9": {
    prePopulated: {
      rows: [
        { id: "r1", label: "Close friends" },
        { id: "r2", label: "Family" },
        { id: "r3", label: "Work colleagues" },
        { id: "r4", label: "Professional network" },
        { id: "r5", label: "Neighborhood / local" },
        { id: "r6", label: "Online communities" },
        { id: "r7", label: "Interest groups" },
      ],
      columns: [
        { id: "c1", label: "Before" },
        { id: "c2", label: "Now" },
        { id: "c3", label: "Gap" },
      ],
    },
  },
  "parachute-day-10": {
    prePopulated: {
      leftColumnLabel: "Belief",
      rightColumnLabel: "Where it came from · Helps or hinders?",
      rows: [
        { id: "1", leftText: "My value is what I produce", rightText: "", tags: [] },
        { id: "2", leftText: "I should always have a plan", rightText: "", tags: [] },
        { id: "3", leftText: "Asking for help means I can't handle it", rightText: "", tags: [] },
        { id: "4", leftText: "If I'm not growing, I'm falling behind", rightText: "", tags: [] },
        { id: "5", leftText: "I need to prove myself before I belong", rightText: "", tags: [] },
      ],
      availableTags: [],
    },
  },
  "parachute-day-11": {
    prePopulated: {
      levels: [
        { id: "1a", label: "Family messages", prompt: "e.g. 'Hard work is the only thing that matters'", content: "", color: "#D4A84E" },
        { id: "1b", label: "Family messages", prompt: "e.g. 'Don't ask for help — figure it out yourself'", content: "", color: "#D4A84E" },
        { id: "1c", label: "Family messages", prompt: "e.g. 'You're only as good as your last achievement'", content: "", color: "#D4A84E" },
        { id: "2a", label: "Work culture", prompt: "e.g. 'Always be available — boundaries mean you're not committed'", content: "", color: "#7B9AAD" },
        { id: "2b", label: "Work culture", prompt: "e.g. 'Your title defines your value'", content: "", color: "#7B9AAD" },
        { id: "3a", label: "What you believe now", prompt: "e.g. 'If I'm not producing, I'm worthless'", content: "", color: "#6AB282" },
        { id: "3b", label: "What you believe now", prompt: "e.g. 'I don't know who I am without a role'", content: "", color: "#6AB282" },
      ],
    },
  },
  "parachute-day-12": {
    prePopulated: {
      voices: [
        { id: "judge", label: "The Judge", color: "#D25858" },
        { id: "perfectionist", label: "The Perfectionist", color: "#D4A84E" },
        { id: "comparer", label: "The Comparer", color: "#7B9AAD" },
      ],
      turns: [
        { id: "1", voice: "judge", prompt: "When did this voice show up this week? What was the situation?", content: "" },
        { id: "2", voice: "judge", prompt: "What exactly did it say to you?", content: "" },
        { id: "3", voice: "judge", prompt: "Next time you hear it, what might you try instead?", content: "" },
        { id: "4", voice: "perfectionist", prompt: "When did this voice show up this week?", content: "" },
        { id: "5", voice: "perfectionist", prompt: "What did it say, and what did it cost you?", content: "" },
        { id: "6", voice: "perfectionist", prompt: "Next time, what might you try?", content: "" },
        { id: "7", voice: "comparer", prompt: "When did this voice show up this week?", content: "" },
        { id: "8", voice: "comparer", prompt: "What did it say, and how did it feel?", content: "" },
        { id: "9", voice: "comparer", prompt: "Next time, what might you try?", content: "" },
      ],
    },
  },
  "parachute-day-13": {
    prePopulated: {
      cards: [
        { id: "v1", label: "Adventure / Risk" },
        { id: "v2", label: "Experiment / Dare" },
        { id: "v3", label: "Beauty / Grace" },
        { id: "v4", label: "Elegance / Refinement" },
        { id: "v5", label: "To Catalyze / Impact" },
        { id: "v6", label: "Spark / Influence" },
        { id: "v7", label: "To Contribute / Serve" },
        { id: "v8", label: "Strengthen / Provide" },
        { id: "v9", label: "To Create / Build" },
        { id: "v10", label: "Design / Invent" },
        { id: "v11", label: "To Discover / Learn" },
        { id: "v12", label: "Perceive / Uncover" },
        { id: "v13", label: "To Feel / Experience" },
        { id: "v14", label: "Sensations / Energy" },
        { id: "v15", label: "To Lead / Guide" },
        { id: "v16", label: "Inspire / Persuade" },
        { id: "v17", label: "Mastery / Excellence" },
        { id: "v18", label: "Expert / Set standards" },
        { id: "v19", label: "Pleasure / Have fun" },
        { id: "v20", label: "Play / Be amused" },
        { id: "v21", label: "To Relate / Connect" },
        { id: "v22", label: "Nurture / Community" },
        { id: "v23", label: "Be Sensitive / Empathize" },
        { id: "v24", label: "Compassion / Be present" },
        { id: "v25", label: "Be Spiritual / Aware" },
        { id: "v26", label: "Oneness / Sacredness" },
        { id: "v27", label: "To Teach / Educate" },
        { id: "v28", label: "Enlighten / Uplift" },
        { id: "v29", label: "To Win / Accomplish" },
        { id: "v30", label: "Triumph / Prevail" },
      ],
      buckets: [
        { id: "this-is-me", label: "This Is Me", color: "#6AB282" },
        { id: "maybe", label: "Maybe", color: "#D4A84E" },
        { id: "not-me", label: "Not Me", color: "#8A9199" },
      ],
      allowAdd: true,
    },
  },
  "parachute-day-14": {
    prePopulated: {
      items: ["Autonomy", "Impact", "Creativity", "Connection", "Security", "Growth", "Recognition", "Purpose"],
      question: "Which value matters more to you?",
    },
  },
  "parachute-day-15": {
    prePopulated: {
      scenarios: [
        {
          id: "s1",
          prompt: "A startup offers you a creative lead role — the work is exactly what you love, the team is tiny and passionate. But the salary is 35% less than your last role, and there's no guarantee the company survives 18 months.",
          optionA: "Take the role — the work aligns with what matters most to me, and I'll figure out the money",
          optionB: "Pass — financial security is too important right now to take that risk",
          valueA: "Creativity",
          valueB: "Security",
        },
        {
          id: "s2",
          prompt: "A former colleague refers you to a well-known company. The role is stable and pays well, but it's a step backward in scope — you'd be executing, not leading. Your colleague says 'just get in and work your way up.'",
          optionA: "Take it — stability matters more right now than title",
          optionB: "Hold out — I need a role where I can lead, not just execute",
          valueA: "Security",
          valueB: "Autonomy",
        },
        {
          id: "s3",
          prompt: "You're offered two freelance projects at the same time. One pays well but the client is difficult and the work is uninspiring. The other is fascinating and mission-driven, but pays half as much.",
          optionA: "Take the well-paying project — I need the financial cushion",
          optionB: "Take the mission-driven project — meaningful work energizes me",
          valueA: "Security",
          valueB: "Purpose",
        },
        {
          id: "s4",
          prompt: "A recruiter approaches you for a high-visibility role at a prestigious company. The catch: it requires relocation, and your partner and closest friends are where you are now.",
          optionA: "Pursue it — this opportunity could define my next chapter",
          optionB: "Stay — my relationships and community matter more than any title",
          valueA: "Growth",
          valueB: "Connection",
        },
        {
          id: "s5",
          prompt: "You have the option to launch your own consulting practice. The freedom is appealing, but it means months of unpaid setup, no team, and total uncertainty about income.",
          optionA: "Go for it — autonomy and building something of my own is worth the risk",
          optionB: "Find a full-time role first — I need structure and stability before I can build",
          valueA: "Autonomy",
          valueB: "Security",
        },
      ],
    },
  },
  "parachute-day-16": {
    prePopulated: {
      leftColumnLabel: "Structural Factor",
      rightColumnLabel: "What's Personal",
      rows: [
        { id: "1", leftText: "Company-wide layoffs / restructuring", rightText: "", tags: ["structural"] },
        { id: "2", leftText: "AI and automation shifting headcount plans", rightText: "", tags: ["structural"] },
        { id: "3", leftText: "Budget cuts across the industry", rightText: "", tags: ["structural"] },
        { id: "4", leftText: "My role was eliminated, not my performance", rightText: "", tags: ["mixed"] },
        { id: "5", leftText: "I could have networked more proactively", rightText: "", tags: ["personal"] },
        { id: "6", leftText: "", rightText: "", tags: [] },
        { id: "7", leftText: "", rightText: "", tags: [] },
      ],
      availableTags: ["structural", "personal", "mixed"],
    },
  },
  "parachute-day-17": {
    prePopulated: {
      leftColumnLabel: "What I Did",
      rightColumnLabel: "The Evidence",
      rows: [
        { id: "1", leftText: "Led the migration to the new platform", rightText: "Completed 3 weeks ahead of schedule; VP mentioned it in all-hands", tags: ["impact"] },
        { id: "2", leftText: "Mentored two junior engineers", rightText: "Both got promoted within a year; one reached out after my layoff to say thanks", tags: ["leadership"] },
        { id: "3", leftText: "Built the reporting dashboard from scratch", rightText: "Still used by the team daily; reduced reporting time by 60%", tags: ["technical"] },
        { id: "4", leftText: "Handled the client escalation calmly", rightText: "Client renewed their contract; manager said I 'saved the relationship'", tags: ["leadership"] },
        { id: "5", leftText: "", rightText: "", tags: [] },
        { id: "6", leftText: "", rightText: "", tags: [] },
        { id: "7", leftText: "", rightText: "", tags: [] },
        { id: "8", leftText: "", rightText: "", tags: [] },
      ],
      availableTags: ["leadership", "technical", "impact"],
    },
  },
  "parachute-day-18": {
    scenario: "A friend asked me what happened at work and I gave them the polished version — 'restructuring, nothing personal.' But that's not the whole truth. There are at least three versions of this story and I don't know which one is real.",
    prePopulated: {
      panels: [
        { id: "polished", label: "The Polished Version", prompt: "What you'd say at a networking event or to an acquaintance" },
        { id: "honest", label: "The Honest Version", prompt: "What you'd tell a trusted friend over dinner" },
        { id: "raw", label: "The 3am Version", prompt: "The unfiltered story you tell yourself when you can't sleep" },
      ],
    },
  },
  "parachute-day-19": {
    prePopulated: {
      cards: [
        { id: "c1", label: "Company did multiple rounds of layoffs" },
        { id: "c2", label: "AI tools replaced part of my team's function" },
        { id: "c3", label: "The entire industry is contracting headcount" },
        { id: "c4", label: "My manager and I had a difficult relationship" },
        { id: "c5", label: "I was on a team that was seen as 'non-core'" },
        { id: "c6", label: "I didn't adapt quickly enough to new tools" },
        { id: "c7", label: "The company was cutting costs to hit earnings targets" },
        { id: "c8", label: "I turned down a lateral move that might have protected me" },
        { id: "c9", label: "Remote workers were disproportionately laid off" },
        { id: "c10", label: "I could have been more visible to leadership" },
        { id: "c11", label: "The role itself was being automated" },
        { id: "c12", label: "I was the most recent hire on the team (last in, first out)" },
      ],
      buckets: [
        { id: "systemic", label: "Systemic — shared by thousands", color: "#7B9AAD" },
        { id: "personal", label: "Personal — genuinely about me", color: "#D4A84E" },
        { id: "mixed", label: "Mixed — both played a role", color: "#6AB282" },
      ],
      allowAdd: true,
    },
  },
  "parachute-day-20": {
    prePopulated: {
      leftColumnLabel: "Story Element",
      rightColumnLabel: "Your Version",
      rows: [
        { id: "1", leftText: "What happened — the facts", rightText: "", tags: [] },
        { id: "2", leftText: "Why it happened — the structural context", rightText: "", tags: [] },
        { id: "3", leftText: "What was personal — your honest self-assessment", rightText: "", tags: [] },
        { id: "4", leftText: "What you learned from the experience", rightText: "", tags: [] },
        { id: "5", leftText: "What you're looking for next — and why", rightText: "", tags: [] },
        { id: "6", leftText: "One sentence that captures it all", rightText: "", tags: [] },
      ],
      availableTags: [],
    },
  },
  "parachute-day-21": {
    prePopulated: {
      categories: ["Strategic Thinking", "Technical Skills", "People Leadership", "Communication", "Problem Solving", "Industry Knowledge", "Adaptability", "Creative Thinking"],
      values: [5, 5, 5, 5, 5, 5, 5, 5],
    },
  },
  "parachute-day-22": {
    prePopulated: {
      leftLabel: "What Interests Me",
      rightLabel: "What I'm Good At",
      items: [
        { id: "i1", label: "Teaching or mentoring" },
        { id: "i2", label: "Building something from scratch" },
        { id: "i3", label: "Writing or content creation" },
        { id: "i4", label: "Working with data" },
        { id: "i5", label: "Consulting / advising" },
        { id: "i6", label: "People management" },
        { id: "i7", label: "Design or creative work" },
        { id: "i8", label: "Strategy and planning" },
        { id: "i9", label: "Working with AI tools" },
        { id: "i10", label: "Community building" },
        { id: "i11", label: "Public speaking" },
        { id: "i12", label: "Cross-functional collaboration" },
      ],
    },
  },
  "parachute-day-23": {
    prePopulated: {
      events: [
        { id: "e1", label: "Day 1 — Saw the full disruption map for the first time", date: "Week 1", emotion: "" },
        { id: "e2", label: "Day 4 — Named my loudest saboteurs", date: "Week 1", emotion: "" },
        { id: "e3", label: "Day 8 — Separated what belonged to the job vs. what's mine", date: "Week 2", emotion: "" },
        { id: "e4", label: "Day 13-14 — Surfaced and ranked my values", date: "Week 2", emotion: "" },
        { id: "e5", label: "Day 17 — Built the evidence record", date: "Week 3", emotion: "" },
        { id: "e6", label: "Day 18 — Wrote three versions of my story", date: "Week 3", emotion: "" },
        { id: "e7", label: "", date: "", emotion: "" },
        { id: "e8", label: "", date: "", emotion: "" },
      ],
    },
  },
  "parachute-day-24": {
    prePopulated: {
      dataPoints: [
        { id: "d1", label: "Income & Financial Security", before: 3, after: 5 },
        { id: "d2", label: "Identity", before: 2, after: 5 },
        { id: "d3", label: "Routine & Structure", before: 3, after: 6 },
        { id: "d4", label: "Confidence", before: 2, after: 5 },
        { id: "d5", label: "Belonging", before: 4, after: 5 },
        { id: "d6", label: "Purpose", before: 3, after: 5 },
        { id: "d7", label: "Safety & Stability", before: 3, after: 5 },
      ],
      periods: { before: "Day 1", after: "Today" },
    },
  },
  "parachute-day-25": {
    prePopulated: {
      saboteurs: [
        {
          id: "s1",
          name: "The Judge",
          description: "The voice that says you should have seen it coming, that you're not good enough, that this is your fault.",
          trigger: "",
          script: "",
          counterMove: "",
        },
        {
          id: "s2",
          name: "The Perfectionist",
          description: "The voice that rewrites the same email six times, that says nothing is ready, that keeps you stuck in preparation mode.",
          trigger: "",
          script: "",
          counterMove: "",
        },
        {
          id: "s3",
          name: "The Comparer",
          description: "The voice that scrolls LinkedIn and says everyone else is doing better, that measures your worth against others' highlight reels.",
          trigger: "",
          script: "",
          counterMove: "",
        },
      ],
    },
  },
  "parachute-day-26": {
    prePopulated: {
      scenarios: [
        {
          id: "s1",
          prompt: "You receive two job offers on the same day. Offer A is at a company whose mission excites you — the work aligns with your top value (Purpose). The salary is adequate. Offer B pays 40% more and has a clear promotion path, but the work feels generic.",
          optionA: "Take the mission-aligned role — Purpose is my top value and the money is adequate",
          optionB: "Take the higher-paying role — financial recovery is urgent and I can find purpose elsewhere",
          valueA: "Purpose",
          valueB: "Security",
        },
        {
          id: "s2",
          prompt: "A friend recommends you for a role leading a new team. It's a big step up in responsibility and visibility. But you'd be managing eight people from day one with no ramp-up time, and your Autonomy value says you do your best work with space to figure things out.",
          optionA: "Take the leadership role — Growth means stretching beyond comfort",
          optionB: "Look for a role with more autonomy — I know I thrive with space to work my way",
          valueA: "Growth",
          valueB: "Autonomy",
        },
        {
          id: "s3",
          prompt: "You're offered a remote contract role with full flexibility — work when you want, where you want. The pay is good. But the work is solo: no team, no collaboration, no mentoring. Your Connection value ranked high.",
          optionA: "Take it — the flexibility and pay serve my immediate needs",
          optionB: "Keep looking — working in isolation conflicts with what I know I need",
          valueA: "Autonomy",
          valueB: "Connection",
        },
        {
          id: "s4",
          prompt: "A recruiter presents a role at a prestigious company. The brand recognition would open doors for years. But people you trust describe the culture as competitive and political — the opposite of the collaborative environment where you do your best work.",
          optionA: "Pursue it — the career capital is worth navigating a tough culture",
          optionB: "Pass — culture fit matters more than brand, especially now",
          valueA: "Growth",
          valueB: "Connection",
        },
      ],
    },
  },
  "parachute-day-27": {
    prePopulated: {
      panels: [
        { id: "saboteur", label: "The Saboteur's Version", prompt: "How does the story sound when your inner critic takes over? What gets exaggerated, minimized, or added?" },
        { id: "centered", label: "The Centered Version", prompt: "The true version — honest without being punishing. What you refined on Day 20." },
        { id: "repair", label: "The Repair Version", prompt: "When you feel the saboteur taking over mid-conversation, what do you say to yourself to get back to center?" },
      ],
    },
  },
  "parachute-day-28": {
    prePopulated: {
      cards: [
        { id: "t1", label: "Still processing anger about how it happened" },
        { id: "t2", label: "Haven't had the honest conversation with my partner" },
        { id: "t3", label: "Financial plan needs professional review" },
        { id: "t4", label: "Network outreach feels forced — not natural yet" },
        { id: "t5", label: "The Judge saboteur still shows up daily" },
        { id: "t6", label: "Haven't updated my resume or LinkedIn" },
        { id: "t7", label: "Still avoiding certain social situations" },
        { id: "t8", label: "Narrative works on paper but falls apart in person" },
        { id: "t9", label: "Unsure about career direction — still exploring" },
        { id: "t10", label: "Physical health has taken a backseat" },
      ],
      buckets: [
        { id: "time", label: "Needs More Time", color: "#7B9AAD" },
        { id: "support", label: "Needs Professional Support", color: "#D4A84E" },
        { id: "action", label: "Needs a Specific Action", color: "#6AB282" },
        { id: "practice", label: "Needs Continued Practice", color: "#D25858" },
      ],
      allowAdd: true,
    },
  },
  "parachute-day-29": {
    prePopulated: {
      leftColumnLabel: "Letter Section",
      rightColumnLabel: "To Future Me",
      rows: [
        { id: "1", leftText: "What I want you to remember about this period", rightText: "", tags: [] },
        { id: "2", leftText: "The saboteurs you'll hear again — and what to do", rightText: "", tags: [] },
        { id: "3", leftText: "The values that should guide your decisions", rightText: "", tags: [] },
        { id: "4", leftText: "The evidence of competence you tend to forget", rightText: "", tags: [] },
        { id: "5", leftText: "The commitments you're making right now", rightText: "", tags: [] },
        { id: "6", leftText: "What you hope will be different in 90 days", rightText: "", tags: [] },
      ],
      availableTags: [],
    },
  },
  "parachute-day-30": {
    prePopulated: {
      prompts: [
        { id: "p1", prompt: "Write one sentence about where you actually are right now. Not where you were on Day 1. Not where you wish you were. Just: where are you, honestly, today?" },
      ],
    },
  },
  "jetstream-day-4": {
    scenario: "I read the PIP document again today. It says 'deliverables have not met expected timelines' and 'communication needs improvement.' But my brain keeps adding: 'you're a fraud, everyone knows it, this is proof.' I can't tell what's real feedback and what's my fear talking.",
  },
  "jetstream-day-6": {
    scenario: "I need to figure out who's actually on my side in this PIP situation. My manager initiated it, but my skip-level seems supportive. HR feels procedural. I have allies on the team but I don't know if they'd speak up.",
  },
  "basecamp-day-4": {
    scenario: "I'm three weeks into the new role and I keep getting tripped up by the culture. My old company was blunt and fast — here people are indirect and deliberate. I said something in a meeting yesterday and got blank stares. I think I was too direct.",
  },
};
