/**
 * Scenario overlays for exercises.
 * Maps exercise IDs to scenario text + pre-populated data.
 * These simulate what the AI coaching system would generate
 * based on the user's journal entry.
 */

export const SCENARIOS: Record<string, { scenario: string; prePopulated?: Record<string, unknown> }> = {
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
  "enemy-image-process": {
    scenario: "I can't stop being angry at Sarah from HR. She smiled the whole time she was reading my termination letter. She didn't even look uncomfortable. I've been rehearsing what I should have said for three weeks.",
  },
  "four-horsemen-antidotes": {
    scenario: "My partner asked how the job search was going and I snapped 'You always ask at the worst time.' Then they got quiet and I could feel them pulling away. We barely talked the rest of the night. This keeps happening.",
  },

  // ── Integrative ──
  "ifs-daily-checkin": {
    scenario: "There's a part of me that wants to just give up the job search and take the first thing that comes along. And another part that's furious at that part — saying I'm selling myself short. They've been arguing all morning.",
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
  },
  "parachute-day-4": {
    scenario: "I noticed that voice again — the one that says 'you should have seen this coming' and 'if you were better, this wouldn't have happened.' It's loudest at 3am and right before I open LinkedIn.",
  },
  "parachute-day-7": {
    scenario: "Some days I feel like I've accepted what happened. Other days the anger comes back so hard it surprises me. Yesterday I was fine. Today I can barely get off the couch. I don't know where I am in this process.",
  },
  "parachute-day-18": {
    scenario: "A friend asked me what happened at work and I gave them the polished version — 'restructuring, nothing personal.' But that's not the whole truth. There are at least three versions of this story and I don't know which one is real.",
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
