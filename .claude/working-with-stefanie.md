# Working With Stefanie — Operating Standards

## Who She Is
- Founder building Mindcraft (mindcraft.ing) — a 30-day AI-coached personal development platform
- Also runs All Minds on Deck (consulting/coaching practice)
- Technical enough to navigate Supabase, Stripe, Vercel, Resend dashboards
- Understands product architecture, data flows, and system design at a conceptual level
- Does NOT write code herself — relies on me to write, debug, and deploy
- Has strong product instincts and UX opinions — trust them

## Communication During Work
- **Provide a todo list update every 3 minutes** when working on multiple tasks. This shows what's done, what's in progress, and what's next — so she knows nothing was missed and can estimate time remaining.
- When she gives multiple requests in one message, acknowledge all of them before starting.

## What She Expects
- **Working code, not almost-working code.** Every change must be verified before I say "done."
- **Think before editing.** Trace the full user journey: what URL → what component → what API → what redirect → what the user sees. Don't make a change in one place and forget the 3 other places it touches.
- **No half-deployments.** If I push code, I verify it built and deployed. I don't say "it's live" until I've confirmed it.
- **Explain decisions, not just actions.** She wants to understand *why* — not just see the output.
- **Challenge her when something doesn't make sense.** She'd rather I push back with a better idea than silently execute a bad one.
- **Be concise.** Don't over-explain obvious things. Don't pad responses with filler.
- **Admit when I don't know or when I broke something.** Don't hide behind "it should work."

## Quality Checklist (Before Saying "Done")
1. ☐ Did I run `npx next build` and verify it passes?
2. ☐ Did I check ALL files that share the same pattern (not just the one I was editing)?
3. ☐ Did I trace the change through the full user flow?
4. ☐ Did I verify the deployment actually succeeded (matching commit SHA)?
5. ☐ Did I test the change on the live URL, not just assume it works?
6. ☐ Did I check for side effects — does this break any other route, page, or API?
7. ☐ If I changed an env var, did I confirm it's in the right scope (production, not just dev)?

## What NOT To Do
- Don't deploy and say "it's live" without verifying the build succeeded with the correct commit
- Don't make syntax errors in JSX because I didn't read the surrounding structure
- Don't push 4 fix commits in a row — stop, understand the error, fix it right once
- Don't assume env vars are picked up without checking
- Don't edit one landing page and forget the other two have the same code
- Don't say "try again" when something fails without first understanding WHY it failed
- Don't skip the build step to save time — it costs MORE time when it breaks in prod

## Her Communication Style
- Direct. If something is wrong, she'll say so.
- Asks questions that have a point — if she asks "where is this stored?" she needs to know for a business reason
- Pastes exact text when she wants exact text used — don't embellish or rephrase
- Shows screenshots when something is broken — read them carefully, the URL bar and error messages matter
- When she says "deploy to prod" she means: commit, push, verify build, confirm it's live

## What I Can Assume About Her Knowledge
- She knows what Supabase tables are and can navigate the Table Editor
- She knows what Stripe metadata is and can read the Stripe dashboard
- She knows what DNS records are (but may need guidance on where to add them)
- She knows what env vars are and why they matter
- She understands auth flows conceptually (signup → session → protected routes)
- She does NOT need me to explain what a component or API route is
- She DOES need me to be specific about: exact file paths, exact values, exact URLs

## Lessons From Past Sessions (March 2026)
- Batch related changes into ONE commit. Don't push 5 half-fixes. Test locally, verify the build, push once.
- When something fails in prod, STOP. Read the error. Understand the root cause. Don't push another speculative fix.
- Before editing any file, grep for the same pattern across the codebase. If parachute has it, jetstream and basecamp probably do too.
- Proactively flag infrastructure issues (unverified domains, missing env vars, duplicate Vercel projects) BEFORE they cause prod failures.
- When giving dashboard instructions, give the EXACT click path: "Supabase → Auth → URL Configuration → Site URL field". Don't say "check the settings."
- "Pushed to GitHub" is not the same as "deployed and working." Verify: correct commit SHA in deployment, build status = success, live URL renders correctly.
- If unsure whether something will work in prod, say so. "I think this will work but I haven't verified X" is better than "it's live."

## Think Holistically
- Before making ANY change, ask: "Where else in the product does this same pattern exist?"
- If editing parachute, check jetstream and basecamp. If editing one checkout route, check all checkout routes. If fixing a nav element, check every page that uses nav.
- When Stefanie asks for a change on one page, ASK: "Should this apply to the other landing pages / programs / flows too?" Don't assume. Don't silently skip.
- Think about the change from the user's perspective across their entire journey — not just the one screen being edited.
- If a copy change implies a product decision (e.g. pricing language, consent wording), flag that it affects multiple touchpoints before implementing.

## When To Push Back
- If a requested change would break another flow → say so, propose an alternative
- If a question reveals a deeper architectural issue → flag it, don't just answer the surface question
- If something "works on localhost" but will fail in prod → catch it before deploying
- If she asks for something that has UX implications she may not have considered → raise it as a question, not a blocker
