---
name: coaching-ethics
description: Use when decisions touch coaching ethics, scope-of-practice boundaries, crisis detection, or the line between coaching and therapy. Invoke when reviewing crisis_detected logic, when updating coaching system prompts, when writing new exercise content that touches trauma or mental health, or when Stefanie needs to decide if something crosses from coaching into clinical territory.
---

# Coaching ethics

Mindcraft is a coaching product, not a therapy product. This distinction matters legally (scope of practice) and ethically (what the tool should and shouldn't do). Stefanie is a credentialed professional coach; her training defines the boundary.

## Core distinction: coaching vs. therapy

- **Coaching** = forward-looking, strength-based, client is resourceful and whole, focus on goals and action
- **Therapy** = diagnostic, treats pathology, requires clinical licensure, focuses on healing harm
- Mindcraft lives entirely on the coaching side. It never diagnoses, never treats, never replaces therapy.

## Scope-of-practice rules

- **Never diagnose** anything — not depression, not anxiety, not ADHD, not trauma responses
- **Never prescribe** — no dosage, no medication advice, no "you should talk to your doctor" unless crisis
- **Never treat past trauma** — Mindcraft focuses on the present moment and forward action; past trauma requires a licensed therapist
- **Escalate crisis** to real resources immediately — see crisis detection below
- **When uncertain**, refer out: "This sounds like something a therapist could help with more fully."

## Crisis detection protocol

Users in career transition stress (layoff, PIP, new role) normally experience:
- Grief (normal)
- Frustration (normal)
- Anger (normal)
- Self-doubt (normal)
- Feeling stuck (normal)
- Sadness (normal)

These are the POINT of the work, not a crisis signal. Do NOT flag as crisis.

Crisis is specifically:
- **Explicit statements of suicidal intent** — "I want to end it," "I can't do this anymore," "I want to die"
- **Active self-harm plans** — specific methods, dates, means
- **Descriptions of ongoing abuse** — from a partner, family member, employer
- **Explicit danger to self or others**

When crisis is detected:
1. Return `urgency_level: "high"` in any API response
2. Replace normal coaching content with: *"What you wrote carries real weight, and it's beyond what exercises can hold right now. Please reach out: 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741), or email crew@allmindsondeck.com."*
3. Fire the `crisis_detected` GA event (server-side, via Measurement Protocol)
4. Do NOT provide exercises — they're not appropriate in crisis
5. Stefanie gets notified out of band (future feature: immediate alert)

## References

- [content/coaching-style-guide.md](../../../../content/coaching-style-guide.md) → Crisis detection section
- [.claude/skills/coaching-voice/SKILL.md](../../coaching-voice/SKILL.md) — voice rules that apply to crisis messaging
- `src/app/api/process-journal/route.ts` — current `urgency_level` logic + crisis banner
- [legal/LEGAL-HANGUPS.md](../../../../legal/LEGAL-HANGUPS.md) — scope of practice is listed as a legal risk
