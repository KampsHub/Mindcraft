export interface ExerciseDefinition {
  id: string;
  name: string;
  modality: "cognitive" | "somatic" | "relational" | "integrative" | "systems";
  originator: string;
  primitive: string;
  whyThis?: string;
  whyNow?: string;
  science?: string;
  instruction: string;
  prePopulated?: Record<string, unknown>;
}

export const SYSTEMS_EXERCISES: ExerciseDefinition[] = [
  {
    id: "third-entity",
    name: "The 3rd Entity Exercise",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "dialogueSequence",
    whyThis: "Your journal keeps toggling between your needs and theirs — but no one is speaking for the relationship itself. Systems theory, particularly in ORSC coaching, treats a relationship as an emergent entity distinct from either partner. Research in social cognition suggests that externalizing a system — giving it a voice separate from the individuals — may activate perspective-taking circuits in the temporoparietal junction and quiet the self-referential loops that keep you locked in 'my needs vs. their needs.' When both people collaborate on behalf of the relationship rather than competing within it, something shifts.",
    instruction:
      "You will move through a guided dialogue in three rounds. First, speak as yourself about what you need. Then speak as the other person — what might they need? Finally, speak as the relationship itself: what does it need to thrive? Type each response in the dialogue panel before advancing to the next round.",
    prePopulated: {
      voices: [
        { id: "self", label: "You", color: "#7B9AAD" },
        { id: "other", label: "The Other Person", color: "#C4943A" },
        { id: "relationship", label: "The Relationship", color: "#6AB282" },
      ],
      turns: [
        { id: "t1", voice: "self", prompt: "What do you need right now in this relationship? Speak from your own perspective — what feels missing, unsaid, or unmet?", content: "" },
        { id: "t2", voice: "other", prompt: "Step into the other person's shoes. What might they need? What are they carrying that you haven't fully seen?", content: "" },
        { id: "t3", voice: "relationship", prompt: "Now speak as the relationship itself — as if it were a living thing with its own voice. What does it need to survive and grow?", content: "" },
      ],
    },
  },
  {
    id: "designing-team-alliance",
    name: "Designing Team Alliance",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    whyThis: "You mentioned friction with how decisions get made — that usually means the unwritten rules need to become written ones. When expectations stay implicit, your brain spends energy scanning for threats instead of collaborating. Amy Edmondson's research on psychological safety at Harvard (1999) found that teams with shared, explicit norms consistently outperform those relying on assumptions — because cognitive load shifts from vigilance to actual work. Making a behavioral contract explicit may help your prefrontal cortex's planning functions take the lead over the amygdala's threat response.",
    instruction:
      "Follow the guided prompts step by step. You will be asked what behaviors you want more of, what behaviors you want less of, and what agreements you need in place to do your best work. Answer each prompt honestly, then review your alliance as a summary at the end.",
  },
  {
    id: "alignment-work",
    name: "Alignment Work",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "spectrumSlider",
    whyThis: "You wrote about feeling pulled in different directions — this will show you exactly where the misalignment lives. Alignment exercises work by forcing you to place yourself on a concrete spectrum, which surfaces disagreements you might not consciously register. Research on interoceptive awareness suggests that the act of scaling — choosing a position — may engage the anterior insula's self-assessment function, converting vague feelings of 'something is off' into specific, visible gaps between where you are and where you want to be.",
    instruction:
      "For each statement, drag the slider to show where you honestly stand — from fully disagree on the left to fully agree on the right. Don't overthink it; your first instinct carries signal. After rating all items, review which statements show the widest gap between where you are and where you want to be.",
    prePopulated: {
      labels: ["Fully Disagree — this feels completely wrong or absent", "Disagree — more off than on", "Neutral — unclear or mixed", "Agree — mostly true for me", "Fully Agree — deeply resonant and lived"],
      value: 50,
    },
  },
  {
    id: "team-toxin-grid",
    name: "Team Toxin Grid",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "heatmap",
    whyThis: "There is a pattern of shutdown in your entries — and John Gottman's research at the University of Washington suggests that maps to one of four specific communication toxins worth naming: criticism, contempt, defensiveness, and stonewalling. This exercise maps where those patterns show up across different relationships in your life. Naming and locating the toxins may reduce their implicit power — affect-labeling research indicates that putting precise words to emotional patterns can engage the ventrolateral prefrontal cortex and help quiet amygdala reactivity.",
    instruction:
      "Each cell in the heatmap represents a combination of a toxin (criticism, contempt, defensiveness, stonewalling) and a context in your life. Tap each cell and rate its intensity from 0 (absent) to 4 (frequent). Look for hot spots — clusters of high intensity reveal where relational repair is most needed.",
    prePopulated: {
      rows: [
        { id: "criticism", label: "Criticism — attacking character rather than naming a specific behavior" },
        { id: "contempt", label: "Contempt — communicating disgust or superiority (eye-rolling, mockery, sarcasm)" },
        { id: "defensiveness", label: "Defensiveness — deflecting responsibility, counter-attacking, or playing the victim" },
        { id: "stonewalling", label: "Stonewalling — shutting down, withdrawing, or refusing to engage" },
      ],
      columns: [
        { id: "partner", label: "Partner" },
        { id: "team", label: "Team" },
        { id: "manager", label: "Manager" },
        { id: "family", label: "Family" },
        { id: "self-talk", label: "Self-Talk" },
      ],
    },
  },
  {
    id: "deep-democracy",
    name: "Deep Democracy",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "dialogueSequence",
    whyThis: "Your journal has a dominant voice and a quieter one underneath — the quieter one deserves airtime before it becomes a disruption. Deep Democracy, rooted in Arnold Mindell's process work, holds that marginalized voices in any system — including your inner system — carry critical information. When a perspective gets suppressed, it may create cognitive dissonance that quietly drains executive function until it is finally surfaced. Giving voice to dissent can activate divergent thinking and prevent the kind of internal groupthink where only one part of you gets to speak.",
    instruction:
      "This dialogue moves through three rounds. First, state the mainstream or majority position — the thing most people would say. Next, give voice to the minority or unpopular perspective — the thing that's hard to say. In the final round, find what is true in both and articulate a position that includes the wisdom of each. Type each perspective before advancing.",
    prePopulated: {
      voices: [
        { id: "mainstream", label: "Mainstream Voice", color: "#7B9AAD" },
        { id: "minority", label: "Minority Voice", color: "#D25858" },
        { id: "integration", label: "Integrated Wisdom", color: "#6AB282" },
      ],
      turns: [
        { id: "t1", voice: "mainstream", prompt: "What is the dominant or 'safe' position? The view that most people around you would agree with — the one that feels easy to say out loud.", content: "" },
        { id: "t2", voice: "minority", prompt: "Now give voice to the unpopular or hidden perspective — the thing that's hard to say, that might make people uncomfortable. What truth is being suppressed?", content: "" },
        { id: "t3", voice: "integration", prompt: "What is true in both? Articulate a position that honors the wisdom in the mainstream AND the minority voice without collapsing either one.", content: "" },
      ],
    },
  },
  {
    id: "force-field-analysis",
    name: "Force Field Analysis",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "forceField",
    whyThis:
      "You got an offer — 15% less salary, longer commute, but a great team and meaningful work — and you keep going back and forth. One minute you want to accept, the next you think you should hold out. That oscillation is not indecision — it is equal forces pulling in opposite directions. Kurt Lewin, one of the founders of social psychology, created Force Field Analysis in the 1940s to explain exactly this: every stuck situation is an equilibrium between driving and restraining forces. The counterintuitive insight is that reducing the restraining forces works better than pushing harder.",
    instruction:
      "Write your desired change at the top. Add driving forces on the left and restraining forces on the right. Rate each force's strength. Look for restraining forces you can weaken or remove — that is where the leverage is.",
    prePopulated: {
      centerLabel: "Accept the new role",
      drivingForces: [
        { id: "d1", label: "Meaningful work aligned with values", strength: 4 },
        { id: "d2", label: "Strong team culture and collaboration", strength: 3 },
        { id: "d3", label: "Growth opportunity and new skills", strength: 3 },
        { id: "d4", label: "Better work-life balance", strength: 2 },
      ],
      restrainingForces: [
        { id: "r1", label: "15% salary reduction", strength: 4 },
        { id: "r2", label: "Longer commute", strength: 3 },
        { id: "r3", label: "Fear of leaving something stable", strength: 3 },
        { id: "r4", label: "Uncertainty about the new org's direction", strength: 2 },
      ],
    },
  },
  {
    id: "lands-work",
    name: "Lands Work",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "narrativeTriptych",
    whyThis: "You described a conflict where you and the other person seem to live in different worlds — that is literally what this exercise maps. Lands Work, from ORSC coaching, externalizes each person's worldview as a territory with its own logic, values, and customs. Narrative identity theory suggests that when people articulate their 'land,' they may engage autobiographical memory networks and the medial prefrontal cortex, creating enough cognitive distance to transform adversarial positions into cultural differences — differences that can be bridged rather than fought over.",
    instruction:
      "You have three panels. In the first, describe your land — its values, customs, what matters most there. In the second, describe the other person's land as generously as you can — what do they value, what are their customs? In the third panel, describe the borderland: the shared territory where both lands overlap or could meet.",
    prePopulated: {
      panels: [
        { id: "my-land", title: "Your Land", subtitle: "Your values, customs, and what matters most", placeholder: "In my land, the most important things are... The customs here include... People in my land believe that...", content: "" },
        { id: "their-land", title: "Their Land", subtitle: "Their values, customs, and worldview — described generously", placeholder: "In their land, the most important things are... The customs there include... People in their land believe that...", content: "" },
        { id: "borderland", title: "The Borderland", subtitle: "Where both lands overlap or could meet", placeholder: "The shared territory includes... Both lands value... We could meet at...", content: "" },
      ],
    },
  },
  {
    id: "relationship-myth",
    name: "Relationship Myth",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "timelineRiver",
    whyThis: "You have been telling a story about this relationship — but every relationship has a deeper myth underneath the story. Time to surface it. Narrative psychology research suggests that relationships are governed by shared myths — implicit stories about origin, identity, and destiny. Mapping these myths on a timeline may activate episodic memory and the hippocampal-prefrontal circuit, allowing you to consciously revise the unconscious narratives that constrain how you show up right now.",
    instruction:
      "Plot the key moments of this relationship along the timeline river — the origin story, turning points, crises, and high points. For each, add a brief note about what it meant. As the river takes shape, notice the underlying myth: is this a rescue story? A rivalry? A quest? Name the myth at the end of the timeline.",
    prePopulated: {
      events: [
        { id: "e1", label: "How we met", date: "Beginning", emotion: "excitement" },
        { id: "e2", label: "First real conflict", date: "Early days", emotion: "tension" },
        { id: "e3", label: "A turning point that changed things", emotion: "shift" },
        { id: "e4", label: "The crisis — what nearly broke it", emotion: "rupture" },
        { id: "e5", label: "A high point — when it felt most alive", emotion: "connection" },
        { id: "e6", label: "Where we are now", date: "Present", emotion: "complexity" },
      ],
    },
  },
  {
    id: "paper-constellation",
    name: "Paper Constellation",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "stakeholderMap",
    whyThis: "You mentioned several people influencing this situation — placing them in space will reveal dynamics that words alone cannot capture. Systemic constellations research (Weinhold et al., 2014) suggests that physically arranging system members may reveal hidden loyalties, alliances, and exclusions that verbal analysis misses. Spatial mapping can engage your parietal cortex's spatial reasoning alongside right-hemisphere gestalt processing — a different kind of knowing than talking things through.",
    instruction:
      "Place yourself at the center of the map, then add each person or role involved in this situation. Drag them closer or farther to represent emotional closeness. Use the connection lines to show the quality of each relationship — supportive, tense, or distant. Step back and notice the overall shape: who is clustered together? Who is isolated?",
  },
  {
    id: "emotional-field-reading",
    name: "Emotional Field Reading",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "emotionWheel",
    whyThis: "Your recent entries carry an emotional undercurrent you have not named — naming the field is the first step to shifting it. The emotional field is the shared affective atmosphere of any system you are part of. Hatfield et al.'s research on emotional contagion (1994) found that group emotions propagate through mirror neuron networks and are often felt before they are understood. Putting explicit labels on what is hanging in the air may activate your ventrolateral prefrontal cortex, converting that vague 'something feels off' into information you can actually work with.",
    instruction:
      "Explore the emotion wheel and select every emotion you sense in the current atmosphere — not just what you feel personally, but what seems to hang in the air of this situation. Select as many as feel true. Then identify the two or three that feel most dominant. These form the emotional field you are living inside right now.",
  },
  {
    id: "three-levels-of-reality",
    name: "Three Levels of Reality",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "hierarchicalBranch",
    whyThis: "You keep circling the facts of what happened — but there are two deeper levels of reality you have not explored yet. Arnold Mindell's three levels framework distinguishes Consensus Reality (the facts), Dreaming (feelings, roles, and projections), and Essence (the deepest shared ground). Each level may engage distinct neural processing — from the dorsolateral PFC for factual analysis, to limbic and default-mode networks for meaning-making, to interoceptive networks for felt sense. Moving through all three can help integrate the fragmented processing that keeps you stuck on the surface.",
    instruction:
      "Start at the top level: Consensus Reality. List the objective facts — what happened, when, who was involved. Then branch down to Dreaming: what roles got activated, what feelings came up, what projections or assumptions appeared? Finally, branch to Essence: beneath all of it, what is the deepest truth or longing present? Build each level before moving deeper.",
    prePopulated: {
      levels: [
        { id: "cr1", label: "Consensus Reality — observable facts, verifiable data", prompt: "What are the objective facts? What happened, when, who was involved?", content: "My manager scheduled a meeting with no agenda. Three colleagues were CC'd on the invite. The meeting lasted 20 minutes. My project timeline was moved up by two weeks.", color: "#7B9AAD" },
        { id: "cr2", label: "Consensus Reality — observable facts, verifiable data", prompt: "What else is factually true that you might be overlooking?", content: "", color: "#7B9AAD" },
        { id: "dr1", label: "Dreaming — feelings, roles, projections, meaning-making", prompt: "What roles got activated? What feelings came up?", content: "I immediately felt like 'the one being managed out.' My Pleaser kicked in — I smiled and said 'no problem' about the timeline. Underneath: anger that no one asked if I could handle it.", color: "#C4943A" },
        { id: "dr2", label: "Dreaming — feelings, roles, projections, meaning-making", prompt: "What projections or assumptions appeared?", content: "I assumed the CC'd colleagues were there as witnesses. I assumed the timeline change was a test. Neither assumption has evidence.", color: "#C4943A" },
        { id: "es1", label: "Essence — the deepest shared ground, the longing beneath the conflict", prompt: "Beneath all of it — what is the deepest truth or longing?", content: "I want to be treated as a capable adult who can handle honest communication. The secrecy and ambiguity feel more threatening than any bad news would.", color: "#6AB282" },
      ],
    },
  },
  {
    id: "one-two-four-all",
    name: "1-2-4-ALL",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    whyThis: "You have a question you keep turning over alone — this structure will help you think it through in expanding layers of complexity. The 1-2-4-All method, from Lipmanowicz and McCandless's Liberating Structures, progressively scales your thinking from solo reflection to imagined dialogue to multiple perspectives. Solo reflection may engage default-mode introspection, while imagining others' responses can recruit mentalizing networks in the temporoparietal junction. Research on cognitive diversity suggests that each expansion may increase solution quality significantly over solo ideation — even when the 'others' are imagined.",
    instruction:
      "Follow the four guided rounds. Round 1 (solo): reflect silently and write your initial response. Round 2 (pair): imagine sharing with one other person — what would they add or challenge? Write the refined version. Round 3 (quad): now imagine two more perspectives — what new angles emerge? Round 4 (all): distill into the one insight that survived every round.",
  },
  {
    id: "triz",
    name: "TRIZ",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "forceField",
    whyThis: "You keep trying to build the thing you want — but you have not asked what you need to stop doing first. TRIZ (Theory of Inventive Problem Solving) uses inversion to bypass functional fixedness — a well-documented cognitive bias where the brain fixates on adding rather than subtracting. Research by Adams et al. (2021) confirms that people rarely consider subtraction as a solution. Listing counterproductive actions first may activate inhibitory control networks in the right inferior frontal gyrus, making it easier to see what needs to be eliminated before anything new can take root.",
    instruction:
      "On the left side, list everything you could do to guarantee the worst possible outcome — all the ways to reliably make this situation fail. Be creative and thorough. On the right side, honestly note which of those destructive behaviors you are currently doing, even partially. The force field reveals what must be stopped before anything new can work.",
    prePopulated: {
      centerLabel: "What Must Stop",
      drivingForces: [
        { id: "d1", label: "Never ask for help — prove you can do it alone", strength: 4 },
        { id: "d2", label: "Say yes to everything regardless of capacity", strength: 3 },
        { id: "d3", label: "Avoid all difficult conversations", strength: 4 },
        { id: "d4", label: "Work 14-hour days until you burn out", strength: 3 },
        { id: "d5", label: "Assume the worst about everyone's intentions", strength: 2 },
      ],
      restrainingForces: [
        { id: "r1", label: "Currently doing: agreeing to unrealistic timelines", strength: 4 },
        { id: "r2", label: "Currently doing: skipping lunch to 'catch up'", strength: 3 },
        { id: "r3", label: "Currently doing: avoiding the conversation with my manager about expectations", strength: 5 },
        { id: "r4", label: "Currently doing: checking email at midnight", strength: 3 },
      ],
    },
  },
  {
    id: "wicked-questions",
    name: "Wicked Questions",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "dotGrid",
    whyThis: "Your writing holds two truths that seem to contradict each other — a wicked question would hold them both without forcing a choice. Wicked questions, from Lipmanowicz and McCandless's Liberating Structures, surface paradoxes that cannot be resolved, only navigated. Engaging with paradox may activate the anterior cingulate cortex's conflict-monitoring system and increase what researchers call integrative complexity — the ability to hold multiple valid frameworks simultaneously. Leadership research suggests that higher integrative complexity is associated with better decision-making under uncertainty.",
    instruction:
      "Each dot on the grid represents a possible wicked question — a question that names two apparently contradictory truths as simultaneously valid. Format: 'How is it that [truth A] AND [truth B] at the same time?' Place your wicked questions on the grid. Cluster related paradoxes together. The richest questions are the ones that make you pause.",
    prePopulated: {
      items: [
        { id: "w1", label: "How is it that I want to leave AND I'm working harder than ever?", x: 30, y: 25 },
        { id: "w2", label: "How is it that I know I'm competent AND I feel like a fraud?", x: 70, y: 30 },
        { id: "w3", label: "How is it that I need support AND I can't ask for it?", x: 25, y: 65 },
        { id: "w4", label: "How is it that I resent the feedback AND I know some of it is valid?", x: 65, y: 70 },
      ],
      axisLabels: { top: "About Identity", bottom: "About Relationships", left: "Internal Paradox", right: "External Paradox" },
    },
  },
  {
    id: "nine-whys",
    name: "9 Whys",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "hierarchicalBranch",
    whyThis: "You stated what matters to you but stopped at the surface — nine layers down is where the real driver lives. Iterative 'why' questioning drives past post-hoc rationalizations by progressively engaging deeper autobiographical and values-based memory networks. Each layer may move processing from the dorsolateral PFC (rational explanation) toward the ventromedial PFC and insula (core values and felt meaning). The technique resembles the evocation principle from motivational interviewing, which research suggests increases intrinsic motivation by helping people discover their own reasons rather than borrowing someone else's.",
    instruction:
      "Start at the top with your stated commitment or goal. Then ask 'Why is that important to you?' and write the answer as the next branch. Keep asking 'Why?' for each new answer — going nine levels deep. Each branch should go deeper than the last. The bottom branches reveal your foundational motivation.",
    prePopulated: {
      levels: [
        { id: "w1", label: "Surface", prompt: "What is your stated goal or commitment?", content: "I want to handle this PIP successfully and keep my job.", color: "#7B9AAD" },
        { id: "w2", label: "Why #1", prompt: "Why is that important to you?", content: "Because I need the income and stability for my family.", color: "#7B9AAD" },
        { id: "w3", label: "Why #2", prompt: "Why is that important?", content: "Because being a provider is part of how I see myself.", color: "#C4943A" },
        { id: "w4", label: "Why #3", prompt: "Why does that matter?", content: "Because I learned early that your worth comes from what you contribute.", color: "#C4943A" },
        { id: "w5", label: "Why #4", prompt: "Go deeper — why?", content: "Because if I'm not contributing, I'm not sure I matter.", color: "#D6B65D" },
        { id: "w6", label: "Why #5", prompt: "What's underneath that?", content: "", color: "#D25858" },
      ],
    },
  },
  {
    id: "min-specs",
    name: "Min Specs",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "cardSort",
    whyThis: "You have a lot of rules for yourself — this will help you find which ones are truly load-bearing and which you can let go. Cognitive research, including Cowan's work on working memory limits, suggests that excessive rules degrade decision-making by saturating the roughly four items your working memory can hold at once. Min Specs applies the simplicity principle: identifying the minimum set of constraints needed for coherence. This mirrors how expert performers operate — with fewer, more deeply held rules — freeing prefrontal resources for the adaptive, in-the-moment responses you actually need.",
    instruction:
      "You will see a set of cards, each naming a rule or requirement you hold for this area of your life. Sort them into two categories: 'Must Do / Must Not Do' (absolute minimum rules needed for success) and 'Can Let Go' (rules that feel important but are not truly essential). Be ruthless — the goal is the smallest possible set of non-negotiable specs.",
    prePopulated: {
      buckets: [
        { id: "must", label: "Must Do / Must Not Do — the absolute minimum rules for success, without which things fall apart", color: "#C4943A" },
        { id: "let-go", label: "Can Let Go — feels important but is not truly essential; removing it would not cause failure", color: "#7B9AAD" },
      ],
      cards: [
        { id: "m1", label: "Respond to every email within 2 hours" },
        { id: "m2", label: "Never say no to a request from my manager" },
        { id: "m3", label: "Always have a prepared answer — never say 'I don't know'" },
        { id: "m4", label: "Be the first to arrive and last to leave" },
        { id: "m5", label: "Keep my commitments — if I said I'd do it, I do it" },
        { id: "m6", label: "Speak up when I disagree, even if it's uncomfortable" },
        { id: "m7", label: "Maintain one daily regulation anchor no matter what" },
        { id: "m8", label: "Never bring work stress home" },
        { id: "m9", label: "Exercise at least 3x per week" },
        { id: "m10", label: "Check in with one supportive person each week" },
      ],
      allowAdd: true,
    },
  },
  {
    id: "ecocycle-planning",
    name: "Ecocycle Planning",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "timelineRiver",
    whyThis: "Some things in your life are growing, others are stalling — mapping where each one lives in its lifecycle will clarify what to invest in and what to release. The adaptive cycle from Gunderson and Holling's panarchy theory describes four phases: birth, maturity, creative destruction, and renewal. Systems that avoid creative destruction become rigid traps; those that skip maturity become poverty traps. Mapping your activities to these lifecycle phases may help your brain's categorization systems reveal structural truths about what to continue, what to sunset, and what to seed — truths that emotion alone can obscure.",
    instruction:
      "Place your activities, projects, and commitments along the timeline river. Position each one in its lifecycle phase: Birth (just starting, high energy), Maturity (established, producing results), Creative Destruction (declining, needs to be released), or Renewal (cleared space, ready for new growth). Notice what phase is most crowded — that is where you are stuck.",
    prePopulated: {
      events: [
        { id: "e1", label: "New role responsibilities", date: "Birth", emotion: "excitement" },
        { id: "e2", label: "Core technical skills", date: "Maturity", emotion: "confidence" },
        { id: "e3", label: "Old work habits that no longer serve me", date: "Creative Destruction", emotion: "resistance" },
        { id: "e4", label: "Communication style overhaul", date: "Birth", emotion: "anxiety" },
        { id: "e5", label: "Professional network from previous job", date: "Creative Destruction", emotion: "grief" },
        { id: "e6", label: "New self-awareness from this program", date: "Renewal", emotion: "hope" },
      ],
    },
  },
  {
    id: "critical-uncertainties",
    name: "Critical Uncertainties",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "dotGrid",
    whyThis: "You are trying to predict what will happen next — this exercise replaces prediction with preparation across multiple futures. Scenario planning engages prospective memory and the brain's simulation network to mentally rehearse multiple futures at once. Research on strategic decision-making suggests that considering three to four scenarios may reduce overconfidence bias and improve strategic flexibility. The grid format forces you to consider combined uncertainties — something humans naturally underweight — so you can build strategies that hold up across multiple possible outcomes, not just the one you are hoping for.",
    instruction:
      "Identify two critical uncertainties — factors that are both highly important and highly unpredictable. These form the two axes of your grid. Each quadrant represents a different possible future. Place a dot in each quadrant and describe: what would this future look like? What would you need to do to thrive in it? The most robust strategies are the ones that work across multiple quadrants.",
    prePopulated: {
      items: [
        { id: "s1", label: "PIP succeeds + I stay: rebuild trust, set new boundaries", x: 25, y: 25 },
        { id: "s2", label: "PIP succeeds + I leave anyway: leverage the growth, exit on my terms", x: 75, y: 25 },
        { id: "s3", label: "PIP fails + market is strong: freedom to find a better fit", x: 75, y: 75 },
        { id: "s4", label: "PIP fails + market is weak: need financial runway + legal clarity", x: 25, y: 75 },
      ],
      axisLabels: { top: "PIP Succeeds", bottom: "PIP Fails", left: "I Stay", right: "I Leave" },
    },
  },
  {
    id: "fifteen-percent-solutions",
    name: "15% Solutions",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "cardSort",
    whyThis: "You described feeling stuck on a big change — the most powerful moves right now are small ones you have full authority to make. The 15% principle draws on Albert Bandura's self-efficacy theory and Peter Gollwitzer's implementation intentions research. Small, fully autonomous actions may bypass learned helplessness by activating the brain's reward prediction circuitry without triggering threat responses. Success on micro-actions can build upward spirals of agency and motivation — each small win reinforcing the next — until the 'stuck' starts to loosen.",
    instruction:
      "Each card represents an action you could take — without asking anyone's permission, without needing resources you don't have. Sort them into 'Within My 15%' (I can do this right now, alone, starting today) and 'Needs More Than Me' (requires permission, resources, or other people). Focus only on the first pile. Pick your top three and commit to one this week.",
    prePopulated: {
      buckets: [
        { id: "my15", label: "Within My 15% — I can do this today", color: "#6AB282" },
        { id: "more", label: "Needs More Than Me", color: "#8A9199" },
      ],
      cards: [
        { id: "s1", label: "Send one proactive status update to my manager before they ask" },
        { id: "s2", label: "Schedule a coffee with a colleague I haven't connected with" },
        { id: "s3", label: "Do the 90-second grounding sequence before my next check-in" },
        { id: "s4", label: "Update my resume this weekend" },
        { id: "s5", label: "Write down three specific accomplishments from this month" },
        { id: "s6", label: "Ask my manager for clarity on one vague PIP requirement" },
        { id: "s7", label: "Call one person in my network about opportunities" },
        { id: "s8", label: "Set a boundary: no email after 8pm tonight" },
        { id: "s9", label: "Request a formal meeting with HR to understand the PIP process" },
        { id: "s10", label: "Research employment lawyers in my area (just research, no commitment)" },
      ],
      allowAdd: true,
    },
  },
  {
    id: "what-so-what-now-what",
    name: "What, So What, Now What",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "wordCloud",
    whyThis: "You have been processing a lot of information — this structure will help you move from observing to meaning-making to action. The What/So What/Now What protocol, from Lipmanowicz and McCandless's Liberating Structures, separates three cognitive stages that people typically collapse together. 'What' engages perceptual and episodic memory. 'So What' activates interpretive networks for meaning-making. 'Now What' recruits action-planning circuits. Separating these stages may prevent premature conclusions and ensure that your observations actually inform your next move rather than bypassing interpretation altogether.",
    instruction:
      "Type words and phrases for each of three rounds. Round 1 — WHAT: What did you observe? What happened? Enter the raw facts and noticings. Round 2 — SO WHAT: Why does it matter? What patterns do you see? Enter your interpretations. Round 3 — NOW WHAT: What actions follow? What will you do next? Enter your commitments. Watch the cloud build — the largest words show where your energy concentrates.",
  },
  {
    id: "scarf-model",
    name: "SCARF Model",
    modality: "systems",
    originator: "David Rock (NeuroLeadership Institute)",
    primitive: "wheelChart",
    whyThis: "Your journal mentions a social situation that triggered you — SCARF will tell you exactly which social need got threatened. David Rock's SCARF model, informed by Matthew Lieberman's social cognitive neuroscience research, identifies five domains of social threat and reward: Status, Certainty, Autonomy, Relatedness, and Fairness. Lieberman's work suggests these domains may activate the same neural circuitry as physical pain and pleasure — meaning social threats are not 'just in your head.' Identifying the specific domain converts diffuse social distress into a targeted intervention point.",
    instruction:
      "Rate each of the five SCARF domains on the wheel: Status (sense of importance relative to others), Certainty (ability to predict what comes next), Autonomy (sense of control over events), Relatedness (sense of safety with others), and Fairness (perception of just exchange). Rate each from threatened to fulfilled. The lowest-rated domain is your primary leverage point.",
    prePopulated: {
      categories: ["Status — your sense of importance relative to others", "Certainty — your ability to predict what happens next", "Autonomy — your sense of control over events and choices", "Relatedness — your sense of safety and belonging with others", "Fairness — your perception of just and equitable exchange"],
      values: [3, 2, 4, 6, 3],
    },
  },
  {
    id: "eisenhower-matrix",
    name: "Eisenhower Matrix",
    modality: "systems",
    originator: "Dwight D. Eisenhower (popularized by Stephen Covey)",
    primitive: "dotGrid",
    whyThis: "You listed a lot of things demanding your attention — but urgency and importance are not the same thing, and your brain is conflating them. The urgency-importance distinction maps onto competing neural systems: urgency may activate the amygdala and salience network (respond now), while importance engages the prefrontal cortex's goal-maintenance circuitry (stay on course). Roy Baumeister's research suggests that urgent-but-unimportant tasks hijack attention through temporal discounting — they feel pressing because they are close in time, not because they matter. Spatially sorting your tasks into quadrants can disrupt this bias by forcing you to evaluate both dimensions explicitly.",
    instruction:
      "The grid has two axes: Urgency (horizontal) and Importance (vertical). Place each task or concern as a dot in the appropriate quadrant. Top-right (urgent + important): do now. Top-left (important, not urgent): schedule. Bottom-right (urgent, not important): delegate or automate. Bottom-left (neither): drop. Notice how many items end up in each quadrant — most people overweight the bottom-right.",
    prePopulated: {
      items: [
        { id: "t1", label: "Respond to manager's email about PIP metrics", x: 80, y: 20 },
        { id: "t2", label: "Update resume and LinkedIn", x: 20, y: 30 },
        { id: "t3", label: "Reply to non-urgent Slack messages", x: 75, y: 75 },
        { id: "t4", label: "Schedule therapy appointment", x: 25, y: 25 },
        { id: "t5", label: "Read all 47 unread emails", x: 60, y: 70 },
        { id: "t6", label: "Prepare for tomorrow's check-in", x: 70, y: 20 },
        { id: "t7", label: "Research employment lawyers", x: 30, y: 40 },
      ],
      axisLabels: { top: "Important", bottom: "Not Important", left: "Not Urgent", right: "Urgent" },
    },
  },
  {
    id: "social-network-webbing",
    name: "Social Network Webbing",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "stakeholderMap",
    whyThis: "You mentioned feeling isolated in this effort — mapping your actual network will likely reveal more support than you think. Mark Granovetter's foundational research on weak ties shows that peripheral connections — people you do not talk to every day — often provide more novel resources than close bonds. Social network analysis reveals structural holes and bridging ties that predict information flow and influence. Visualizing your network may activate the mentalizing system and correct the common bias of underestimating your available social capital.",
    instruction:
      "Place yourself at the center, then add every person relevant to this challenge — close allies, distant contacts, even people you've lost touch with. Position them by closeness to you. Draw connection lines to show the relationship quality. Then look for structural patterns: who bridges separate clusters? Who is unexpectedly close to resources you need? Who have you been overlooking?",
  },
  {
    id: "outer-inner-secret-roles",
    name: "Outer/Inner/Secret Roles",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "cardSort",
    whyThis: "You described a role you play for others — but there are layers beneath it that hold the tension you are feeling. Role theory identifies three layers: the outer (the public face), the inner (your private experience of that role), and the secret (the hidden desires, fears, or agendas no one sees). Making all three layers explicit may reduce the cognitive load of role maintenance. James Pennebaker's disclosure research suggests that articulating hidden aspects of identity can reduce physiological stress markers — the secret layer is where the energy for change lives, and naming it may be what frees it.",
    instruction:
      "You will see cards for different roles or identities you carry. For each one, sort it into three categories: 'Outer Role' (what others see and expect), 'Inner Role' (your private experience of this role — what it actually feels like), and 'Secret Role' (what no one knows — the hidden wish, fear, or agenda underneath). Be honest with the secret layer — that is where the energy for change lives.",
    prePopulated: {
      buckets: [
        { id: "outer", label: "Outer Role — the public face others see and expect (e.g., 'the reliable one')", color: "#7B9AAD" },
        { id: "inner", label: "Inner Role — what it actually feels like behind the mask (e.g., exhaustion, resentment)", color: "#C4943A" },
        { id: "secret", label: "Secret Role — the hidden wish, fear, or agenda no one knows (e.g., wanting to quit)", color: "#D25858" },
      ],
      cards: [
        { id: "r1", label: "The competent professional who has it under control" },
        { id: "r2", label: "The team player who never complains" },
        { id: "r3", label: "The person who is actually exhausted and scared" },
        { id: "r4", label: "The one who secretly wants to quit and do something completely different" },
        { id: "r5", label: "The partner who says 'I'm fine' when asked about work" },
        { id: "r6", label: "The one who is angry at the system but performs gratitude" },
        { id: "r7", label: "The person who knows they need help but won't ask" },
        { id: "r8", label: "The achiever who secretly measures their worth by their title" },
      ],
      allowAdd: true,
    },
  },
  {
    id: "raci-solo",
    name: "RACI Solo Version",
    modality: "systems",
    originator: "Project Management (adapted for individual use)",
    primitive: "cardSort",
    whyThis: "You are carrying too many responsibilities — RACI will help you see where you have over-assigned yourself and where you can redistribute. Research by Taris and Schreurs (2009) found that role clarity is one of the strongest predictors of reduced burnout. The RACI framework — Responsible, Accountable, Consulted, Informed — forces explicit assignment that counteracts the diffusion of responsibility and the over-commitment bias. Sorting your responsibilities into these categories may activate the categorization systems of the lateral PFC, making implicit role assumptions visible and actionable.",
    instruction:
      "Each card is a task or responsibility on your plate right now. Sort each one into four categories: 'Responsible' (I do the work), 'Accountable' (I own the outcome but could delegate the work), 'Consulted' (I should have input but not do it), or 'Informed' (I just need to know it happened). If most cards land in Responsible, that is your bottleneck.",
    prePopulated: {
      buckets: [
        { id: "responsible", label: "Responsible — I do the work", color: "#D25858" },
        { id: "accountable", label: "Accountable — I own it, could delegate", color: "#C4943A" },
        { id: "consulted", label: "Consulted — I give input, don't do it", color: "#7B9AAD" },
        { id: "informed", label: "Informed — I just need to know", color: "#8A9199" },
      ],
      cards: [
        { id: "t1", label: "Weekly status reports for PIP" },
        { id: "t2", label: "Stakeholder communication improvements" },
        { id: "t3", label: "Team project deliverables" },
        { id: "t4", label: "Training course completion" },
        { id: "t5", label: "Documentation of process changes" },
        { id: "t6", label: "Cross-team coordination meetings" },
        { id: "t7", label: "Mentoring a junior colleague" },
        { id: "t8", label: "Budget tracking for my projects" },
        { id: "t9", label: "Client relationship management" },
        { id: "t10", label: "Personal development plan updates" },
      ],
      allowAdd: true,
    },
  },
  {
    id: "kotter-eight-step",
    name: "Kotter's 8-Step Change Model",
    modality: "systems",
    originator: "John Kotter (Harvard Business School)",
    primitive: "timelineRiver",
    whyThis: "You are trying to drive a change but it keeps stalling — Kotter's model will show you which step you skipped. John Kotter's research at Harvard Business School found that roughly 70% of change efforts fail, usually because early steps — building urgency and forming a coalition — get skipped. The eight-step sequence maps onto a predictable arc: from threat detection (urgency) to social recruitment (coalition) to goal-setting (vision) to habit formation (short-term wins) to consolidation (anchoring). Skipping steps creates implementation gaps that effort alone cannot bridge — you have to go back and do the step you missed.",
    instruction:
      "Plot where you are on the eight-step timeline: (1) Create Urgency, (2) Build a Coalition, (3) Form a Vision, (4) Communicate the Vision, (5) Remove Obstacles, (6) Create Short-Term Wins, (7) Build on Change, (8) Anchor in Culture. Mark each step as done, in progress, or not started. The first incomplete step is where your change effort is actually stalled — everything after it is premature.",
    prePopulated: {
      events: [
        { id: "k1", label: "1. Create Urgency — Why must this change happen now?", date: "Step 1", emotion: "urgency" },
        { id: "k2", label: "2. Build a Coalition — Who are your allies?", date: "Step 2", emotion: "connection" },
        { id: "k3", label: "3. Form a Vision — What does success look like?", date: "Step 3", emotion: "clarity" },
        { id: "k4", label: "4. Communicate the Vision — Who needs to hear it?", date: "Step 4", emotion: "alignment" },
        { id: "k5", label: "5. Remove Obstacles — What's blocking progress?", date: "Step 5", emotion: "frustration" },
        { id: "k6", label: "6. Create Short-Term Wins — What can you show this week?", date: "Step 6", emotion: "momentum" },
        { id: "k7", label: "7. Build on Change — How do you sustain it?", date: "Step 7", emotion: "persistence" },
        { id: "k8", label: "8. Anchor in Culture — How does it become 'how we do things'?", date: "Step 8", emotion: "integration" },
      ],
    },
  },
  {
    id: "psychological-safety-assessment",
    name: "Psychological Safety Assessment",
    modality: "systems",
    originator: "Amy Edmondson (Harvard Business School)",
    primitive: "wheelChart",
    whyThis: "You described holding back in a group setting — that is a psychological safety signal worth quantifying so you can act on it. Amy Edmondson's research at Harvard defines psychological safety as the shared belief that a team is safe for interpersonal risk-taking. When safety is low, the brain's social threat circuitry may suppress contribution, creativity, and error-reporting — you hold back not because you have nothing to say, but because saying it feels too costly. Assessing safety across multiple dimensions can convert that vague feeling of unsafety into specific, addressable domains.",
    instruction:
      "Rate each dimension of psychological safety on the wheel: willingness to ask questions, comfort admitting mistakes, safety to disagree, freedom to take risks, confidence raising concerns, and sense of being valued. Rate each from low to high. The lowest-rated dimensions point to the specific behaviors (yours or others') that need to change for the group to function at its potential.",
    prePopulated: {
      categories: ["Asking Questions — feeling safe to say 'I don't understand'", "Admitting Mistakes — owning errors without fear of punishment", "Disagreeing Safely — challenging ideas without social cost", "Taking Risks — trying new approaches without fear of failure", "Raising Concerns — flagging problems early without being labeled negative", "Being Valued — feeling that your contribution matters to the group"],
      values: [4, 2, 3, 2, 3, 5],
    },
  },
  {
    id: "energy-attention-audit",
    name: "Energy-Attention Audit",
    modality: "systems",
    originator: "Adapted from attention management research (Mark, Czerwinski)",
    primitive: "progressRiver",
    whyThis: "Your recent entries suggest your energy and attention are going to different places than your stated priorities — this audit will make the gap visible. Gloria Mark's research on attention fragmentation at UC Irvine found that knowledge workers switch contexts every three minutes and need roughly 23 minutes to recover focus. This audit uses ecological momentary assessment principles to track where your resources actually go versus where you believe they go, surfacing the intention-behavior gap that may be driving chronic frustration and depleted executive function.",
    instruction:
      "The progress river tracks two streams over your recent week: energy (how alive and resourced you felt) and attention (what actually got your focus hours). Plot each day's energy level and primary attention targets along the river. Where the two streams diverge — high energy on low-priority tasks, or low energy on high-priority ones — is where systemic redesign is needed.",
  },
  {
    id: "heard-seen-respected",
    name: "Heard, Seen, Respected",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "wheelChart",
    whyThis: "You described a moment where you felt dismissed — this exercise will help you pinpoint whether you needed to be heard, seen, or respected, because each requires a different repair. Beckes and Coan's social baseline theory suggests that feeling heard, seen, and respected reduces the brain's metabolic cost of coping with threat. Each domain maps to a distinct social need — being heard, being seen, and being respected may each engage different neural pathways. Deficits in any one domain can increase allostatic load, so knowing which one was missing tells you exactly where to focus relational repair.",
    instruction:
      "Rate three dimensions on the wheel: Heard (people listen to and understand my perspective), Seen (people recognize my contributions and effort), and Respected (people treat me with dignity and value my role). Rate each from rarely to consistently. Then for each dimension, note one specific recent moment where it was present or absent. The lowest dimension is where to focus relational repair.",
    prePopulated: {
      categories: ["Heard — people listen to and understand my perspective", "Seen — people recognize my contributions and effort", "Respected — people treat me with dignity and value my role"],
      values: [4, 3, 5],
    },
  },
  {
    id: "generative-relationships-star",
    name: "Generative Relationships STAR",
    modality: "systems",
    originator: "Glenda Eoyang (Human Systems Dynamics Institute)",
    primitive: "stakeholderMap",
    whyThis: "You keep working with the same people but getting different results — STAR will show you which relationship conditions are missing. Glenda Eoyang's STAR model at the Human Systems Dynamics Institute identifies four conditions for generative relationships: Separateness (distinct identities), Tuning (mutual attentiveness), Action opportunities (shared work), and Reason to work together (shared purpose). Each condition may engage different neural pathways — from self-other differentiation to joint attention to goal alignment. When a relationship stagnates, weak conditions predict where the breakdown lives, and more effort in a strong area will not compensate for a weak one.",
    instruction:
      "Place each key relationship on the stakeholder map. For each one, assess the four STAR conditions: Separateness (do you maintain distinct identities?), Tuning (do you pay attention to each other?), Action (do you have shared work?), and Reason (do you share a purpose?). Annotate each relationship with which conditions are strong and which are weak. Relationships missing two or more conditions need redesign, not more effort.",
  },
];
