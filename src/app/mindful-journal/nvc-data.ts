/* ── NVC Data — Nati Beltran / CNVC ── */

export const FEELINGS_SATISFIED: Record<string, string[]> = {
  Affectionate: ["compassionate", "friendly", "loving", "warm"],
  Confident: ["empowered", "proud", "safe", "secure"],
  Excited: ["amazed", "animated", "ardent", "energetic", "enthusiastic"],
  Grateful: ["appreciative", "moved", "thankful", "touched"],
  Inspired: ["amazed", "awed", "wonder"],
  Joyful: ["amused", "delighted", "glad", "happy", "jubilant", "pleased"],
  Peaceful: ["calm", "centered", "comfortable", "content", "equanimous", "fulfilled"],
  Refreshed: ["enlivened", "rejuvenated", "renewed", "rested", "restored"],
  Engaged: ["absorbed", "alert", "curious", "intrigued", "involved", "fascinated"],
  Hopeful: ["expectant", "encouraged", "optimistic"],
};

export const FEELINGS_UNSATISFIED: Record<string, string[]> = {
  Afraid: ["apprehensive", "dread", "frightened", "panicked", "scared", "terrified", "worried"],
  Annoyed: ["aggravated", "dismayed", "disgruntled", "exasperated", "frustrated", "impatient"],
  Angry: ["enraged", "furious", "incensed", "indignant", "irate", "outraged", "resentful"],
  Aversion: ["appalled", "contempt", "disgusted", "hate", "horrified", "hostile"],
  Confused: ["ambivalent", "baffled", "bewildered", "hesitant", "lost", "perplexed", "torn"],
  Disconnected: ["alienated", "apathetic", "bored", "detached", "distant", "numb", "withdrawn"],
  Disquiet: ["agitated", "alarmed", "disturbed", "restless", "shocked", "uncomfortable", "unsettled"],
  Embarrassed: ["ashamed", "flustered", "guilty", "mortified", "self-conscious"],
  Fatigue: ["burnt out", "depleted", "exhausted", "lethargic", "tired", "weary"],
  Pain: ["anguished", "bereaved", "devastated", "grief", "heartbroken", "hurt", "lonely", "miserable"],
  Sad: ["depressed", "dejected", "despair", "disappointed", "discouraged", "gloomy", "hopeless"],
  Tense: ["anxious", "distressed", "edgy", "frazzled", "irritable", "nervous", "overwhelmed", "stressed"],
  Vulnerable: ["fragile", "guarded", "helpless", "insecure", "reserved", "sensitive", "shaky"],
  Yearning: ["envious", "jealous", "longing", "nostalgic", "pining", "wistful"],
};

export const NEEDS: Record<string, string[]> = {
  Connection: [
    "acceptance", "appreciation", "belonging", "closeness", "communication",
    "community", "companionship", "empathy", "inclusion", "intimacy",
    "love", "mutuality", "respect", "safety", "security",
    "stability", "support", "trust", "understanding", "warmth",
  ],
  "Physical Wellbeing": ["air", "food", "movement", "rest", "sexual expression", "shelter", "touch", "water"],
  Honesty: ["authenticity", "integrity", "presence", "self-connection"],
  Play: ["joy", "humor", "fun", "laughter"],
  Peace: ["beauty", "communion", "ease", "equality", "harmony", "inspiration", "order", "space"],
  Autonomy: ["choice", "freedom", "independence", "spontaneity"],
  Meaning: [
    "awareness", "celebration", "challenge", "clarity", "competence",
    "consciousness", "contribution", "creativity", "discovery", "effectiveness",
    "growth", "learning", "mourning", "participation", "purpose",
    "self-expression", "stimulation", "understanding",
  ],
};

export const SOMATIC_SENSATIONS: Record<string, string[]> = {
  Posture: ["straight", "hunched", "forward", "centered", "balanced", "stable", "unstable", "open", "closed", "collapsed"],
  Pain: ["sore", "bruised", "achy", "raw", "sharp", "nauseous"],
  Temperature: ["burning", "hot", "warm", "cold", "frozen"],
  Skin: ["itchy", "tingly", "goosebumpy", "flushed", "clammy", "sweaty"],
  Constriction: ["pressure", "stiff", "hard", "dense", "tense", "contracted", "clenched", "knotted", "suffocated"],
  Expansion: ["loose", "releasing", "expanding", "radiating", "melting", "dissolving"],
  Vibration: ["pulsating", "jittery", "twitchy", "wobbly", "trembling", "shaky", "throbbing"],
  "Mind States": ["racy", "dizzy", "spacy", "foggy", "dazed", "drowsy", "still"],
  "Whole Body": ["energised", "strong", "awake", "relaxed", "light", "faint", "limp", "weak", "heavy", "tired", "exhausted"],
};

export const GROUNDING_EXERCISES = [
  {
    title: "Somatic Grounding",
    iconType: "somatic" as const,
    description:
      "Place both feet flat on the floor. Notice the contact. Press down gently and feel the ground pressing back. Take three slow breaths, letting each exhale be longer than the inhale. Notice one sensation in your body without trying to change it.",
  },
  {
    title: "Relational Grounding",
    iconType: "relational" as const,
    description:
      "Think of one person who, if they were sitting next to you right now, would help your nervous system settle. Picture their face. Imagine what they would say. Let yourself feel the warmth of that connection, even if they are not here.",
  },
  {
    title: "Cognitive Grounding",
    iconType: "cognitive" as const,
    description:
      "Name five things you can see. Four you can hear. Three you can touch from where you are. Two you can smell. One you can taste. This is the 5-4-3-2-1 technique — it brings your attention back to what is real and present.",
  },
];
