# Legal Hangups — Privacy Policy & Terms Review
**Reviewed:** April 4, 2026
**Purpose:** Identify specific legal risks for lawyer review before launch

---

## PRIVACY POLICY (mindcraft.ing/privacy-policy)

### HIGH RISK

**1. Washington My Health My Data Act (highest exposure)**
As a WA LLC processing journal entries about mental health, anxiety, career stress, and life crises — this almost certainly constitutes "consumer health data" under Washington's My Health My Data Act (effective March 2024). This law has a **private right of action** (users can sue directly). Requirements include: separate consent for health data collection, specific disclosure of health data categories, and deletion within 30 days. **The privacy policy does not mention this law at all.**

**2. "No human reads it unless you choose to share with a coach"**
This is an absolute claim that becomes false if: support staff debug an issue and see user data, Sentry error logs contain journal fragments, or a database admin runs a query. Qualify with "in the ordinary course of business" and add exceptions for support, legal, and maintenance.

**3. "We do not collect: IP addresses for tracking"**
Almost certainly false. Supabase Auth logs IPs in `auth.audit_log_entries`. Sentry captures IPs. Google Analytics receives IPs (even with anonymization, the full IP is received before truncation). Vercel's edge logs include IPs. Either suppress IP collection across all services or remove this claim.

**4. "Nothing is stored by Anthropic or Voyage AI beyond the API call"**
This is a factual claim about third-party behavior you may not be able to guarantee. Anthropic may retain API logs for abuse detection. Replace with: "According to Anthropic's data usage policy, Anthropic does not use API data to train models."

**5. Special category data not addressed (GDPR Article 9)**
Journal entries will inevitably contain health information, mental health data, and psychological assessments. These are "special category data" under GDPR requiring explicit consent and elevated protections. The policy doesn't mention Article 9 at all.

**6. International transfer mechanism is legally insufficient**
"By using Mindcraft, you consent to this transfer" does not meet GDPR's post-Schrems II requirements. You need either EU-US Data Privacy Framework certification, Standard Contractual Clauses (SCCs), or explicit/informed/specific consent (not implied by use).

**7. No GDPR legal basis disclosure**
The policy never states the legal basis for processing under GDPR Article 6 (consent, contract performance, legitimate interest, etc.). This is a mandatory disclosure under Article 13(1)(c).

**8. Missing: Sentry and Vercel as data processors**
Sentry receives error context data (potentially including journal fragments, user IDs, IPs). Vercel processes all HTTP requests. Neither is listed in the third-party services table. Failure to disclose a data processor is a GDPR Article 13 violation.

### MEDIUM RISK

**9. "AI processes your entries to coach you — then the data stays in your account"**
Misleading. Data is sent to Anthropic, Voyage AI, and stored in Supabase (AWS). Coaching memories are stored as pgvector embeddings. "Stays in your account" implies the data never leaves user control.

**10. "We use only essential cookies"**
Google Analytics cookies are NOT "essential" under GDPR/ePrivacy. Essential = strictly necessary for the service to function. This contradicts section 10 which describes analytics cookies.

**11. No breach notification procedures**
GDPR Article 33 requires notification within 72 hours. CCPA requires consumer notification. No breach notification language exists anywhere in the policy.

**12. "Not even our application code can bypass these policies" (about RLS)**
Service role keys in Supabase DO bypass RLS. If any API route uses the service role key, this statement is false. Making false security claims creates breach liability.

**13. No physical address in contact section**
GDPR Article 13(1)(a) requires identity and contact details including physical address. CAN-SPAM requires physical address for commercial emails.

**14. No automated decision-making disclosure (GDPR Article 22)**
The AI generates coaching recommendations, selects exercises, and identifies psychological patterns. These are automated decisions requiring Article 22 disclosure about logic, significance, and consequences.

**15. Voice data claim may be unverifiable**
"Voice sessions are processed in real time and not stored after the session ends" — LiveKit, Deepgram, and ElevenLabs each have their own retention policies. If any provider retains logs/fragments for debugging, this is false.

### LOWER RISK

**16. Retention of pgvector embeddings not addressed**
The 30-day deletion commitment doesn't mention vector embeddings. Are these deleted when a user requests deletion?

**17. CCPA missing specific disclosures**
Missing: categories of sources, per-category retention periods, "Do Not Sell" link (technically required under CPRA).

**18. Anonymization claims are vague**
"Aggregate, anonymised usage data" — no description of anonymization methodology. Multiple EU regulators have scrutinized vague anonymization claims.

**19. "We will notify you via email before changes take effect"**
Strong commitment. If you ever update without emailing first, you've breached your own policy. Consider "will make reasonable efforts to notify."

---

## TERMS & CONDITIONS (mindcraft.ing/terms)

### HIGH RISK

