export interface ExerciseDefinition {
  id: string;
  name: string;
  modality: "cognitive" | "somatic" | "relational" | "integrative" | "systems";
  originator: string;
  primitive: string;
  whyNow: string;
  science: string;
  instruction: string;
}

export const SYSTEMS_EXERCISES: ExerciseDefinition[] = [
  {
    id: "third-entity",
    name: "The 3rd Entity Exercise",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "dialogueSequence",
    whyNow:
      "Your journal keeps toggling between your needs and theirs — but no one is speaking for the relationship itself.",
    science:
      "Systems theory holds that a relationship is an emergent entity distinct from its members. Externalizing it activates perspective-taking circuits in the temporoparietal junction and reduces self-referential default-mode fixation, allowing partners to collaborate on behalf of the system rather than competing within it.",
    instruction:
      "You will move through a guided dialogue in three rounds. First, speak as yourself about what you need. Then speak as the other person — what might they need? Finally, speak as the relationship itself: what does it need to thrive? Type each response in the dialogue panel before advancing to the next round.",
  },
  {
    id: "designing-team-alliance",
    name: "Designing Team Alliance",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    whyNow:
      "You mentioned friction with how decisions get made — that usually means the unwritten rules need to become written ones.",
    science:
      "Explicit behavioral contracts reduce ambiguity and activate the prefrontal cortex's planning functions over the amygdala's threat response. Research on psychological safety (Edmondson, 1999) shows that teams with shared norms outperform those relying on implicit expectations, because cognitive load shifts from vigilance to collaboration.",
    instruction:
      "Follow the guided prompts step by step. You will be asked what behaviors you want more of, what behaviors you want less of, and what agreements you need in place to do your best work. Answer each prompt honestly, then review your alliance as a summary at the end.",
  },
  {
    id: "alignment-work",
    name: "Alignment Work",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "spectrumSlider",
    whyNow:
      "You wrote about feeling pulled in different directions — this will show you exactly where the misalignment lives.",
    science:
      "Alignment exercises leverage interoceptive awareness and forced-choice scaling to surface implicit disagreements. The act of placing oneself on a spectrum engages the anterior insula's role in self-assessment and makes abstract attitudes concrete, which research shows improves group decision-making accuracy.",
    instruction:
      "For each statement, drag the slider to show where you honestly stand — from fully disagree on the left to fully agree on the right. Don't overthink it; your first instinct carries signal. After rating all items, review which statements show the widest gap between where you are and where you want to be.",
  },
  {
    id: "team-toxin-grid",
    name: "Team Toxin Grid",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "heatmap",
    whyNow:
      "There's a pattern of shutdown in your entries — Gottman's research says that maps to one of four specific toxins worth naming.",
    science:
      "Based on Gottman's Four Horsemen (criticism, contempt, defensiveness, stonewalling), this exercise maps toxic communication patterns across contexts. Naming and locating toxins reduces their implicit power by engaging the ventrolateral prefrontal cortex's affect-labeling function, which downregulates amygdala reactivity by up to 30%.",
    instruction:
      "Each cell in the heatmap represents a combination of a toxin (criticism, contempt, defensiveness, stonewalling) and a context in your life. Tap each cell and rate its intensity from 0 (absent) to 4 (frequent). Look for hot spots — clusters of high intensity reveal where relational repair is most needed.",
  },
  {
    id: "deep-democracy",
    name: "Deep Democracy",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "dialogueSequence",
    whyNow:
      "Your journal has a dominant voice and a quieter one underneath — the quieter one deserves airtime before it becomes a disruption.",
    science:
      "Deep Democracy, rooted in Mindell's process work, posits that marginalized voices in a system carry critical information. Giving voice to dissent activates divergent thinking networks and prevents groupthink. Neuroscience shows suppressed perspectives create cognitive dissonance that drains executive function until surfaced.",
    instruction:
      "This dialogue moves through three rounds. First, state the mainstream or majority position — the thing most people would say. Next, give voice to the minority or unpopular perspective — the thing that's hard to say. In the final round, find what is true in both and articulate a position that includes the wisdom of each. Type each perspective before advancing.",
  },
  {
    id: "force-field-analysis",
    name: "Force Field Analysis",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "forceField",
    whyNow:
      "You keep describing a change you want but can't seem to make — mapping the forces holding it in place will show you where to push.",
    science:
      "Kurt Lewin's force field model treats behavior as an equilibrium between driving and restraining forces. Research shows that reducing restraining forces is more effective than increasing driving forces, because push-back generates reactance. Visualizing both sides engages the dorsolateral prefrontal cortex's planning and weighing functions.",
    instruction:
      "Write your desired change at the top. Then add driving forces on the left — everything pushing toward the change — and restraining forces on the right — everything holding it back. Rate each force's strength. The goal is not to overpower resistance but to identify which restraining forces can be weakened or removed.",
  },
  {
    id: "lands-work",
    name: "Lands Work",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "narrativeTriptych",
    whyNow:
      "You described a conflict where you and the other person seem to live in different worlds — that's literally what this exercise maps.",
    science:
      "Lands Work externalizes worldviews as territories with their own logic, values, and customs. This leverages narrative identity theory — when people articulate their 'land,' they engage autobiographical memory networks and the medial prefrontal cortex, creating cognitive distance that transforms adversarial positions into cultural differences that can be bridged.",
    instruction:
      "You have three panels. In the first, describe your land — its values, customs, what matters most there. In the second, describe the other person's land as generously as you can — what do they value, what are their customs? In the third panel, describe the borderland: the shared territory where both lands overlap or could meet.",
  },
  {
    id: "relationship-myth",
    name: "Relationship Myth",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "timelineRiver",
    whyNow:
      "You've been telling a story about this relationship — but every relationship has a deeper myth underneath the story. Time to surface it.",
    science:
      "Narrative psychology shows that relationships are governed by shared myths — implicit stories about origin, identity, and destiny. Mapping these myths on a timeline activates episodic memory and the hippocampal-prefrontal circuit, allowing conscious revision of unconscious narratives that constrain current behavior.",
    instruction:
      "Plot the key moments of this relationship along the timeline river — the origin story, turning points, crises, and high points. For each, add a brief note about what it meant. As the river takes shape, notice the underlying myth: is this a rescue story? A rivalry? A quest? Name the myth at the end of the timeline.",
  },
  {
    id: "paper-constellation",
    name: "Paper Constellation",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "stakeholderMap",
    whyNow:
      "You mentioned several people influencing this situation — placing them in space will reveal dynamics that words alone can't capture.",
    science:
      "Spatial mapping of relational systems activates the parietal cortex's spatial reasoning and the right hemisphere's gestalt processing. Systemic constellations research (Weinhold et al., 2014) shows that physical arrangement of system members reveals hidden loyalties, alliances, and exclusions that verbal analysis misses.",
    instruction:
      "Place yourself at the center of the map, then add each person or role involved in this situation. Drag them closer or farther to represent emotional closeness. Use the connection lines to show the quality of each relationship — supportive, tense, or distant. Step back and notice the overall shape: who is clustered together? Who is isolated?",
  },
  {
    id: "emotional-field-reading",
    name: "Emotional Field Reading",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "emotionWheel",
    whyNow:
      "Your recent entries carry an emotional undercurrent you haven't named — naming the field is the first step to shifting it.",
    science:
      "The emotional field is the shared affective atmosphere of a system. Research on emotional contagion (Hatfield et al., 1994) shows that group emotions propagate through mirror neuron networks and are often felt before they are understood. Explicit labeling activates the ventrolateral prefrontal cortex, converting implicit affect into actionable data.",
    instruction:
      "Explore the emotion wheel and select every emotion you sense in the current atmosphere — not just what you feel personally, but what seems to hang in the air of this situation. Select as many as feel true. Then identify the two or three that feel most dominant. These form the emotional field you are living inside right now.",
  },
  {
    id: "three-levels-of-reality",
    name: "Three Levels of Reality",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "hierarchicalBranch",
    whyNow:
      "You keep circling the facts of what happened — but there are two deeper levels of reality you haven't explored yet.",
    science:
      "Arnold Mindell's three levels — Consensus Reality (facts), Dreaming (feelings, roles, projections), and Essence (deepest shared ground) — map onto distinct neural processing: dorsolateral PFC for facts, limbic and default-mode networks for meaning-making, and interoceptive networks for felt sense. Moving through all three integrates fragmented processing into coherent understanding.",
    instruction:
      "Start at the top level: Consensus Reality. List the objective facts — what happened, when, who was involved. Then branch down to Dreaming: what roles got activated, what feelings came up, what projections or assumptions appeared? Finally, branch to Essence: beneath all of it, what is the deepest truth or longing present? Build each level before moving deeper.",
  },
  {
    id: "one-two-four-all",
    name: "1-2-4-ALL",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    whyNow:
      "You have a question you keep turning over alone — this structure will help you think it through in expanding layers of complexity.",
    science:
      "Progressive scaling from individual to dyad to small group leverages both focused reflection and social elaboration. Solo reflection activates default-mode introspection, while imagined dialogue recruits mentalizing networks in the TPJ and mPFC. Each expansion adds cognitive diversity, which research shows increases solution quality by 20-40% over solo ideation.",
    instruction:
      "Follow the four guided rounds. Round 1 (solo): reflect silently and write your initial response. Round 2 (pair): imagine sharing with one other person — what would they add or challenge? Write the refined version. Round 3 (quad): now imagine two more perspectives — what new angles emerge? Round 4 (all): distill into the one insight that survived every round.",
  },
  {
    id: "triz",
    name: "TRIZ",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "forceField",
    whyNow:
      "You keep trying to build the thing you want — but you haven't asked what you need to stop doing first.",
    science:
      "TRIZ (Theory of Inventive Problem Solving) uses inversion to bypass functional fixedness — a well-documented cognitive bias where the brain perseverates on additive solutions. Research by Adams et al. (2021) confirms people rarely consider subtraction. Listing counterproductive actions first activates inhibitory control networks in the right inferior frontal gyrus, making it easier to identify what to eliminate.",
    instruction:
      "On the left side, list everything you could do to guarantee the worst possible outcome — all the ways to reliably make this situation fail. Be creative and thorough. On the right side, honestly note which of those destructive behaviors you are currently doing, even partially. The force field reveals what must be stopped before anything new can work.",
  },
  {
    id: "wicked-questions",
    name: "Wicked Questions",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "dotGrid",
    whyNow:
      "Your writing holds two truths that seem to contradict each other — a wicked question would hold them both without forcing a choice.",
    science:
      "Wicked questions surface paradoxes that cannot be resolved, only navigated. Engaging with paradox activates the anterior cingulate cortex's conflict-monitoring system and increases integrative complexity — the ability to hold multiple valid frameworks simultaneously. Research shows leaders with higher integrative complexity make better decisions under uncertainty.",
    instruction:
      "Each dot on the grid represents a possible wicked question — a question that names two apparently contradictory truths as simultaneously valid. Format: 'How is it that [truth A] AND [truth B] at the same time?' Place your wicked questions on the grid. Cluster related paradoxes together. The richest questions are the ones that make you pause.",
  },
  {
    id: "nine-whys",
    name: "9 Whys",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "hierarchicalBranch",
    whyNow:
      "You stated what matters to you but stopped at the surface — nine layers down is where the real driver lives.",
    science:
      "Iterative 'why' questioning drives past post-hoc rationalizations by progressively engaging deeper autobiographical and values-based memory networks. Each layer moves from dorsolateral PFC (rational explanation) toward ventromedial PFC and insula (core values and felt meaning). The technique resembles motivational interviewing's evocation principle, which increases intrinsic motivation.",
    instruction:
      "Start at the top with your stated commitment or goal. Then ask 'Why is that important to you?' and write the answer as the next branch. Keep asking 'Why?' for each new answer — going nine levels deep. Each branch should go deeper than the last. The bottom branches reveal your foundational motivation.",
  },
  {
    id: "min-specs",
    name: "Min Specs",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "cardSort",
    whyNow:
      "You have a lot of rules for yourself — this will help you find which ones are truly load-bearing and which you can let go.",
    science:
      "Cognitive overload from excessive rules degrades decision-making by saturating working memory (Cowan's 4-item limit). Min Specs applies the simplicity principle: identifying the minimum set of constraints needed for coherence. This mirrors how expert performers operate — with fewer, more deeply held rules — freeing prefrontal resources for adaptive response.",
    instruction:
      "You will see a set of cards, each naming a rule or requirement you hold for this area of your life. Sort them into two categories: 'Must Do / Must Not Do' (absolute minimum rules needed for success) and 'Can Let Go' (rules that feel important but are not truly essential). Be ruthless — the goal is the smallest possible set of non-negotiable specs.",
  },
  {
    id: "ecocycle-planning",
    name: "Ecocycle Planning",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "timelineRiver",
    whyNow:
      "Some things in your life are growing, others are stalling — mapping where each one lives in its lifecycle will clarify what to invest in and what to release.",
    science:
      "The adaptive cycle from panarchy theory (Gunderson & Holling) describes four phases: birth, maturity, creative destruction, and renewal. Systems that avoid creative destruction become rigid traps; those that skip maturity become poverty traps. Mapping activities to lifecycle phases uses the brain's categorization systems to reveal structural rather than emotional truths about what to continue, sunset, or seed.",
    instruction:
      "Place your activities, projects, and commitments along the timeline river. Position each one in its lifecycle phase: Birth (just starting, high energy), Maturity (established, producing results), Creative Destruction (declining, needs to be released), or Renewal (cleared space, ready for new growth). Notice what phase is most crowded — that is where you are stuck.",
  },
  {
    id: "critical-uncertainties",
    name: "Critical Uncertainties",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "dotGrid",
    whyNow:
      "You are trying to predict what will happen next — this exercise replaces prediction with preparation across multiple futures.",
    science:
      "Scenario planning engages prospective memory and the brain's simulation network (hippocampus, mPFC, lateral temporal cortex) to mentally rehearse multiple futures. Research shows that considering 3-4 scenarios reduces overconfidence bias and improves strategic flexibility. The grid format forces consideration of combined uncertainties, which humans naturally underweight.",
    instruction:
      "Identify two critical uncertainties — factors that are both highly important and highly unpredictable. These form the two axes of your grid. Each quadrant represents a different possible future. Place a dot in each quadrant and describe: what would this future look like? What would you need to do to thrive in it? The most robust strategies are the ones that work across multiple quadrants.",
  },
  {
    id: "fifteen-percent-solutions",
    name: "15% Solutions",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "cardSort",
    whyNow:
      "You described feeling stuck on a big change — the most powerful moves right now are small ones you have full authority to make.",
    science:
      "The 15% principle leverages self-efficacy theory (Bandura) and implementation intentions research (Gollwitzer). Small, fully autonomous actions bypass learned helplessness by activating the brain's reward prediction circuitry (ventral striatum) without triggering threat responses. Success on micro-actions builds upward spirals of agency and motivation through dopaminergic reinforcement.",
    instruction:
      "Each card represents an action you could take — without asking anyone's permission, without needing resources you don't have. Sort them into 'Within My 15%' (I can do this right now, alone, starting today) and 'Needs More Than Me' (requires permission, resources, or other people). Focus only on the first pile. Pick your top three and commit to one this week.",
  },
  {
    id: "what-so-what-now-what",
    name: "What, So What, Now What",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "wordCloud",
    whyNow:
      "You have been processing a lot of information — this structure will help you move from observing to meaning-making to action.",
    science:
      "This three-stage sensemaking protocol maps onto distinct cognitive processes: 'What' engages perceptual and episodic memory (what happened), 'So What' activates interpretive and evaluative networks in the mPFC (meaning-making), and 'Now What' recruits the dorsolateral PFC and premotor cortex (action planning). Separating these stages prevents premature conclusions and ensures observations inform rather than bypass interpretation.",
    instruction:
      "Type words and phrases for each of three rounds. Round 1 — WHAT: What did you observe? What happened? Enter the raw facts and noticings. Round 2 — SO WHAT: Why does it matter? What patterns do you see? Enter your interpretations. Round 3 — NOW WHAT: What actions follow? What will you do next? Enter your commitments. Watch the cloud build — the largest words show where your energy concentrates.",
  },
  {
    id: "scarf-model",
    name: "SCARF Model",
    modality: "systems",
    originator: "David Rock (NeuroLeadership Institute)",
    primitive: "wheelChart",
    whyNow:
      "Your journal mentions a social situation that triggered you — SCARF will tell you exactly which social need got threatened.",
    science:
      "The SCARF model identifies five domains of social threat and reward: Status, Certainty, Autonomy, Relatedness, and Fairness. Lieberman's social cognitive neuroscience research shows these domains activate the same neural circuitry (anterior insula, dACC) as physical pain and pleasure. Identifying the specific domain converts diffuse social distress into a targeted intervention point.",
    instruction:
      "Rate each of the five SCARF domains on the wheel: Status (sense of importance relative to others), Certainty (ability to predict what comes next), Autonomy (sense of control over events), Relatedness (sense of safety with others), and Fairness (perception of just exchange). Rate each from threatened to fulfilled. The lowest-rated domain is your primary leverage point.",
  },
  {
    id: "eisenhower-matrix",
    name: "Eisenhower Matrix",
    modality: "systems",
    originator: "Dwight D. Eisenhower (popularized by Stephen Covey)",
    primitive: "dotGrid",
    whyNow:
      "You listed a lot of things demanding your attention — but urgency and importance are not the same thing, and your brain is conflating them.",
    science:
      "The urgency-importance distinction maps onto competing neural systems: urgency activates the amygdala and salience network (respond now), while importance engages the prefrontal cortex's goal-maintenance circuitry (stay on course). Baumeister's research shows that urgent-but-unimportant tasks hijack attention through temporal discounting. Spatial sorting disrupts this bias by forcing explicit evaluation of both dimensions.",
    instruction:
      "The grid has two axes: Urgency (horizontal) and Importance (vertical). Place each task or concern as a dot in the appropriate quadrant. Top-right (urgent + important): do now. Top-left (important, not urgent): schedule. Bottom-right (urgent, not important): delegate or automate. Bottom-left (neither): drop. Notice how many items end up in each quadrant — most people overweight the bottom-right.",
  },
  {
    id: "social-network-webbing",
    name: "Social Network Webbing",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "stakeholderMap",
    whyNow:
      "You mentioned feeling isolated in this effort — mapping your actual network will likely reveal more support than you think.",
    science:
      "Social network analysis reveals structural holes and bridging ties that predict information flow and influence. Granovetter's research on weak ties shows that peripheral connections often provide more novel resources than close bonds. Visualizing one's network activates the mentalizing system (TPJ, mPFC) and corrects the common bias of underestimating available social capital.",
    instruction:
      "Place yourself at the center, then add every person relevant to this challenge — close allies, distant contacts, even people you've lost touch with. Position them by closeness to you. Draw connection lines to show the relationship quality. Then look for structural patterns: who bridges separate clusters? Who is unexpectedly close to resources you need? Who have you been overlooking?",
  },
  {
    id: "outer-inner-secret-roles",
    name: "Outer/Inner/Secret Roles",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "cardSort",
    whyNow:
      "You described a role you play for others — but there are layers beneath it that hold the tension you are feeling.",
    science:
      "Role theory identifies three layers: outer (visible, public role), inner (private experience of that role), and secret (hidden desires, fears, or agendas). Making all three layers explicit reduces the cognitive load of role maintenance and recruits the medial PFC's self-referential processing. Disclosure research (Pennebaker) shows that articulating hidden aspects of identity reduces physiological stress markers.",
    instruction:
      "You will see cards for different roles or identities you carry. For each one, sort it into three categories: 'Outer Role' (what others see and expect), 'Inner Role' (your private experience of this role — what it actually feels like), and 'Secret Role' (what no one knows — the hidden wish, fear, or agenda underneath). Be honest with the secret layer — that is where the energy for change lives.",
  },
  {
    id: "raci-solo",
    name: "RACI Solo Version",
    modality: "systems",
    originator: "Project Management (adapted for individual use)",
    primitive: "cardSort",
    whyNow:
      "You are carrying too many responsibilities — RACI will help you see where you have over-assigned yourself and where you can redistribute.",
    science:
      "Role clarity is one of the strongest predictors of reduced burnout (Taris & Schreurs, 2009). The RACI framework (Responsible, Accountable, Consulted, Informed) forces explicit assignment that counteracts the diffusion of responsibility and the over-commitment bias. Sorting activates the categorization systems of the lateral PFC, making implicit role assumptions visible and actionable.",
    instruction:
      "Each card is a task or responsibility on your plate right now. Sort each one into four categories: 'Responsible' (I do the work), 'Accountable' (I own the outcome but could delegate the work), 'Consulted' (I should have input but not do it), or 'Informed' (I just need to know it happened). If most cards land in Responsible, that is your bottleneck.",
  },
  {
    id: "kotter-eight-step",
    name: "Kotter's 8-Step Change Model",
    modality: "systems",
    originator: "John Kotter (Harvard Business School)",
    primitive: "timelineRiver",
    whyNow:
      "You are trying to drive a change but it keeps stalling — Kotter's model will show you which step you skipped.",
    science:
      "Kotter's research on organizational change found that 70% of change efforts fail, usually because early steps (urgency, coalition) are skipped. The eight-step sequence maps onto a predictable neurocognitive arc: threat detection (urgency), social recruitment (coalition), goal-setting (vision), habit formation (short-term wins), and consolidation (anchoring). Skipping steps creates implementation gaps the brain cannot bridge without backtracking.",
    instruction:
      "Plot where you are on the eight-step timeline: (1) Create Urgency, (2) Build a Coalition, (3) Form a Vision, (4) Communicate the Vision, (5) Remove Obstacles, (6) Create Short-Term Wins, (7) Build on Change, (8) Anchor in Culture. Mark each step as done, in progress, or not started. The first incomplete step is where your change effort is actually stalled — everything after it is premature.",
  },
  {
    id: "psychological-safety-assessment",
    name: "Psychological Safety Assessment",
    modality: "systems",
    originator: "Amy Edmondson (Harvard Business School)",
    primitive: "wheelChart",
    whyNow:
      "You described holding back in a group setting — that is a psychological safety signal worth quantifying so you can act on it.",
    science:
      "Edmondson's research defines psychological safety as the shared belief that a team is safe for interpersonal risk-taking. Low safety activates the brain's social threat circuitry (dACC, anterior insula), suppressing contribution, creativity, and error-reporting. Assessment across multiple dimensions recruits the evaluative PFC and converts a vague feeling of unsafety into specific, addressable domains.",
    instruction:
      "Rate each dimension of psychological safety on the wheel: willingness to ask questions, comfort admitting mistakes, safety to disagree, freedom to take risks, confidence raising concerns, and sense of being valued. Rate each from low to high. The lowest-rated dimensions point to the specific behaviors (yours or others') that need to change for the group to function at its potential.",
  },
  {
    id: "energy-attention-audit",
    name: "Energy-Attention Audit",
    modality: "systems",
    originator: "Adapted from attention management research (Mark, Czerwinski)",
    primitive: "progressRiver",
    whyNow:
      "Your recent entries suggest your energy and attention are going to different places than your stated priorities — this audit will make the gap visible.",
    science:
      "Gloria Mark's research on attention fragmentation shows knowledge workers switch contexts every 3 minutes and need 23 minutes to recover focus. The energy-attention audit uses ecological momentary assessment principles to track where resources actually go versus where we believe they go, surfacing the intention-behavior gap that drives chronic frustration and depleted executive function.",
    instruction:
      "The progress river tracks two streams over your recent week: energy (how alive and resourced you felt) and attention (what actually got your focus hours). Plot each day's energy level and primary attention targets along the river. Where the two streams diverge — high energy on low-priority tasks, or low energy on high-priority ones — is where systemic redesign is needed.",
  },
  {
    id: "heard-seen-respected",
    name: "Heard, Seen, Respected",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "wheelChart",
    whyNow:
      "You described a moment where you felt dismissed — this exercise will help you pinpoint whether you needed to be heard, seen, or respected, because each requires a different repair.",
    science:
      "Social baseline theory (Beckes & Coan) shows that feeling heard, seen, and respected reduces the brain's metabolic cost of coping with threat. Each domain maps to distinct social needs: being heard activates auditory-linguistic empathy circuits, being seen engages the mirror neuron system, and being respected involves status-evaluation in the ventral striatum. Deficits in any domain increase allostatic load.",
    instruction:
      "Rate three dimensions on the wheel: Heard (people listen to and understand my perspective), Seen (people recognize my contributions and effort), and Respected (people treat me with dignity and value my role). Rate each from rarely to consistently. Then for each dimension, note one specific recent moment where it was present or absent. The lowest dimension is where to focus relational repair.",
  },
  {
    id: "generative-relationships-star",
    name: "Generative Relationships STAR",
    modality: "systems",
    originator: "Glenda Eoyang (Human Systems Dynamics Institute)",
    primitive: "stakeholderMap",
    whyNow:
      "You keep working with the same people but getting different results — STAR will show you which relationship conditions are missing.",
    science:
      "Eoyang's STAR model identifies four conditions for generative relationships: Separateness (distinct identities), Tuning (mutual attentiveness), Action opportunities (shared work), and Reason to work together (shared purpose). These map onto self-other differentiation (TPJ), joint attention (mirror system), behavioral activation (premotor cortex), and goal alignment (mPFC). Weak conditions predict relational stagnation.",
    instruction:
      "Place each key relationship on the stakeholder map. For each one, assess the four STAR conditions: Separateness (do you maintain distinct identities?), Tuning (do you pay attention to each other?), Action (do you have shared work?), and Reason (do you share a purpose?). Annotate each relationship with which conditions are strong and which are weak. Relationships missing two or more conditions need redesign, not more effort.",
  },
];
