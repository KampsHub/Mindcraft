import type { ExerciseDefinition } from "./exerciseData";

export const MISSING_REL_INT_SYS_EXERCISES: ExerciseDefinition[] = [
  // ═══════════════════════════════════════════
  // MISSING RELATIONAL EXERCISES
  // ═══════════════════════════════════════════

  {
    id: "reconciliation-healing-map",
    name: "Reconciliation & Healing Map",
    modality: "relational",
    originator: "Marshall Rosenberg / NVC",
    primitive: "dialogueSequence",
    tags: ["journal-matched"],
    whyThis: "Your journal carries residue from an old rupture — mapping the path from injury to healing gives you a concrete route instead of circling the wound. Reconciliation requires sequential reactivation of the original hurt (amygdala, anterior insula) followed by corrective relational experience (ventral vagal activation via empathic witnessing). Rosenberg's framework structures this sequence so the prefrontal cortex can guide the process rather than being overwhelmed. Research on interpersonal forgiveness shows that structured reconciliation dialogue may reduce ruminative intrusions by 40% and normalizes cortisol response within sessions.",
    instruction:
      "Move through a guided dialogue in four rounds. First, speak the impact of the original hurt without minimizing. Second, voice what you needed at the time and did not receive. Third, imagine the other person's experience — what feelings and needs might have driven their behavior. Fourth, articulate what healing would look like going forward: what request would you make, and what are you willing to offer? Type each response before advancing.",
    prePopulated: {
      voices: [
        { id: "self", label: "Your Voice", color: "#C4943A" },
        { id: "other", label: "The Other Person", color: "#7B9AAD" },
      ],
      turns: [
        { id: "t1", voice: "self", prompt: "What was the impact of the original hurt? Speak it without minimizing.", content: "" },
        { id: "t2", voice: "self", prompt: "What did you need at the time that you did not receive?", content: "" },
        { id: "t3", voice: "other", prompt: "Imagine their experience — what feelings and needs might have driven their behavior?", content: "" },
        { id: "t4", voice: "self", prompt: "What would healing look like going forward? What request would you make, and what are you willing to offer?", content: "" },
      ],
    },
  },
  {
    id: "conflict-territory-awareness",
    name: "Conflict Territory Awareness",
    modality: "relational",
    originator: "Marshall Rosenberg / NVC",
    primitive: "cardSort",
    tags: ["journal-matched"],
    whyThis: "You keep landing in the same kind of conflict — sorting your conflict patterns will reveal which territory you default to and what it costs you. Conflict responses cluster into predictable territories: fight (sympathetic activation), flight (dorsal vagal withdrawal), freeze (tonic immobility), and fawn (appeasement via social submission). Each territory has a distinct autonomic signature and cognitive profile. Card-sorting externalizes implicit patterns, engaging the lateral prefrontal cortex's categorization systems to make automatic responses visible and therefore interruptible.",
    instruction:
      "Each card describes a conflict behavior or response pattern. Sort them into categories: Fight (confronting, blaming, demanding), Flight (avoiding, changing the subject, leaving), Freeze (shutting down, going blank, dissociating), and Fawn (over-accommodating, people-pleasing, abandoning your position). Notice which pile is tallest — that is your default territory. Then identify which territory you wish you visited more often. In your next conflict, catch yourself entering your default territory and consciously try one behavior from the territory you wish you visited more.",
    prePopulated: {
      buckets: [
        { id: "fight", label: "Fight — confronting, blaming, demanding, raising voice, pushing your point", color: "#D25858" },
        { id: "flight", label: "Flight — avoiding, changing the subject, leaving the room, scrolling to escape", color: "#D6B65D" },
        { id: "freeze", label: "Freeze — shutting down, going blank, dissociating, unable to think or speak", color: "#7B9AAD" },
        { id: "fawn", label: "Fawn — over-accommodating, people-pleasing, abandoning your position to keep peace", color: "#6AB282" },
      ],
      cards: [
        { id: "c1", label: "Raising my voice or getting sharp-toned" },
        { id: "c2", label: "Blaming the other person for how I feel" },
        { id: "c3", label: "Insisting I'm right and pushing my point" },
        { id: "c4", label: "Changing the subject when things get tense" },
        { id: "c5", label: "Physically leaving the room mid-conversation" },
        { id: "c6", label: "Going quiet and giving one-word answers" },
        { id: "c7", label: "Feeling blank — can't think of what to say" },
        { id: "c8", label: "Shutting down emotionally, going numb" },
        { id: "c9", label: "Saying 'it's fine' when it isn't" },
        { id: "c10", label: "Apologizing even when I didn't do anything wrong" },
        { id: "c11", label: "Abandoning my position to keep the peace" },
        { id: "c12", label: "Over-explaining or justifying myself" },
        { id: "c13", label: "Making sarcastic or cutting remarks" },
        { id: "c14", label: "Scrolling my phone to avoid the conversation" },
        { id: "c15", label: "Dissociating — feeling like I'm watching from outside" },
        { id: "c16", label: "Immediately trying to fix the other person's feelings" },
      ],
      allowAdd: true,
    },
  },
  {
    id: "clarify-intention-before-communication",
    name: "Clarify Intention Before Communication",
    modality: "relational",
    originator: "Marshall Rosenberg / NVC",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are about to have a difficult conversation — clarifying your intention before you open your mouth is the difference between connection and collision. Intention-setting may activate the prefrontal cortex's prospective memory system (Brodmann area 10) and primes the brain's goal-maintenance circuitry. Rosenberg emphasized that communication fails when the speaker's hidden agenda contradicts their stated purpose. Clarifying intention before speaking aligns the ventromedial PFC (values) with the dorsolateral PFC (strategy), producing congruent communication that others' mirror neuron systems register as trustworthy.",
    instruction:
      "Follow the guided prompts step by step. First, name the conversation you are preparing for. Then answer: What is my intention — to be right, to be heard, or to connect? If anything other than connect, pause and explore what need is driving the other intention. Next, write what you want the other person to feel after the conversation. Finally, craft your opening statement so it serves your clarified intention. The guide checks alignment between your stated intention and your planned words.",
  },
  {
    id: "do-reflect-apply-cycle",
    name: "Do-Reflect-Apply Cycle",
    modality: "relational",
    originator: "Interpersonal Dynamics (Stanford GSB)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You tried something new in a relationship recently — this cycle ensures the experience becomes lasting skill rather than a one-off experiment. Kolb's experiential learning cycle, adapted for interpersonal skill development, follows a neurobiological sequence: doing may engage procedural memory (basal ganglia), reflecting may activate the default mode network's self-referential processing, and applying recruits the prefrontal cortex's planning and transfer circuits. Without the reflect step, experience does not consolidate into transferable skill. Without the apply step, insight remains intellectual rather than embodied.",
    instruction:
      "Follow the guided prompts through three stages. DO: Describe a recent interpersonal action you took — what did you actually say or do? Be specific. REFLECT: What happened as a result? What worked? What surprised you? What would you do differently? APPLY: Based on this reflection, what is one specific thing you will try in your next interaction? Name the person, the context, and the exact behavior. The guide helps you close the loop from experience to learning to action.",
  },
  {
    id: "empathic-guessing-practice",
    name: "Empathic Guessing Practice",
    modality: "relational",
    originator: "Marshall Rosenberg / NVC",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal described someone who is struggling but will not open up — empathic guessing offers connection without requiring them to initiate vulnerability. Empathic guessing may activate the mentalizing network (medial prefrontal cortex, temporoparietal junction) and the mirror neuron system simultaneously. Unlike questioning, which can feel intrusive, guessing offers a hypothesis that the other person can correct, keeping their autonomy intact. Rogers' research on empathic accuracy shows that even inaccurate guesses build rapport because they demonstrate effort to understand, which may activate oxytocin release in the receiver.",
    instruction:
      "Follow the guided prompts step by step. First, describe the situation and what you observed in the other person. Then practice generating empathic guesses using the format: 'Are you feeling [feeling] because you need [need]?' Generate at least three different guesses, varying the feelings and needs. The guide helps you calibrate your guesses — too specific feels presumptuous, too vague feels hollow. Practice delivering them as tentative offerings, not assertions.",
  },
  {
    id: "silent-empathy-practice",
    name: "Silent Empathy Practice",
    modality: "relational",
    originator: "Marshall Rosenberg / NVC",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You keep trying to fix the other person's problem — silent empathy is the practice of being fully present without needing to solve anything. Silent empathy may activate the ventral vagal social engagement system without recruiting the dorsolateral PFC's problem-solving circuits. Porges' polyvagal theory predicts that non-verbal presence — regulated breathing, soft gaze, open posture — co-regulates the other person's autonomic nervous system more effectively than words. fMRI studies show that empathic presence alone may activate the receiver's anterior insula and anterior cingulate, producing the felt sense of being understood.",
    instruction:
      "Follow the guided prompts to prepare for silent empathy. First, identify a situation where someone needs your presence, not your advice. Then practice the internal posture: ground in your body, release the urge to fix, and silently guess the other person's feelings and needs without voicing them. Breathe slowly. Notice when your mind generates solutions and gently return to witnessing. The guide walks you through a visualization of holding space and helps you recognize when silent presence is more powerful than words.",
  },
  {
    id: "empathy-deepening-practice",
    name: "Empathy Deepening Practice",
    modality: "relational",
    originator: "Roman Krznaric",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal stayed inside your own perspective — Krznaric's research shows that empathy is a skill you can train, and the first step is deliberately stepping into another's world. Krznaric identifies six habits of highly empathic people, grounded in neuroscience: curiosity about strangers may activate the dopaminergic exploration system, challenging prejudice recruits the anterior cingulate's conflict-monitoring function, and experiential empathy (living another's life) may engage embodied simulation via the mirror neuron system. Training empathy through guided perspective-taking may increase gray matter density in the right temporoparietal junction within eight weeks.",
    instruction:
      "Follow the guided prompts to deepen your empathic capacity. First, choose a person whose experience differs significantly from yours. Describe their daily reality as vividly as you can — what they see, feel, worry about, and hope for. Then identify where your assumptions might be wrong and what questions you would need to ask. Finally, articulate what you learned about your own blind spots through this exercise. The guide prevents superficial empathy by pushing you past comfortable assumptions. Ask one genuine question to the person you chose — one you would not have thought to ask before this exercise — and listen without preparing your response.",
  },
  {
    id: "make-your-partner-look-good",
    name: '"Make Your Partner Look Good"',
    modality: "relational",
    originator: "Applied Improvisation",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal revealed a competitive dynamic in a relationship — improv's core principle flips the frame from winning to elevating the other person. The 'make your partner look good' principle leverages reciprocal altruism circuits in the ventromedial prefrontal cortex and anterior insula. When attention may shift from self-promotion to other-enhancement, the threat-detection system (amygdala) downregulates because the social environment becomes cooperative rather than competitive. Improv research shows this shift produces measurable increases in creative output, trust, and psychological safety within minutes.",
    instruction:
      "Follow the guided prompts to practice this principle. First, identify a relationship where you have been competing or defending. Describe a recent interaction where you focused on being right or looking good. Then reimagine that same interaction with one question: 'How could I make the other person look good here?' Write what you would say or do differently. Finally, plan one interaction this week where you will consciously practice making the other person shine. Notice what happens to the dynamic when you stop competing.",
  },
  {
    id: "the-box-arbinger",
    name: "The Box",
    modality: "relational",
    originator: "The Arbinger Institute",
    primitive: "splitAnnotator",
    tags: ["journal-matched"],
    whyThis: "Your journal described justifying behavior you know was not your best — Arbinger calls that being 'in the box,' and the first step out is seeing the box. The Arbinger Institute's 'box' refers to a state of self-deception where one betrays a felt sense of how to treat another person, then builds a self-justifying narrative. Neurologically, self-betrayal may activate the anterior insula (moral discomfort), which the brain resolves not by changing behavior but by distorting perception of the other — reducing mentalizing network activity (mPFC, TPJ) and increasing lateral PFC rationalization. Seeing the box re-may engage the moral cognition circuits.",
    instruction:
      "In the left column, write the self-betrayal: describe a moment when you felt an impulse to do something helpful, kind, or honest — and did not follow through. Then write the justifications that followed: how you made yourself right and the other person wrong. In the right column, annotate each justification with the truth underneath: what you were actually feeling, what the other person might have needed, and what honoring your original impulse would have looked like. The split view reveals the box you built and the door out.",
    prePopulated: {
      leftColumnLabel: "The Self-Betrayal & Justifications",
      rightColumnLabel: "The Truth Underneath",
      rows: [
        { id: "r1", leftText: "I felt the impulse to ask how they were doing, but I walked past.", rightText: "I was afraid of getting pulled into their problem. They probably needed to feel seen.", tags: ["impulse"] },
        { id: "r2", leftText: "I told myself they wouldn't want to talk anyway.", rightText: "That was my story, not theirs. I was protecting my comfort, not their boundaries.", tags: ["justification"] },
        { id: "r3", leftText: "I decided they were being dramatic about the situation.", rightText: "Making them wrong made it easier to ignore my impulse to help.", tags: ["justification"] },
        { id: "r4", leftText: "", rightText: "", tags: [] },
      ],
      availableTags: [
        { id: "impulse", label: "Original Impulse — the moment you felt moved to act with integrity", color: "#6AB282" },
        { id: "justification", label: "Justification — the story you told yourself to make it okay that you didn't", color: "#D25858" },
        { id: "truth", label: "Truth Underneath — what you were actually feeling and what the other person needed", color: "#C4943A" },
        { id: "door-out", label: "The Door Out — what honoring your original impulse would have looked like", color: "#7B9AAD" },
      ],
    },
  },
  {
    id: "detachment-practice",
    name: "Detachment Practice",
    modality: "relational",
    originator: "Interpersonal Skills / Al-Anon Tradition",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are carrying someone else's problem as if it were your own — detachment is not abandonment, it is releasing what was never yours to hold. Healthy detachment may engage the self-other boundary circuits in the right temporoparietal junction and inferior parietal lobule. Without this boundary, empathy becomes codependent fusion — the helper's HPA axis may activate as though the other person's problem is a personal threat. Detachment practice may strengthen prefrontal-parietal connectivity, enabling compassion (approach motivation, ventral striatum) without personal distress (avoidance motivation, amygdala).",
    instruction:
      "Follow the guided prompts step by step. First, name the person and situation you are carrying. Then answer: What part of this is mine to solve, and what part belongs to them? Write two separate lists. Next, identify the fear driving your over-involvement — what are you afraid will happen if you let go? Finally, craft a detachment statement: 'I care about you AND I release my need to control this outcome.' The guide helps you find the line between compassion and control.",
  },
  {
    id: "six-minute-empathy-practice",
    name: "Six-Minute Empathy Practice",
    modality: "relational",
    originator: "Empathy Research (adapted from Riess / Empathetics)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You need a quick reset before an interaction that requires you to show up with warmth — six minutes of structured empathy practice can shift your entire neurochemical state. Helen Riess's empathy training protocol may activate the E.M.P.A.T.H.Y. framework: Eye contact, Muscles of facial expression, Posture, Affect, Tone of voice, Hearing the whole person, Your response. Six minutes of deliberate practice may engage the mirror neuron system, vagus nerve, and oxytocin release pathway. Research shows that even brief empathy training increases autonomic concordance between listener and speaker, measured by synchronized heart rate variability.",
    instruction:
      "Follow the guided six-minute protocol. Minute 1: Ground yourself with three slow breaths and set the intention to be fully present. Minute 2: Visualize the person you will interact with and imagine their current emotional state. Minute 3: Notice your own body's response — warmth, tension, openness. Minute 4: Silently generate compassionate wishes for this person. Minute 5: Rehearse your first words and the tone you want to use. Minute 6: Anchor this empathic state with a physical gesture (hand on heart, deep breath) you can use in the actual interaction.",
  },
  {
    id: "boundary-maintenance",
    name: "Boundary Maintenance",
    modality: "relational",
    originator: "Interpersonal Skills / Nedra Glover Tawwab",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You set a boundary last week but it is already eroding — maintenance is where most boundaries fail, not creation. Boundary maintenance requires sustained activation of the right inferior frontal gyrus (inhibitory control) against social pressure to relent. Tawwab's research shows that boundaries fail not because they were poorly set but because the enforcement phase triggers guilt via the anterior insula's empathy-for-others circuit. Practicing maintenance in advance may strengthen the prefrontal-limbic connectivity needed to hold the line when emotional pressure arrives.",
    instruction:
      "Follow the guided prompts to strengthen an existing boundary. First, name the boundary you set and when you set it. Then describe how it has been tested — who pushed against it and how? Next, notice what emotion arose when it was tested (guilt, anxiety, anger) and identify the need beneath that emotion. Finally, recommit to the boundary by writing a maintenance plan: what will you say next time it is tested? What self-care will you practice after holding the line? The guide helps you anticipate erosion before it happens.",
  },
  {
    id: "secure-base-building",
    name: "Secure Base Building",
    modality: "relational",
    originator: "Bowlby / Ainsworth / Attachment Theory",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You described needing someone to lean on — attachment research shows that having a secure base is not weakness, it is the foundation from which all exploration happens. Bowlby's secure base theory posits that exploration and growth require a reliable figure to return to under stress. The secure base may activate the ventral vagal social engagement system and suppress the sympathetic threat response, freeing cognitive resources for learning and risk-taking. Neuroimaging shows that even mental representation of a secure base may reduce amygdala reactivity and increase prefrontal cortex activation during stress tasks.",
    instruction:
      "Follow the guided prompts to map and strengthen your secure base. First, identify who currently serves as a secure base in your life — someone you can turn to when distressed and who supports your exploration. If no one comes to mind, consider who has served this role in the past, even briefly. Then describe what specific behaviors make them feel safe (reliability, warmth, non-judgment). Finally, assess your own secure base behaviors: who relies on you, and how do you show up for them? The guide helps you identify gaps and plan one concrete action to strengthen your base.",
  },
  {
    id: "attachment-alarm",
    name: "Attachment Alarm",
    modality: "relational",
    originator: "Bowlby / Levine & Heller (Attached)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You described a disproportionate reaction to a small relational event — that is your attachment alarm firing, and understanding it can prevent the next spiral. Attachment alarms are activated when perceived relational threats (distance, rejection, engulfment) exceed the threshold set by early attachment experiences. The alarm may trigger a predictable cascade: amygdala activation, HPA axis cortisol release, and activation of attachment-specific behavioral strategies (protest for anxious, deactivation for avoidant). Recognizing the alarm as a signal rather than a fact may engage the prefrontal cortex's reappraisal circuits, interrupting the automatic cascade.",
    instruction:
      "Follow the guided prompts to decode your attachment alarm. First, describe the triggering event — what happened that set off the reaction? Then rate the intensity of your response on a scale of 1-10 and compare it to the objective severity of the event. If there is a gap, your attachment system is amplifying. Next, identify the core fear: abandonment, engulfment, or rejection? Finally, write what a secure response would look like — not what your alarm demanded, but what a grounded version of you would choose. The guide helps you build a pause between alarm and action.",
  },
  {
    id: "co-regulation-practice",
    name: "Co-regulation Practice",
    modality: "relational",
    originator: "Polyvagal Theory (Stephen Porges)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You described a dysregulated interaction where both of you escalated — co-regulation is the practice of using your own nervous system to calm another's, and it starts with regulating yourself first. Co-regulation is the bidirectional process by which one person's autonomic nervous system influences another's via prosody, facial expression, and body language — what Porges calls the social engagement system. The ventral vagal complex (nucleus ambiguus) controls the muscles of the face, larynx, and middle ear, broadcasting safety or threat signals that the other person's neuroception detects below conscious awareness. Practicing co-regulation may strengthen vagal tone, measured by respiratory sinus arrhythmia.",
    instruction:
      "Follow the guided prompts to build your co-regulation skill. First, recall a recent interaction where emotions escalated between you and another person. Describe what happened in your body — heart rate, breathing, muscle tension. Then practice self-regulation: slow your exhale to be longer than your inhale (4 counts in, 6 out) for five breaths. Now reimagine the interaction: if you had regulated yourself first, what would your voice tone, facial expression, and body posture have communicated? Write what you would have said from a regulated state. The guide helps you rehearse the sequence: regulate yourself, then offer co-regulation through your presence.",
  },
  {
    id: "give-dbt",
    name: "GIVE",
    modality: "relational",
    originator: "Marsha Linehan / DBT",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You mentioned wanting to strengthen a relationship but not knowing how — GIVE provides the four specific behaviors that build and maintain closeness. GIVE (Gentle, Interested, Validate, Easy manner) targets relationship effectiveness in DBT. Each component may activate specific prosocial neural circuits: gentleness may suppress the threat-display system (reducing the listener's amygdala activation), interest may engage joint attention circuits (mirror neuron system), validation activates the receiver's ventral striatum (feeling understood), and easy manner signals vagal tone and safety via the social engagement system. Together, they create the neurochemical conditions for trust and closeness.",
    instruction:
      "Follow the guided prompts to practice GIVE in a specific relationship. First, name the person and the relationship you want to strengthen. Then work through each component: Gentle — what would a non-threatening tone and approach look like with this person? Interested — what question could you ask that shows genuine curiosity about their experience? Validate — what can you acknowledge about their perspective that is true, even if you disagree? Easy manner — how can you bring lightness or humor to the interaction? Write a specific plan for your next interaction using all four components.",
  },
  {
    id: "role-identity-transition",
    name: "Role Identity Transition",
    modality: "relational",
    originator: "IFS + Career Development",
    primitive: "vennOverlap",
    tags: ["journal-matched"],
    whyThis: "You are moving between roles and it feels like losing a part of yourself — this exercise maps what stays, what goes, and what emerges in transition. Role transitions activate the brain's identity-maintenance circuits (medial prefrontal cortex, posterior cingulate) and threat-detection system (amygdala) simultaneously. The old role has an established neural representation — a self-schema encoded in the default mode network. Losing it feels like a small death because the brain processes identity threats through the same circuits as physical threats (Eisenberger, 2003). Mapping the overlap between old and new roles preserves continuity while making space for growth.",
    instruction:
      "The two overlapping circles represent your old role and your emerging role. In the left circle, place the skills, values, relationships, and identity elements that belong only to your old role. In the right circle, place those that belong to your new role. In the overlap, place everything that carries forward — the parts of you that persist across the transition. Notice the overlap first: this is your continuity. Then look at what you are releasing and what is being born. Name one element in each zone that deserves conscious attention. For the element in the 'releasing' zone, do one symbolic act of letting go this week. For the element in the 'emerging' zone, take one small step to develop it.",
    prePopulated: {
      leftLabel: "Old Role",
      rightLabel: "Emerging Role",
      items: [
        { id: "i1", label: "Domain expertise — the specific knowledge you built over years" },
        { id: "i2", label: "Key relationships — the people who know and trust you" },
        { id: "i3", label: "Daily routines — the habits and rituals that structure your day" },
        { id: "i4", label: "Professional identity — how you introduce yourself, how others see you" },
        { id: "i5", label: "Core values — what you stand for regardless of role" },
        { id: "i6", label: "Leadership style — how you influence and guide others" },
        { id: "i7", label: "Team connections — the colleagues you collaborate with daily" },
        { id: "i8", label: "Creative skills — problem-solving, design thinking, innovation" },
        { id: "i9", label: "Communication strengths — how you express ideas and build understanding" },
        { id: "i10", label: "Sense of purpose — why the work matters to you" },
      ],
    },
  },
  {
    id: "five-conversations-new-manager",
    name: "Five Conversations with New Manager",
    modality: "relational",
    originator: "Michael Watkins (The First 90 Days)",
    primitive: "timelineRiver",
    tags: ["journal-matched"],
    whyThis: "You have a new manager or are becoming one — Watkins' research shows that the first five conversations set the trajectory for the entire relationship. Watkins identified five essential conversations during leadership transitions: Situational Diagnosis, Expectations, Resources, Style, and Personal Development. Each conversation maps to a distinct organizational and neurobiological function: Situational Diagnosis may engage analytical circuits (dlPFC), Expectations aligns goal representations (ventromedial PFC), Resources may activate resource-assessment networks, Style negotiation recruits social cognition (TPJ, mPFC), and Personal Development builds the attachment bond (oxytocin, vagal tone) needed for feedback exchange.",
    instruction:
      "Plot the five conversations along the timeline river in the order you plan to have them. For each conversation, add a note describing: what you need to learn, what you need to share, and one specific question you will ask. The five conversations are: (1) Situational Diagnosis — how does your manager see the current situation? (2) Expectations — what does success look like in the first 90 days? (3) Resources — what support and resources are available? (4) Style — how does your manager prefer to communicate and make decisions? (5) Personal Development — how will you get feedback and grow? The timeline helps you sequence and prepare rather than having all five at once.",
    prePopulated: {
      events: [
        { id: "e1", label: "Situational Diagnosis", date: "Week 1", emotion: "curious" },
        { id: "e2", label: "Expectations Alignment", date: "Week 1-2", emotion: "focused" },
        { id: "e3", label: "Resources & Support", date: "Week 2-3", emotion: "practical" },
        { id: "e4", label: "Style & Communication", date: "Week 3-4", emotion: "open" },
        { id: "e5", label: "Personal Development", date: "Week 4-6", emotion: "growth" },
      ],
    },
  },

  // ═══════════════════════════════════════════
  // MISSING INTEGRATIVE EXERCISES
  // ═══════════════════════════════════════════

  {
    id: "seven-levels-healing-fields",
    name: "Seven Levels Healing Fields",
    modality: "integrative",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal described a system that is wounded — the Seven Levels framework identifies where healing needs to happen across the full spectrum from individual to collective. The Seven Levels framework maps healing across nested systems: individual, dyad, team, organization, community, society, and planet. Each level may activate different scales of the mentalizing network — from self-referential processing (mPFC) at the individual level to abstract social cognition (temporal pole, anterior STS) at societal levels. Healing at one level cascades through adjacent levels via the brain's fractal self-similarity in processing relational information.",
    instruction:
      "Follow the guided prompts to identify where healing is needed at each level. For each of the seven levels, ask: What is wounded here? What needs attention? What resource already exists for healing? Start at the individual level and expand outward. You may find that the same wound echoes across multiple levels — that is the nature of systemic injury. End by identifying which level offers the highest leverage: where would healing have the greatest ripple effect? Take one healing action at the highest-leverage level this week.",
  },
  {
    id: "circle-process",
    name: "Circle Process",
    modality: "integrative",
    originator: "Restorative Justice / Kay Pranis",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You described a situation where someone was harmed and punishment will not restore what was lost — the Circle Process focuses on healing the whole system, not just assigning blame. Circle processes activate the brain's restorative justice circuits: when harm is addressed through storytelling and accountability rather than punishment, the victim's anterior insula (social pain) shows greater recovery, and the offender's ventromedial PFC (moral cognition) shows increased activation compared to adversarial processes. Sequential speaking may reduce reactive crosstalk and engage the listener's full mentalizing network, producing genuine perspective-taking rather than defensive positioning.",
    instruction:
      "Follow the guided prompts to move through the four stages of a circle. Opening: Set your intention for the circle — what healing do you seek? Storytelling: Describe the situation from your perspective, then write what you imagine other affected parties would say. Understanding: Identify the needs that were unmet for everyone involved. Action: What would make this right? What agreements would restore trust? The guide ensures each voice — including the voice you most resist hearing — gets full space before moving forward.",
  },
  {
    id: "committed-action-planning",
    name: "Committed Action Planning",
    modality: "integrative",
    originator: "ACT (Acceptance and Commitment Therapy)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have clarity about your values but your behavior has not caught up — committed action bridges the gap between knowing what matters and actually doing it. Committed action in ACT may activate the brain's goal-pursuit circuitry (dorsolateral PFC for planning, ventral striatum for motivation) while maintaining psychological flexibility via the ventromedial PFC. Unlike rigid goal-setting, committed action includes willingness to experience discomfort, which deactivates experiential avoidance circuits (anterior insula threat response) that typically derail values-based behavior. Research shows committed action reduces the intention-behavior gap by 35% compared to standard goal-setting.",
    instruction:
      "Follow the guided prompts to build your committed action plan. First, name the value this action serves — not the goal, but the value underneath. Then describe the specific, observable behavior you commit to — something you can do this week that a camera could record. Next, identify the uncomfortable thoughts and feelings that are likely to show up when you act, and write your willingness statement: 'I am willing to feel [discomfort] in the service of [value].' Finally, set the when, where, and how. The guide ensures your commitment is specific, values-linked, and includes a plan for internal obstacles.",
  },
  {
    id: "appreciative-inquiry",
    name: "Appreciative Inquiry",
    modality: "integrative",
    originator: "David Cooperrider (Case Western Reserve)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal has been problem-focused for days — Appreciative Inquiry flips the lens to discover what is already working and amplify it. Appreciative Inquiry may activate the brain's approach-motivation system (left prefrontal activation, ventral striatum reward circuitry) rather than the threat-avoidance system. Cooperrider's research shows that asking 'What gives life to this system at its best?' produces fundamentally different neural processing than 'What is wrong?' — it may engage prospective simulation (hippocampal-prefrontal circuits) and broadens attentional scope via Fredrickson's broaden-and-build theory, increasing creative solution generation by 25-40%.",
    instruction:
      "Follow the guided four-stage process. Discovery: Recall a peak moment when this area of your life was at its best. What was happening? What conditions were present? Dream: If those conditions were amplified, what would be possible? Describe the ideal future in vivid detail. Design: What structures, habits, or agreements would support that ideal? Identify three specific design elements. Destiny: What is one step you can take this week to move toward the design? The guide keeps you anchored in strengths rather than deficits.",
  },
  {
    id: "resource-mapping",
    name: "Resource Mapping",
    modality: "integrative",
    originator: "Positive Psychology / Strengths-Based Coaching",
    primitive: "stakeholderMap",
    tags: ["journal-matched"],
    whyThis: "You described feeling under-resourced for a challenge ahead — mapping your actual resources usually reveals more support than you thought you had. Resource mapping counteracts the negativity bias and attentional narrowing that stress may produce. Under threat, the brain's salience network (anterior insula, dACC) focuses on deficits and dangers, suppressing the broader resource-scanning function of the frontoparietal attention network. Explicitly mapping resources re-may engage this network, activating the ventral striatum's approach-motivation circuitry. Conservation of Resources theory (Hobfoll) shows that perceived resource availability is the strongest predictor of stress resilience.",
    instruction:
      "Place yourself at the center of the map, then add every resource relevant to your current challenge. Resources include: people (who can help), skills (what you know how to do), experiences (what you have survived before), material resources (money, tools, time), and internal resources (values, resilience, creativity). Position closer resources as more immediately available. Draw connection lines to show which resources support each other. Then identify the resource gap — what is missing? — and who or what could fill it.",
  },
  {
    id: "personal-inventory",
    name: "Personal Inventory",
    modality: "integrative",
    originator: "12-Step Tradition / Recovery Psychology",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal hinted at patterns you keep repeating — a personal inventory is not self-punishment, it is honest accounting that makes change possible. Personal inventory may activate the medial prefrontal cortex's self-referential processing in conjunction with the anterior cingulate's error-monitoring function. Unlike rumination (which loops without resolution), structured inventory follows a completion arc — naming, acknowledging, and releasing — that may engage the brain's memory reconsolidation process. Research on expressive disclosure (Pennebaker) shows that structured self-examination may reduce physiological stress markers and increase immune function when the writing moves from description to meaning-making.",
    instruction:
      "Follow the guided prompts for an honest self-inventory. First, list the behaviors, reactions, or patterns you want to examine — without judgment, just honest naming. For each one, answer: What triggered it? What need was I trying to meet? What was the impact on others? What would I do differently? The guide helps you maintain the stance of a curious observer rather than a harsh judge. End by identifying one pattern you are ready to release and one strength the inventory revealed.",
  },
  {
    id: "memory-reconsolidation",
    name: "Memory Reconsolidation",
    modality: "integrative",
    originator: "Ecker, Ticic & Hulley (Coherence Therapy)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You keep reacting to the present as if it were the past — memory reconsolidation can update the emotional encoding of old experiences without erasing the memory itself. Memory reconsolidation is a neuroscience-validated process: when an emotionally encoded memory is reactivated and simultaneously paired with a contradictory experience, the original memory's emotional tone is permanently updated via AMPA receptor removal at the synaptic level (Nader, Schafe, & LeDoux, 2000). The key is the mismatch experience — the brain must encounter something that violates the prediction the old memory encodes. This may produce a brief reconsolidation window during which the emotional learning can be rewritten.",
    instruction:
      "Follow the guided prompts carefully through three steps. Step 1 — Reactivation: Recall the triggering memory and describe the emotional learning it encoded (e.g., 'When I speak up, I get punished'). Let yourself feel it in your body. Step 2 — Mismatch: Now recall or create a vivid experience that contradicts this learning (e.g., a time you spoke up and were heard, or imagine being heard now). Hold both experiences simultaneously. Step 3 — Integration: Notice what shifts in your body. Write what the new learning feels like. The guide ensures you hold the mismatch long enough for reconsolidation to occur.",
  },
  {
    id: "behavioral-activation",
    name: "Behavioral Activation",
    modality: "integrative",
    originator: "CBT / Behavioral Psychology (Martell, Addis & Jacobson)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have been waiting to feel motivated before acting — behavioral activation reverses the sequence: action comes first, and motivation follows. Behavioral activation targets the depression-inactivity cycle: low mood may reduce activity, which reduces positive reinforcement, which deepens low mood. The intervention works by directly scheduling rewarding or values-congruent activities, bypassing the ventromedial PFC's mood-dependent motivation circuits and engaging the dorsal striatum's habit-based action system instead. Randomized trials show behavioral activation is as effective as antidepressants for moderate depression, with lower relapse rates because it builds sustainable behavioral patterns.",
    instruction:
      "Follow the guided prompts to create your activation plan. First, rate your current energy and mood on a 1-10 scale. Then list three activities: one that is pleasurable (you enjoy it), one that is productive (it gives you a sense of accomplishment), and one that is connected (it involves another person). For each, write the smallest possible version — the two-minute version you could do even at your lowest. Schedule each one for a specific day and time this week. The guide emphasizes starting absurdly small rather than waiting for motivation to arrive.",
  },
  {
    id: "celebration-practice",
    name: "Celebration Practice",
    modality: "integrative",
    originator: "NVC / Positive Psychology",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal recorded an accomplishment but moved on instantly — celebration is not vanity, it is how the brain encodes success and builds motivation for the next challenge. Celebration may activate the ventral striatum's dopamine reward system, consolidating the associated behavior into the brain's repertoire of reinforced actions. Without conscious celebration, the brain's negativity bias causes positive experiences to slide off 'like water off a duck's back' (Hanson, 2013) while negative experiences stick. Taking 15-30 seconds to savor a success may strengthen the neural trace by a factor of 3-5x, converting short-term positive affect into long-term trait-level well-being.",
    instruction:
      "Follow the guided prompts to fully celebrate a recent win — large or small. First, name what you accomplished. Then describe the needs it met: what value did this serve? How does it connect to what matters to you? Next, let yourself feel the positive emotion in your body — warmth, lightness, pride, joy. Stay with it for at least 20 seconds (the minimum time for experience-dependent neuroplasticity). Finally, share the celebration with someone by writing a message you could send. The guide keeps you from minimizing or rushing past the good.",
  },
  {
    id: "yes-and-inner-dialogue",
    name: '"Yes, And" Inner Dialogue',
    modality: "integrative",
    originator: "Applied Improvisation",
    primitive: "dialogueSequence",
    tags: ["journal-matched"],
    whyThis: "Your journal was full of 'but' and 'however' — the improv principle of 'Yes, And' can transform inner resistance into inner collaboration. The 'Yes, And' principle may activate the brain's approach-motivation and creative-elaboration circuits (ventral striatum, bilateral prefrontal cortex) while inhibiting the rejection and evaluation circuits (right lateral PFC, amygdala). Neuroimaging of improvisers shows deactivation of the dorsolateral PFC's self-monitoring function and increased medial PFC activation, producing a state of unselfconscious flow. Applied internally, 'Yes, And' may convert inner conflict into inner dialogue by requiring each part to build on rather than negate the previous part's contribution.",
    instruction:
      "Enter a dialogue between two parts of yourself that are in tension. The rule: each part must begin its response with 'Yes, and...' — fully accepting what the previous part said and adding to it. No 'but,' no 'however,' no negation. Start with the first part's statement. Then let the second part respond with 'Yes, and...' Continue for at least six exchanges. Notice how the conversation evolves when neither part can reject the other. The dialogue sequence enforces the rule and reveals what emerges when inner resistance is replaced with inner building.",
    prePopulated: {
      voices: [
        { id: "part-a", label: "The Part That Wants Change", color: "#C4943A" },
        { id: "part-b", label: "The Part That Resists", color: "#7B9AAD" },
      ],
      turns: [
        { id: "t1", voice: "part-a", prompt: "Start with what this part wants. Speak its truth.", content: "" },
        { id: "t2", voice: "part-b", prompt: "Begin with 'Yes, and...' — accept what was said and build on it.", content: "" },
        { id: "t3", voice: "part-a", prompt: "Yes, and...", content: "" },
        { id: "t4", voice: "part-b", prompt: "Yes, and...", content: "" },
        { id: "t5", voice: "part-a", prompt: "Yes, and...", content: "" },
        { id: "t6", voice: "part-b", prompt: "Yes, and... — notice what emerges when neither part can reject the other.", content: "" },
      ],
    },
  },
  {
    id: "emotional-offer-improv",
    name: "Emotional Offer",
    modality: "integrative",
    originator: "Applied Improvisation",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal described holding back your emotional response — in improv, withholding your emotional offer kills the scene. In life, it kills the connection. Emotional offers — the spontaneous expression of genuine feeling — activate the mirror neuron system in the receiver, creating shared affect that is the foundation of social bonding. Suppressing emotional expression (expressive suppression) increases sympathetic nervous system activation in both the suppressor and the observer (Gross & Levenson, 1997), paradoxically making the interaction more uncomfortable for everyone. Training in making emotional offers may strengthen the connection between interoception (anterior insula) and expression (premotor cortex, facial nerve nucleus).",
    instruction:
      "Follow the guided prompts to practice making emotional offers. First, recall a recent situation where you held back your genuine emotional response. Describe what you actually felt but did not show. Then write what it would have sounded like to offer that emotion — not as a performance but as an honest share. Practice the difference between dumping (uncontained emotional discharge) and offering (contained, intentional emotional expression). Finally, plan one context this week where you will practice making a small emotional offer and notice the response.",
  },
  {
    id: "lands-work-solo",
    name: "Lands Work: Solo",
    modality: "integrative",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "narrativeTriptych",
    tags: ["journal-matched"],
    whyThis: "You described an internal conflict where two parts of you seem to live in different worlds — Lands Work gives each inner world its own territory and dignity. Lands Work applied internally leverages narrative identity theory: each self-state has its own values, customs, and logic, just like a cultural land. Externalizing inner conflicts as territorial differences — rather than right-vs-wrong — may activate the brain's cultural perspective-taking circuits (anterior temporal pole, posterior STS) instead of the moral-judgment circuits (ventromedial PFC). This reframe may reduce the shame and self-criticism that keep inner conflicts entrenched.",
    instruction:
      "Write across three panels. In the first panel, describe Land A — the part of you that wants one thing. What are its values, customs, language, and way of life? In the second panel, describe Land B — the part that wants something different. Give it the same dignity and detail. In the third panel, describe the borderland: the territory where these two lands meet. What is shared? What is negotiable? What would a respectful border agreement look like? The triptych reveals that inner conflict is often a cultural difference rather than a character flaw. Draft one border agreement between your two lands — a rule or ritual that honors both — and practice it for one day.",
    prePopulated: {
      panels: [
        { id: "land-a", title: "Land A", subtitle: "The part that wants one thing", placeholder: "Describe this land: What are its values? Its customs and daily rituals? What language does it speak? What does a good day look like here?", content: "" },
        { id: "land-b", title: "Land B", subtitle: "The part that wants something different", placeholder: "Give this land the same dignity: What are its values? Its customs? What does it need to feel safe? What does a good day look like here?", content: "" },
        { id: "borderland", title: "The Borderland", subtitle: "Where the two lands meet", placeholder: "What is shared between these lands? What is negotiable? What would a respectful border agreement look like — one that honors both?", content: "" },
      ],
    },
  },
  {
    id: "alignment-edge-check",
    name: "Alignment & Edge Check",
    modality: "integrative",
    originator: "ORSC / Process Work (Arnold Mindell)",
    primitive: "spectrumSlider",
    tags: ["journal-matched"],
    whyThis: "You are about to step into something that matters — checking your alignment and locating your edge ensures you show up grounded rather than reactive. Alignment refers to congruence between intention, attention, and action — when these diverge, the anterior cingulate's conflict-monitoring system generates discomfort and may reduce effectiveness. Edge, from Mindell's process work, is the boundary between known identity and unknown territory. Approaching the edge may activate both the fear system (amygdala) and the curiosity system (dopaminergic circuits). The spectrum slider quantifies both alignment and edge proximity, engaging the prefrontal cortex's evaluative function to convert felt sense into actionable data.",
    instruction:
      "Use the spectrum sliders to assess two dimensions. First, Alignment: place the slider from 'completely misaligned' (my actions contradict my values) to 'fully aligned' (my actions express my values). If low, identify what is out of alignment. Second, Edge: place the slider from 'deep in comfort zone' to 'at my growth edge.' If far from the edge, ask what would move you closer. If past the edge, ask what support you need. The combination reveals whether you need more alignment, more edge, or both. If alignment is low, name one behavior to change today. If you are far from the edge, take one small uncomfortable step toward it before the day ends.",
    prePopulated: {
      labels: ["Completely Misaligned — my actions contradict my values and intentions", "Somewhat Off — I can feel the gap between what I say and what I do", "Mostly Aligned — my actions generally express my values with minor drift", "Fully Aligned — my actions, values, and intentions are congruent"],
      value: 50,
    },
  },
  {
    id: "self-sabotage-interrupt",
    name: "Self-Sabotage Interrupt",
    modality: "integrative",
    originator: "IFS / Behavioral Psychology",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal shows a pattern of getting close to success and then pulling back — self-sabotage is not a character flaw, it is a protective part that fears what success would cost. Self-sabotage is maintained by a hidden approach-avoidance conflict: the ventral striatum motivates pursuit of the goal while the amygdala and anterior insula signal threat associated with the goal's consequences (visibility, loss of identity, fear of failure at the next level). In IFS terms, a protective part intervenes to prevent the system from reaching a state it believes is dangerous. Interrupting sabotage requires identifying the part's fear, not just overriding its behavior with willpower.",
    instruction:
      "Follow the guided prompts to interrupt a self-sabotage pattern. First, name the goal you keep undermining and describe the specific sabotage behavior. Then ask: What is the feared consequence of actually achieving this goal? Write whatever comes up without censoring. Next, identify the part that is protecting you — what does it fear would happen if you succeeded? Finally, negotiate with the part: acknowledge its concern and propose a way to pursue the goal while addressing its fear. The guide helps you find a path that honors both ambition and protection.",
  },
  {
    id: "four-agreements-check",
    name: "Four Agreements Check",
    modality: "integrative",
    originator: "Don Miguel Ruiz (Toltec Wisdom)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal violated one of the Four Agreements today — catching it quickly prevents a small departure from becoming a pattern. Ruiz's Four Agreements (Be Impeccable with Your Word, Don't Take Anything Personally, Don't Make Assumptions, Always Do Your Best) map onto specific cognitive biases and neural circuits. Impeccable speech may engage the prefrontal cortex's linguistic precision circuits, not taking things personally deactivates the self-referential default mode network, avoiding assumptions interrupts the lateral PFC's confirmation bias, and doing your best calibrates the dorsal striatum's effort-allocation system. Checking against these agreements may activate metacognitive monitoring (anterior PFC).",
    instruction:
      "Follow the guided prompts to check today against each agreement. Agreement 1 — Be Impeccable with Your Word: Did you say anything today that was not true, kind, or necessary? Agreement 2 — Don't Take Anything Personally: Did you absorb someone else's projection as if it were about you? Agreement 3 — Don't Make Assumptions: Where did you fill in blanks with stories instead of asking? Agreement 4 — Always Do Your Best: Did you give what you had today — not perfection, but your actual best given the circumstances? For each, note what happened and what you would do differently.",
  },
  {
    id: "walking-the-ladder",
    name: "Walking the Ladder",
    modality: "integrative",
    originator: "Chris Argyris (Ladder of Inference)",
    primitive: "zonedSpectrum",
    tags: ["journal-matched"],
    whyThis: "You jumped from a small observation to a big conclusion today — Argyris' Ladder of Inference shows exactly where the leap happened. The Ladder of Inference describes the automatic cognitive escalation from raw data to beliefs to action. Each rung — data selection, meaning-making, assumption, conclusion, belief, action — corresponds to progressively higher-order processing: from sensory cortex (raw data) through lateral temporal cortex (meaning) to prefrontal cortex (belief formation) to premotor cortex (action planning). The ladder operates unconsciously in milliseconds. Making each rung explicit recruits the dorsolateral PFC's monitoring function, interrupting the automatic escalation.",
    instruction:
      "Walk through the zoned spectrum from bottom to top. At the bottom, identify the observable data — what a camera would record. Moving up, describe which data you selected to pay attention to (and what you ignored). Next, what meaning did you add? What assumptions did you make? What conclusions did you draw? What beliefs formed? And finally, what action did you take (or plan to take) based on those beliefs? The spectrum visualization shows exactly where you left the data and entered the story. Walk back down to the data and see if a different ladder is possible.",
    prePopulated: {
      zones: [
        { id: "data", label: "Observable Data", fromPercent: 0, toPercent: 16, color: "#6AB282", guidance: "What a camera would record — raw facts, no interpretation. Try: describe the situation as a journalist would, using only verifiable details." },
        { id: "selection", label: "Selected Data", fromPercent: 16, toPercent: 33, color: "#7B9AAD", guidance: "Which facts you chose to focus on — and what you filtered out. Try: name at least two facts you ignored or dismissed." },
        { id: "meaning", label: "Meaning Added", fromPercent: 33, toPercent: 50, color: "#C4943A", guidance: "The interpretation you layered onto the selected facts. Try: rewrite the same facts with a completely different interpretation." },
        { id: "assumptions", label: "Assumptions", fromPercent: 50, toPercent: 66, color: "#D6B65D", guidance: "What you took as true without checking. Try: turn each assumption into a question you could actually ask someone." },
        { id: "conclusions", label: "Conclusions", fromPercent: 66, toPercent: 83, color: "#D25858", guidance: "The judgments you drew from your assumptions. Try: notice how certain you feel — certainty often signals you've left the data behind." },
        { id: "action", label: "Action Taken", fromPercent: 83, toPercent: 100, color: "#8A9199", guidance: "What you did or plan to do based on your conclusions. Try: ask whether this action would change if your assumptions were wrong." },
      ],
      value: 50,
      leftLabel: "Raw Data",
      rightLabel: "Action",
    },
  },
  {
    id: "discovery-session-template",
    name: "Discovery Session Template",
    modality: "integrative",
    originator: "Coaching Practice / Co-Active Coaching",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are beginning a new coaching or working relationship — a structured discovery session establishes trust, context, and direction from the very first conversation. Discovery sessions leverage the primacy effect (first impressions shape all subsequent interactions) and the brain's rapid trust-assessment circuits (amygdala, fusiform face area, anterior temporal pole). Structured self-disclosure in the first meeting may activate the oxytocin system and establishes psychological safety (Edmondson, 1999). Research on therapeutic alliance shows that the quality of the first session predicts outcomes more strongly than the specific intervention used.",
    instruction:
      "Follow the guided prompts to prepare for or reflect on a discovery session. First, share your story in two minutes: What brought you here? What matters most to you right now? Then describe the challenge: What are you working on? What have you tried? What has not worked? Next, name your best hope: If this work succeeds, what would be different in your life? Finally, set the terms: How do you want to be supported? What should your coach or partner know about how you work best? The guide ensures the session covers context, challenge, hope, and working agreement.",
  },
  {
    id: "willingness-dbt",
    name: "Willingness",
    modality: "integrative",
    originator: "Marsha Linehan / DBT",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal showed willfulness — arms crossed, heels dug in against reality. Willingness is the alternative: opening your hands to what is, even when it is not what you wanted. Linehan distinguishes willfulness (fighting reality, insisting on control) from willingness (entering the moment fully, doing what works). Willfulness may activate the sympathetic nervous system's fight response and the dorsal ACC's conflict-monitoring loop, creating rigidity. Willingness may activate the ventral vagal system and ventromedial PFC's acceptance circuits, enabling flexible response. Neuroimaging shows that the shift from willfulness to willingness correlates with decreased amygdala activation and increased prefrontal-limbic connectivity.",
    instruction:
      "Follow the guided prompts to practice willingness. First, name what you are being willful about — what reality are you fighting? Describe the physical posture of your willfulness (clenched fists, tight jaw, crossed arms). Now try the opposite: open your hands palms-up, soften your face, and take three slow breaths. From this posture, write what willingness would look like — not approval, not resignation, but doing what the situation requires with your whole self. Finally, identify one willing action you can take today. The guide helps you distinguish willingness from giving up.",
  },

  // ═══════════════════════════════════════════
  // MISSING SYSTEMS EXERCISES
  // ═══════════════════════════════════════════

  {
    id: "five-rsi-principles",
    name: "Five RSI Principles",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are navigating a relationship system that feels stuck — the five RSI principles offer a lens that reveals dynamics invisible from inside the system. Relationship Systems Intelligence (RSI) extends emotional and social intelligence to the systems level. The five principles — every member is a voice of the system, relationships are inherently creative, each system has its own wisdom, roles belong to the system not the individual, and the system is always expressing itself — shift processing from the self-referential default mode network to the mentalizing and systems-thinking circuits (temporoparietal junction, anterior temporal pole). This shift may reduce personalization of systemic issues and increase systemic leverage.",
    instruction:
      "Follow the guided prompts to apply each RSI principle to your current situation. Principle 1: Who is a voice of the system that you have been ignoring? Principle 2: Where is the creative potential in this relationship, even in the conflict? Principle 3: If the system had wisdom, what would it say right now? Principle 4: What roles are being played, and how are they serving the system (not just the person)? Principle 5: What is the system expressing through current tensions? Write your response to each and notice how the lens shifts your understanding.",
  },
  {
    id: "seven-metaskills",
    name: "Seven MetaSkills",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are facilitating a difficult dynamic and your default style is not landing — MetaSkills help you consciously choose the attitude you bring to the interaction. MetaSkills are the feeling-attitudes that shape how a skill is delivered — the 'how behind the how.' Derived from Mindell's process work, they include deep democracy, curiosity, playfulness, fierce compassion, creative edge, beginner's mind, and heart. Each MetaSkill may activate a distinct neural configuration: curiosity may engage the dopaminergic exploration system, fierce compassion activates both the empathy network and assertiveness circuits, and beginner's mind deactivates the lateral PFC's expertise-confirmation bias.",
    instruction:
      "Follow the guided prompts to identify and practice your MetaSkills. First, describe the situation you are navigating. Then review each of the seven MetaSkills and rate how present each one is in your current approach. Which MetaSkill is dominant? Which is missing? Now consciously choose the MetaSkill the situation most needs and describe what it would look like to bring it. Practice by rewriting your next planned interaction from the perspective of that MetaSkill. The guide helps you expand beyond your default style.",
  },
  {
    id: "string-exercise",
    name: "String Exercise",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal described feeling disconnected from the people around you — the String Exercise makes the invisible threads of connection tangible and reveals where they are frayed. The String Exercise externalizes relational connections as physical (or imagined) threads between system members. This spatial metaphor may engage the parietal cortex's spatial reasoning and the right hemisphere's gestalt processing. Research on embodied cognition (Barsalou, 2008) shows that translating abstract relational concepts into spatial-physical representations may activate deeper processing than verbal analysis alone, producing insights that verbal discussion misses.",
    instruction:
      "Follow the guided visualization. Imagine a string connecting you to each person in your system. For each connection, describe: How thick is the string? Is it taut or slack? Does it feel warm or cold? Is it fraying anywhere? Now imagine gently tugging each string — who tugs back? Who does not notice? Next, imagine the strings between other members of the system. Where are the strongest connections? Where are strings missing entirely? Write what this web reveals about the health of your system and which string needs the most attention.",
  },
  {
    id: "systems-entry-stages",
    name: "Systems Entry Stages",
    modality: "systems",
    originator: "ORSC / Systems Coaching",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are entering a new system — team, organization, or community — and how you enter will shape everything that follows. Systems entry follows predictable stages: contact, contracting, assessment, and intervention. Premature intervention (skipping assessment) is the most common error and may trigger the system's immune response — resistance, rejection, and scapegoating of the newcomer. Neuroscience of group inclusion shows that new members' cortisol levels predict integration success: low cortisol (managed entry) correlates with faster acceptance, while high cortisol (rushed entry) may activate the group's threat-detection circuits toward the newcomer.",
    instruction:
      "Follow the guided prompts to plan your entry into a new system. Contact: How will you first show up? What first impression do you want to create? Contracting: What agreements need to be in place before you begin doing real work? Assessment: What do you need to learn about the system before acting? Who holds informal power? What are the unwritten rules? Intervention: What is the smallest, lowest-risk action you can take to build credibility? The guide ensures you move through each stage deliberately rather than skipping ahead.",
  },
  {
    id: "shift-and-share",
    name: "Shift & Share",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have something valuable to share but the standard presentation format feels stale — Shift & Share creates rapid knowledge exchange that keeps everyone engaged. Shift & Share leverages the spacing effect and interleaving principles from cognitive science: short, diverse presentations separated by movement activate the hippocampal encoding system more effectively than a single long presentation. The physical shift between stations resets the attentional system (re-engaging the salience network) and the social variety may activate the dopaminergic novelty response, improving retention by 20-40% compared to traditional formats.",
    instruction:
      "Follow the guided prompts to design your Shift & Share contribution. First, distill your knowledge into a 5-minute presentation — what is the one thing people need to understand? Structure it as: context (why it matters), content (the key insight), and call-to-action (what to do with it). Then plan your interactive element: what question will you ask visitors? What will you have them do rather than just listen? Finally, prepare your station materials. The guide helps you compress your expertise into a high-impact micro-presentation.",
  },
  {
    id: "wise-crowds",
    name: "Wise Crowds",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have been solving this problem alone — Wise Crowds harnesses collective intelligence by structuring how you ask for and receive help. Wise Crowds applies Surowiecki's 'wisdom of crowds' principle with a critical structure: the help-seeker presents the challenge, then turns away while the crowd discusses. This separation may help prevent the anchoring effect (the presenter's framing biasing the crowd) and activate the crowd's independent thinking circuits (dorsolateral PFC). The protocol also leverages the generation effect — insights generated by the crowd are encoded more deeply in the crowd's memory than passively received answers.",
    instruction:
      "Follow the guided prompts to run a solo Wise Crowds process. First, state your challenge clearly in two sentences. Then imagine four to five advisors — real or imagined — whom you respect. Let each advisor respond in turn. The key rule: write their responses as if you cannot interrupt, defend, or explain. Just receive. After all advisors have spoken, identify which responses surprised you, which confirmed your thinking, and which opened new doors. The guide ensures you receive counsel without filtering it through your existing assumptions.",
  },
  {
    id: "conversation-cafe",
    name: "Conversation Cafe",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You need to explore a topic with depth but without the pressure of reaching a conclusion — Conversation Cafe creates structured space for genuine dialogue. The Conversation Cafe structure uses sequential rounds to progressively deepen dialogue. Round 1 (individual sharing) may activate self-referential processing (mPFC). Round 2 (open conversation) may engage the mentalizing network for mutual perspective-taking. The 'no fixing, no judging' ground rule deactivates the dorsolateral PFC's evaluative function, allowing the default mode network's meaning-making function to operate freely. Research shows that structured dialogue produces higher-quality insights than unstructured discussion because it prevents dominance hierarchies from forming.",
    instruction:
      "Follow the guided prompts through the Conversation Cafe rounds. Ground rules: speak from personal experience, listen to understand not to respond, and avoid fixing or judging. Round 1: Share your initial thoughts on the topic — what is most alive for you? Round 2: What are you noticing about your own assumptions? What is shifting? Round 3: Open dialogue — if you were having this conversation with others, what would you most want to say? Round 4: What are you taking away? What question remains? The guide maintains the structure that makes depth possible.",
  },
  {
    id: "improv-prototyping",
    name: "Improv Prototyping",
    modality: "systems",
    originator: "Applied Improvisation / Design Thinking",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have been planning and analyzing for too long — improv prototyping gets you into action before your inner critic can shut down the experiment. Improv prototyping combines design thinking's bias-toward-action with improv's deactivation of the inner critic (reduced dorsolateral PFC self-monitoring). The rapid iteration cycle — build, test, learn — may engage the basal ganglia's procedural learning system, which learns faster from doing than from planning. Research on rapid prototyping shows that three quick iterations produce better solutions than one carefully planned attempt, because each iteration generates feedback that the prefrontal cortex's planning function alone cannot simulate.",
    instruction:
      "Follow the guided prompts to rapidly prototype a solution. First, state the problem in one sentence. Then set a timer for five minutes and build your first prototype — the ugliest, fastest possible version. Describe what you made and what it revealed. Now iterate: what did you learn? What would version 2 look like? Describe the second prototype. One more round: what did version 2 teach you that version 1 could not? The guide keeps you moving fast enough that perfectionism cannot catch up.",
  },
  {
    id: "drawing-together",
    name: "Drawing Together",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Words have not been enough to capture what you are experiencing — Drawing Together bypasses verbal processing and accesses the visual-spatial intelligence that holds a different kind of truth. Drawing may activate the right hemisphere's holistic processing, spatial reasoning (parietal cortex), and visual imagery (visual association cortex) — circuits that verbal processing alone does not engage. Research on graphic facilitation shows that visual representation surfaces implicit knowledge by bypassing the left hemisphere's sequential, logical filtering. Drawing also may reduce social desirability bias because images feel less committal than words, enabling more honest expression of complex or contradictory feelings.",
    instruction:
      "Follow the guided prompts to draw your way to insight. First, describe what you want to explore. Then close your eyes and let an image form — it does not need to make logical sense. Open your eyes and describe or sketch the image in words: what shapes, colors, positions, and movements appeared? What does the image tell you that words have not? Now modify the image: what would you add, remove, or rearrange to represent the situation you want? The guide helps you translate visual intelligence into actionable insight.",
  },
  {
    id: "troika-consulting",
    name: "Troika Consulting",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have been too close to this problem to see it clearly — Troika Consulting creates the distance needed for fresh perspective. Troika Consulting uses a three-person structure where the presenter turns away while two consultants discuss. This spatial separation may activate the 'observer effect' — the presenter's prefrontal cortex may shift from solution-generation mode to receptive-listening mode, deactivating the confirmation bias that filters incoming advice. The two-consultant structure leverages cognitive diversity: research shows that even two independent perspectives generate more creative solutions than one person thinking longer.",
    instruction:
      "Follow the guided prompts for a solo Troika process. First, present your challenge in one minute — just the essential facts and the specific help you need. Then imagine two trusted consultants discussing your challenge as if you were not in the room. What would Consultant A say? Write their perspective. What would Consultant B add or challenge? Write that too. Now turn back around: what did you hear that you did not expect? What advice would be hardest to follow? The guide ensures you receive the consultation without defending against it.",
  },
  {
    id: "purpose-to-practice",
    name: "Purpose-to-Practice",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You have a clear purpose but no structure to sustain it — Purpose-to-Practice builds the bridge from aspiration to daily habit. Purpose-to-Practice addresses the implementation gap by progressively concretizing abstract intention through five elements: Purpose (why), Principles (guiding values), Participants (who), Structure (how organized), and Practices (what specifically). Each element may activate different prefrontal subsystems: purpose may engage the ventromedial PFC (values), principles recruit the dorsomedial PFC (social norms), structure activates the dorsolateral PFC (planning), and practices engage the premotor cortex (behavioral rehearsal). The sequence may help prevent the common failure of skipping from purpose directly to practice.",
    instruction:
      "Follow the guided prompts through five stages. Purpose: Why does this initiative exist? What need does it serve? Write it in one sentence. Principles: What values and rules guide how you pursue this purpose? List 3-5 non-negotiable principles. Participants: Who needs to be involved? What roles are needed? Structure: How will participants organize and coordinate? What meetings, channels, or rituals are needed? Practices: What specific, recurring behaviors will make this real? Name at least three weekly or daily practices. The guide ensures each element is concrete enough to act on.",
  },
  {
    id: "laws-of-facilitation",
    name: "Laws of Facilitation",
    modality: "systems",
    originator: "Open Space Technology (Harrison Owen)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are trying to control a process that needs to self-organize — Owen's laws of facilitation remind you that the best facilitator creates conditions and then gets out of the way. Owen's principles — 'Whoever comes are the right people,' 'Whatever happens is the only thing that could have,' 'Whenever it starts is the right time,' and 'When it is over, it is over' — counteract the control illusion maintained by the dorsolateral PFC's planning circuits. Releasing control may activate the default mode network's creative function and allows emergent group intelligence to arise through self-organization, which complexity science shows may produce solutions better adapted to the system's actual needs than top-down design.",
    instruction:
      "Follow the guided prompts to internalize the four laws. For each law, describe a current situation where you are violating it. Law 1 — Whoever comes are the right people: Where are you wishing for different participants? Law 2 — Whatever happens is the only thing that could have: Where are you resisting what is actually happening? Law 3 — Whenever it starts is the right time: Where are you forcing timing? Law 4 — When it is over, it is over: Where are you dragging something past its natural end? For each violation, write what letting go would look like.",
  },
  {
    id: "workshop-energy-architecture",
    name: "Workshop Energy Architecture",
    modality: "systems",
    originator: "Facilitation Practice / Adult Learning Theory",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are designing a workshop or meeting and need to manage group energy, not just content — the energy arc determines whether people leave activated or drained. Group energy follows a predictable ultradian rhythm: attention peaks approximately every 90 minutes (matching the basic rest-activity cycle) and requires active reset to sustain. The energy architecture model maps onto arousal regulation: opening activities activate the sympathetic nervous system (engagement), deep-work phases require parasympathetic support (focus), and closing activities consolidate learning via hippocampal replay. Mismatching activity type to energy phase may produce cognitive fatigue and disengagement.",
    instruction:
      "Follow the guided prompts to architect your session's energy. Opening: How will you create connection and raise energy in the first 10 minutes? Describe the specific activity. Rising Action: What is the first deep-work segment? How long before you need an energy break? Midpoint Reset: How will you re-energize at the halfway mark? Describe the shift in modality (movement, discussion, creativity). Deep Dive: What is your most demanding content and when should it land in the arc? Closing: How will you harvest insights and send people out with energy? The guide ensures your content follows the natural energy curve.",
  },
  {
    id: "energizer-toolkit",
    name: "Energizer Toolkit",
    modality: "systems",
    originator: "Facilitation Practice / Applied Improvisation",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You can feel the energy dropping in your group — having a toolkit of energizers ready means you can intervene before disengagement sets in. Energizers work by interrupting the parasympathetic dominance (low arousal, drowsiness) that accumulates during passive listening. Physical movement may activate the sympathetic nervous system and trigger norepinephrine release, which resets attention circuits. Laughter may activate the endorphin system and reduce cortisol. Novel social interaction may engage the dopaminergic exploration system. Research shows that a 2-minute energizer at the right moment can restore attention for another 20-30 minutes.",
    instruction:
      "Follow the guided prompts to build your personal energizer toolkit. For each of three categories, describe one energizer you could use: Physical (involves movement — standing, stretching, walking), Social (involves interaction — paired sharing, quick rounds, role play), and Creative (involves imagination — rapid brainstorm, improv game, visual exercise). For each energizer, note when to deploy it (energy dip signs to watch for), how long it takes, and what transition you will use to return to content. The guide ensures your toolkit covers different energy states and group sizes.",
  },
  {
    id: "probing-questions",
    name: "Probing Questions",
    modality: "systems",
    originator: "Coaching Practice / Socratic Method",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You accepted the first answer too quickly — probing questions go beneath the surface to find what the person actually means, needs, or believes. Probing questions activate deeper processing in the respondent by disrupting the automatic, surface-level response generated by the left hemisphere's linguistic production system. Each probe recruits additional neural circuits: 'What do you mean by that?' may engage semantic precision (lateral temporal cortex), 'What is an example?' may activate episodic memory (hippocampus), and 'What would happen if...?' engages prospective simulation (hippocampal-prefrontal circuits). Research shows that three layers of probing doubles the quality and specificity of responses.",
    instruction:
      "Follow the guided prompts to practice probing an important topic. First, state the surface-level answer or claim you want to probe. Then apply three probing strategies: Clarification — 'What specifically do you mean by [key term]?' Evidence — 'What example or experience leads you to that conclusion?' Implication — 'If that is true, what follows? What would change?' Write the probing questions and then answer them yourself. Notice how each layer reveals something the surface answer concealed. The guide helps you develop the habit of going three levels deep before accepting an answer.",
  },
  {
    id: "stop-organizational",
    name: "S.T.O.P. Organizational",
    modality: "systems",
    originator: "Mindfulness-Based Stress Reduction (MBSR) / Jon Kabat-Zinn",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your team or organization is in reactive mode — S.T.O.P. creates a collective pause that prevents the next decision from being driven by urgency rather than wisdom. S.T.O.P. (Stop, Take a breath, Observe, Proceed) adapted for organizational use interrupts the group-level stress cascade where one person's amygdala activation spreads through emotional contagion. The collective pause deactivates the salience network's urgency signal and re-may engage the central executive network's deliberative processing. Research on mindful leadership shows that leaders who pause before responding reduce team stress reactivity by 25% and improve decision quality under pressure.",
    instruction:
      "Follow the guided prompts to practice the organizational S.T.O.P. Stop: Name the moment of reactivity — what event or message triggered the urgency? Take a breath: Describe what three slow breaths reveal about your actual state. Are you in genuine emergency or manufactured urgency? Observe: What is actually happening versus what your stress response is telling you? List facts separately from interpretations. Proceed: What is the wisest next step — not the fastest, but the wisest? The guide helps you bring this practice to team meetings and decision points.",
  },
  {
    id: "present-awareness-practice",
    name: "Present Awareness Practice",
    modality: "systems",
    originator: "Mindfulness / Contemplative Practice",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your journal was entirely about the past or the future — present awareness brings you back to the only moment where action is possible. Present-moment awareness may activate the dorsal attention network and anterior insula (interoception) while suppressing the default mode network's temporal wandering function. Killingsworth and Gilbert's research shows that mind-wandering occurs 47% of the time and correlates with lower well-being regardless of the activity. Even brief present-awareness practice (3-5 minutes) may increase prefrontal cortex activation and improves subsequent decision-making, creative problem-solving, and emotional regulation for up to 30 minutes.",
    instruction:
      "Follow the guided prompts for a present-awareness reset. First, name where your mind has been — past or future? Describe the thought loop briefly, then let it go. Now bring attention to five things you can see right now. Then four things you can hear. Three things you can physically feel. Two things you can smell. One thing you can taste. Write one sentence about what is true right now, in this moment, without reference to past or future. The guide anchors you in sensory reality and helps you notice the difference between thinking about life and experiencing it.",
  },
  {
    id: "team-mindfulness",
    name: "Team Mindfulness",
    modality: "systems",
    originator: "Mindful Leadership / Organizational Mindfulness",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your team is operating on autopilot — team mindfulness creates shared presence that transforms the quality of attention in every interaction. Team mindfulness extends individual mindfulness to the collective level. Research by Sutcliffe et al. (2016) on organizational mindfulness identifies five hallmarks: preoccupation with failure, reluctance to simplify, sensitivity to operations, commitment to resilience, and deference to expertise. Mindful teams show increased collective intelligence (Woolley et al., 2010), measured by social sensitivity, equal conversational turn-taking, and shared attention — all mediated by synchronized prefrontal-limbic circuits across team members.",
    instruction:
      "Follow the guided prompts to assess and build team mindfulness. First, rate your team on five dimensions: Do you discuss small failures before they become big ones? Do you resist oversimplifying complex situations? Do you pay attention to what is actually happening versus what you expect? Do you have plans for when things go wrong? Do you let the most knowledgeable person lead regardless of rank? For each dimension, identify one specific practice your team could adopt this week. The guide helps you translate individual mindfulness into collective awareness.",
  },
  {
    id: "modeling-safe-leadership",
    name: "Modeling Safe Leadership",
    modality: "systems",
    originator: "Amy Edmondson / Psychological Safety Research",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are in a position of influence and people are watching how you respond to mistakes and vulnerability — your behavior sets the safety thermostat for the entire group. Edmondson's research shows that psychological safety is created primarily by leader behavior, not policy. Three specific leader behaviors predict team safety: framing work as a learning problem (activating growth mindset via dorsomedial PFC), acknowledging one's own fallibility (deactivating others' threat response), and modeling curiosity through questions (engaging the collective mentalizing network). Leaders who demonstrate these behaviors increase team learning behavior by 40% and reduce error-hiding by 60%.",
    instruction:
      "Follow the guided prompts to practice safety-building leadership. First, identify a recent situation where you had an opportunity to model safety. What did you actually do? Then practice three reframes: How could you frame the challenge as a learning opportunity rather than a performance test? Where could you acknowledge your own uncertainty or mistake? What genuine question could you ask that signals curiosity rather than judgment? Write specific language for each. The guide helps you build a repertoire of safety-modeling behaviors you can deploy automatically.",
  },
  {
    id: "meeting-architecture",
    name: "Meeting Architecture",
    modality: "systems",
    originator: "Facilitation Practice / Organizational Design",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You are spending hours in meetings that produce nothing — meeting architecture transforms wasted time into structured collaboration. Meeting effectiveness research (Rogelberg et al., 2007) shows that unstructured meetings produce 50% less actionable output than structured ones, while consuming the same time. The brain's attention system follows predictable patterns during meetings: peak attention in the first 10-15 minutes (novelty response), declining attention through the middle (habituation), and a recency boost in the final minutes. Architecting meeting flow around these attention rhythms doubles retention and commitment to action items.",
    instruction:
      "Follow the guided prompts to architect your next meeting. Purpose: What is the single outcome this meeting must produce? If you cannot name it in one sentence, the meeting should not happen. Structure: Break the meeting into segments — opening (connection + agenda, 5 min), exploration (divergent thinking, 15 min), convergence (decision or action, 10 min), closing (commitments + next steps, 5 min). Energy: What format shift will you use at the halfway mark? What question will you ask instead of 'Any questions?' Accountability: How will decisions and actions be captured in real time? The guide ensures every minute has a purpose.",
  },
  {
    id: "deep-work-protocol",
    name: "Deep Work Protocol",
    modality: "systems",
    originator: "Cal Newport",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You described another day lost to shallow tasks — Newport's research shows that deep work is the skill that produces disproportionate value, and it requires deliberate protection. Deep work may activate the brain's task-positive network (dorsolateral PFC, intraparietal sulcus) in a sustained, focused configuration. Newport synthesizes research showing that context-switching imposes a 'residue' cost — attention remains partially anchored to the previous task for 10-25 minutes after switching. Deep work protocols eliminate this residue by creating uninterrupted may block. Research shows that four hours of deep work produces more high-quality output than eight hours of shallow, interrupted work.",
    instruction:
      "Follow the guided prompts to design your deep work protocol. First, identify your deep work — the cognitively demanding tasks that create the most value. Then design your ritual: When will you do deep work? (Same time daily creates automaticity.) Where? (Dedicated space reduces environmental cues for distraction.) How long? (Start with 60-90 minutes and build.) What are your shutdown rules? (How will you signal to yourself and others that deep work has begun?) What is your distraction plan? (Where will you put your phone? How will you handle the urge to check?) The guide helps you build a sustainable protocol that protects your most valuable cognitive hours.",
  },
  {
    id: "indistractable-model",
    name: "Indistractable Model",
    modality: "systems",
    originator: "Nir Eyal",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You keep blaming external distractions but the real pull comes from within — Eyal's model shows that distraction is not a technology problem, it is a discomfort-management problem. Eyal's model identifies four components: internal triggers (discomfort driving distraction), external triggers (environmental cues), traction (planned action toward values), and distraction (action away from values). The key insight, supported by neuroscience, is that all human behavior is motivated by the desire to escape discomfort (anterior insula, dACC). Internal may trigger — boredom, anxiety, loneliness — are the primary drivers of distraction, not technology. Addressing the internal trigger deactivates the urge at its source rather than relying on willpower to resist it.",
    instruction:
      "Follow the guided prompts through the four quadrants. Internal Triggers: What uncomfortable feeling precedes your typical distraction? Name it specifically (boredom, anxiety, inadequacy, loneliness). External Triggers: What environmental cues pull you off track? Audit your notifications, workspace, and social cues. Traction: What does a typical day look like when you are fully on track? Build a timeboxed schedule that reflects your values. Distraction: Where are you consistently off track? For each distraction, trace it back to the internal trigger. The guide helps you address the root cause rather than just the symptom.",
  },
  {
    id: "attention-restoration",
    name: "Attention Restoration",
    modality: "systems",
    originator: "Rachel & Stephen Kaplan (Attention Restoration Theory)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your attention is fragmented and effortful — Kaplan's research shows that the right kind of break does not just rest attention, it actively restores it. Attention Restoration Theory (Kaplan, 1995) identifies four properties of restorative environments: being away (psychological distance from demands), extent (richness that may engage the mind), fascination (effortless attention — soft fascination from nature, water, clouds), and compatibility (alignment with one's inclinations). These properties allow directed attention (dorsolateral PFC) to rest while involuntary attention (default mode network, ventral attention network) operates. Even 20 minutes in a restorative environment improves subsequent directed attention performance by 20%.",
    instruction:
      "Follow the guided prompts to design your attention restoration practice. First, rate your current attention depletion on a 1-10 scale. Then assess the four restoration properties in your available environment: Being Away — can you physically or mentally leave your work context? Extent — is there richness and depth in your break environment? Fascination — is there something that captures your attention effortlessly (nature, water, art)? Compatibility — does the environment match what you are drawn to? Design a 15-minute restoration break using the highest-scoring elements. The guide helps you distinguish true restoration from mere distraction.",
  },
  {
    id: "accountability-conversation",
    name: "Accountability Conversation",
    modality: "systems",
    originator: "Fierce Conversations (Susan Scott) / Leadership Practice",
    primitive: "narrativeTriptych",
    tags: ["journal-matched"],
    whyThis: "You have been avoiding a conversation about someone not meeting expectations — the accountability conversation framework makes it possible to be direct without being destructive. Accountability conversations activate the brain's social confrontation circuits — the anterior insula (anticipatory anxiety), dorsolateral PFC (script preparation), and ventromedial PFC (empathy-assertion balance). Scott's research shows that the average person avoids accountability conversations for 7 months, during which resentment accumulates as allostatic load and the problem compounds. Structured accountability conversations reduce avoidance by providing a prefrontal script that overrides the amygdala's conflict-avoidance impulse.",
    instruction:
      "Write across three narrative panels to prepare your accountability conversation. Panel 1 — Opening: State the specific issue and its impact. Use facts, not judgments. 'When [behavior], the impact is [consequence].' Panel 2 — Inquiry: Write genuine questions to understand their perspective. 'Help me understand what is happening on your side.' What might you not know? What context could change your view? Panel 3 — Resolution: Describe the specific behavior change needed, the support you will provide, and the timeline for follow-up. 'What I need going forward is [specific behavior]. How can I support you in that?' Review all three panels as your complete preparation.",
    prePopulated: {
      panels: [
        { id: "opening", title: "Opening", subtitle: "Name the issue and its impact", placeholder: "State the specific behavior and its consequence using facts, not judgments. 'When [behavior], the impact is [consequence].'", content: "" },
        { id: "inquiry", title: "Inquiry", subtitle: "Understand their perspective", placeholder: "Write genuine questions: 'Help me understand what is happening on your side.' What might you not know? What context could change your view?", content: "" },
        { id: "resolution", title: "Resolution", subtitle: "The path forward", placeholder: "Describe the specific behavior change needed, the support you will provide, and when you will follow up. 'What I need going forward is [specific behavior].'", content: "" },
      ],
    },
  },
  {
    id: "stakeholder-mapping-winning-coalitions",
    name: "Stakeholder Mapping: Winning Coalitions",
    modality: "systems",
    originator: "Political Strategy / Organizational Change",
    primitive: "stakeholderMap",
    tags: ["journal-matched"],
    whyThis: "You are trying to drive a change but treating all stakeholders equally — mapping the coalition reveals who you actually need to invest in and who is already on your side. Stakeholder mapping leverages the brain's social network processing circuits (temporoparietal junction, medial PFC) to simulate influence dynamics. Coalition theory (Riker's minimum winning coalition) shows that successful change requires identifying and activating the minimum set of supporters needed, rather than trying to convince everyone. Spatial mapping externalizes this social computation, making influence patterns visible that working memory alone cannot hold (Cowan's 4-item limit).",
    instruction:
      "Place each stakeholder on the map using two dimensions: influence (how much power do they have over the outcome) and support (how supportive are they of your initiative). This creates four quadrants: High Influence + High Support (champions — activate them), High Influence + Low Support (targets — invest relationship here), Low Influence + High Support (allies — leverage their energy), Low Influence + Low Support (deprioritize — do not waste resources). Draw connection lines to show who influences whom. Your winning coalition is the minimum set of high-influence stakeholders needed to tip the system.",
  },
  {
    id: "winfy",
    name: "WINFY: What I Need From You",
    modality: "systems",
    originator: "Liberating Structures (Henri Lipmanowicz & Keith McCandless)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "You and your collaborators keep dancing around unspoken needs — WINFY makes the implicit explicit so everyone can actually deliver for each other. Unspoken needs create cognitive load for the entire system — each person must guess what others need while simultaneously managing their own unexpressed requests. WINFY eliminates this load by structuring explicit need-exchange. The format may activate the prefrontal cortex's social contract circuits and the ventral striatum's reciprocity response. Research on explicit need-negotiation shows that teams who practice it report 35% higher satisfaction and 28% fewer misunderstandings than teams relying on implicit assumptions.",
    instruction:
      "Follow the guided prompts for a solo WINFY process. First, identify the key roles or people you depend on. For each, write a specific, actionable need: 'What I need from you is [specific behavior or deliverable] by [timeframe] in order to [outcome].' Then flip it: for each person, write what you imagine they need from you. Finally, identify the gaps: which needs have you never stated? Which of their needs have you been ignoring? The guide helps you prepare a WINFY conversation that transforms assumptions into agreements.",
  },
  {
    id: "appreciative-interviews",
    name: "Appreciative Interviews",
    modality: "systems",
    originator: "Liberating Structures / Appreciative Inquiry",
    primitive: "wordCloud",
    tags: ["journal-matched"],
    whyThis: "Your team is stuck in problem-focused thinking — Appreciative Interviews surface the conditions that make the team come alive, creating a foundation for change built on strengths. Appreciative Interviews leverage the peak-experience recall effect: when people describe their best moments, they re-activate the neural configurations associated with those moments (reward circuits, approach motivation, broadened attention). The word cloud that emerges reveals shared themes that represent the system's positive core — the conditions already present that can be amplified. Research shows that strengths-based interventions produce 3x more sustainable change than deficit-based problem-solving.",
    instruction:
      "Type words and phrases in response to each prompt, building a word cloud. Prompt 1: Describe a time when this team or system was at its absolute best. What was happening? What were people doing? Prompt 2: What conditions made that peak moment possible? Name specific behaviors, structures, attitudes. Prompt 3: What do you most value about being part of this system? Prompt 4: If you could amplify one quality of this system, what would it be? Watch the cloud build — the largest words reveal the themes that matter most. These themes are your design principles for the future.",
  },
  {
    id: "compare-and-contrast",
    name: "Compare and Contrast",
    modality: "systems",
    originator: "Systems Thinking / Analytical Practice",
    primitive: "bubbleSort",
    tags: ["journal-matched"],
    whyThis: "You are trying to choose between options but they are all blurred together — forced comparison reveals your true priorities faster than abstract evaluation. Pairwise comparison leverages the brain's relative-evaluation circuits (orbitofrontal cortex), which are more accurate than absolute-evaluation circuits. The brain evolved to compare options directly rather than rate them independently — this is why the decoy effect and context-dependent preferences exist. Bubble sort forces every option to compete head-to-head, engaging the ventromedial PFC's value-comparison function and producing a rank ordering that reflects actual preferences rather than stated preferences.",
    instruction:
      "Enter the options you are comparing — ideas, approaches, priorities, or choices. You will be presented with pairs, one at a time. For each pair, choose which one you prefer or rank higher. Do not overthink it — your gut response carries signal. As you make choices, the options will sort themselves into a rank order. The final ranking reveals your true priorities, which may differ from what you thought you valued. Review the top-ranked and bottom-ranked items — does this ordering feel true?",
    prePopulated: {
      items: ["Financial security", "Creative fulfillment", "Work-life balance", "Professional recognition", "Personal growth", "Meaningful relationships", "Autonomy and freedom"],
      question: "Which matters more to you right now?",
    },
  },
  {
    id: "reclaiming-the-high-dream",
    name: "Reclaiming the High Dream",
    modality: "systems",
    originator: "ORSC (Organization and Relationship Systems Coaching)",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Your system has lost sight of why it exists — the High Dream is the original aspiration that brought the system together, and reclaiming it can reignite collective purpose. The High Dream represents the system's ideal future — the deepest aspiration shared by its members. Neuroscience of shared goals shows that when a group connects to a collective vision, oxytocin and dopamine release synchronize across members (Shamay-Tsoory & Abu-Akel, 2016), creating neurochemical alignment that facilitates cooperation. Over time, systems lose connection to their High Dream through habituation and pragmatic drift. Reclaiming it reactivates the ventromedial PFC's values-alignment function and the ventral striatum's collective motivation circuits.",
    instruction:
      "Follow the guided prompts to reclaim the High Dream. First, recall the original dream: What brought this system together? What was the highest aspiration at the beginning? Describe it in vivid, sensory terms. Then assess the current state: Where has the system drifted from this dream? What compromises have accumulated? Next, identify the Low Dream — the fear-based version of the future that the system is unconsciously moving toward. Finally, recommit: What would it take to turn back toward the High Dream? What is one thing the system could do this week to honor it?",
  },
  {
    id: "accountability-structures",
    name: "Accountability Structures",
    modality: "systems",
    originator: "Organizational Design / Leadership Practice",
    primitive: "guided",
    tags: ["journal-matched"],
    whyThis: "Commitments keep being made but not kept — accountability structures create the conditions where follow-through is the default rather than the exception. Accountability is maintained by the brain's prospective memory system (Brodmann area 10, rostral PFC) and social commitment circuits (ventromedial PFC). Research shows that public commitment increases follow-through by 65% (Cialdini), regular check-ins sustain it by preventing the exponential decay of implementation intentions, and visible tracking may engage the dorsal striatum's progress-monitoring function. Accountability structures work because they externalize the monitoring function that individual prefrontal cortex cannot sustain alone.",
    instruction:
      "Follow the guided prompts to build accountability structures for your commitments. First, name the commitment and its owner — who specifically is accountable? Then design three layers of accountability: Visibility — how will progress be visible to others? (Shared dashboard, standup update, public tracker.) Cadence — how often will check-ins happen? (Weekly is the minimum for sustaining implementation intentions.) Consequence — what happens if the commitment is not met? (Not punishment, but a pre-agreed response that maintains integrity.) The guide helps you design structures that make follow-through easier than avoidance.",
  },
];