**20. No arbitration clause or class action waiver (HIGHEST PRIORITY)**
Without this, any user can file a lawsuit and join a class action. One data breach, harmful AI output, or refund dispute could become class action litigation. Nearly every SaaS company includes binding arbitration with class action waiver.

**21. Clinical frameworks named in legal document**
Section 1 says exercises are drawn from "IFS, ACT, Gottman methodology." These are clinical therapeutic modalities, not coaching frameworks. This directly undermines the Section 2 disclaimer that "this is not therapy." A plaintiff's attorney would use this inconsistency to argue the product provides unlicensed therapy. IFS and Gottman are also trademarked — using them without a licensing agreement risks cease-and-desist.

**Recommendation:** Remove specific framework names from terms. Use generic language: "exercises drawn from evidence-based coaching and psychological frameworks." Move framework names to marketing copy with "inspired by" or "adapted from" language.

**22. No explicit statement: "no therapeutic relationship is formed"**
This is standard in coaching/wellness apps and its absence is glaring. A user could argue the ongoing journaling + AI reflection pattern constitutes an implied professional relationship, especially given the clinical framework references.

**23. No warranty disclaimer**
"As is" and "as available" are mentioned but implied warranties (merchantability, fitness for purpose) are not explicitly disclaimed. Under Washington law, implied warranties exist unless explicitly disclaimed.

**24. Coach sharing section describes a non-existent active feature**
Written in present tense ("your assigned coach can view") but no human coaches are active. This misrepresents the current product. Either remove until feature launches or label as "future feature."

### MEDIUM RISK

**25. Missing standard clauses (easy fixes)**
- No **severability** clause — if one provision is invalid, entire agreement could be voided
- No **survivability** clause — IP, liability, indemnification sections should survive termination
- No **entire agreement** clause — users could argue marketing materials are part of the contract
- No **force majeure** — no protection for third-party service failures
- No **waiver** clause — failure to enforce once could waive future enforcement
- No **assignment** clause — needed if company is acquired

**26. Refund policy ambiguity**
"Not completed more than 3 days" — what counts as "completing" a day? Opening the app? Writing a journal entry? Finishing all exercises? This ambiguity favors the company and a consumer regulator could view it as deceptive.

**27. Vague termination standard with no notice period**
Company can terminate if it "reasonably believes" user is "using the platform in a way that could harm the service." No notice, no cure period, no appeal. For a paid product, this is aggressive and potentially unenforceable.

**28. Indemnification clause may be unenforceable**
Consumer-facing indemnification clauses are viewed skeptically by courts. The current clause is broad enough to make users liable for the company's own negligence.

**29. AI disclaimer insufficient for mental health-adjacent content**
"May occasionally be inaccurate" is generic. For a product processing journal entries about depression, anxiety, and life crises, the risk isn't just inaccuracy — it's harmful advice. Add: "AI content may reinforce patterns a trained professional would identify as harmful."

**30. Governing law says "Washington" but no county specified**
A plaintiff could file in any WA county. Specify "King County, Washington" (or wherever the LLC is registered).

**31. No dispute resolution process**
No pre-litigation requirement (demand letter, mediation). Any disagreement goes straight to court.

**32. "Entries never used to train AI models" — can you guarantee this?**
Unless you have a specific DPA with Anthropic confirming no training use, this claim depends entirely on Anthropic's API terms. If their terms change, your claim becomes false.

### LOWER RISK

**33. Continuation plan language implies future feature**
"No recurring charges unless you explicitly opt into a continuation plan after your program ends" — WA's Automatic Renewal Law requires specific disclosures if auto-renewal is introduced.

**34. No COPPA protection language**
Terms require 18+ but don't address what happens if a minor creates an account.

**35. IP clause is overbroad**
"You may not reproduce or commercially use these materials outside the platform" — unclear if this prevents users from quoting their own coaching summaries. Can't copyright IFS or Gottman concepts.

**36. Copyright notice says "Mindcraft" but legal entity is "All Minds on Deck LLC"**
If Mindcraft isn't a registered entity, the copyright notice should reference the LLC.

---

## TOP 10 ACTIONS FOR LAWYER

1. **Add arbitration clause + class action waiver** to terms
2. **Remove clinical framework names** (IFS, ACT, Gottman) from terms; add "no therapeutic relationship formed"
3. **Washington My Health My Data Act** compliance for privacy policy
4. **GDPR legal basis disclosure** (Article 6 + Article 9 for special category data)
5. **Fix international transfer mechanism** (SCCs or DPF, not implied consent)
6. **Add standard clauses** to terms: severability, survivability, entire agreement, waiver, force majeure, warranty disclaimer
7. **Verify and fix IP address collection claim** in privacy policy
8. **Add breach notification procedures** to privacy policy
9. **Disclose Sentry + Vercel** as data processors in privacy policy
10. **Remove or future-label coach sharing** section in terms

---

*Disclaimer: This is not legal advice. Have a licensed attorney in Washington State review all of the above before making changes.*
