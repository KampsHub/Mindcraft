"use client";

import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

const display = fonts.display;
const body = fonts.bodyAlt;

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

const headingStyle: React.CSSProperties = {
  fontFamily: display,
  fontSize: 18,
  fontWeight: 600,
  color: colors.textPrimary,
  marginBottom: 12,
};

const textStyle: React.CSSProperties = {
  fontFamily: body,
  fontSize: 15,
  color: colors.textSecondary,
  lineHeight: 1.7,
  margin: "0 0 12px 0",
};

const listStyle: React.CSSProperties = {
  fontFamily: body,
  fontSize: 15,
  color: colors.textSecondary,
  lineHeight: 1.7,
  margin: "0 0 12px 0",
  paddingLeft: 20,
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      {/* Soft gradient wash */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(123, 82, 120, 0.08) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "80px 24px 64px" }}>
        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <Logo size={32} />
          </a>
        </div>

        <h1
          style={{
            fontFamily: display,
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}
        >
          Terms &amp; Conditions
        </h1>
        <p
          style={{
            fontFamily: body,
            fontSize: 14,
            color: colors.textMuted,
            marginBottom: 48,
          }}
        >
          Last updated: April 4, 2026
        </p>

        {/* 1. What this is */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. What Mindcraft is</h2>
          <p style={textStyle}>
            Mindcraft is a structured self-coaching platform operated by All Minds on Deck LLC
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). It provides daily journaling
            prompts, AI-generated reflections, and exercises drawn from evidence-based frameworks
            including IFS, ACT, Gottman methodology, and performance psychology.
          </p>
          <p style={textStyle}>
            By creating an account or using the platform, you agree to these Terms &amp; Conditions
            and our{" "}
            <a href="/privacy-policy" style={{ color: colors.coral, textDecoration: "none" }}>
              Privacy Policy
            </a>
            . If you do not agree, do not use the platform.
          </p>
        </div>

        {/* 2. Not therapy */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. This is not therapy or crisis support</h2>
          <p style={textStyle}>
            Mindcraft is a coaching tool. It is not therapy, counselling, or a crisis intervention
            service. It does not replace professional mental health support. The AI-generated
            reflections and exercises are not medical or psychological advice.
          </p>
          <p style={textStyle}>
            If you are experiencing a mental health crisis, suicidal thoughts, or are in immediate
            danger, please contact emergency services or call:
          </p>
          <ul style={listStyle}>
            <li><strong>988 Suicide &amp; Crisis Lifeline</strong> (US): call or text 988</li>
            <li><strong>Crisis Text Line</strong>: text HOME to 741741</li>
            <li><strong>Emergency services</strong>: call 911 (US) or your local emergency number</li>
          </ul>
          <p style={textStyle}>
            If you are dealing with clinical depression, anxiety disorders, trauma, PTSD, or any
            condition that requires professional care, please work with a licensed therapist or
            counsellor alongside or instead of this platform.
          </p>
        </div>

        {/* 3. Eligibility */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. Eligibility</h2>
          <p style={textStyle}>
            You must be at least 18 years old to use Mindcraft. By creating an account, you confirm
            that you are 18 or older and that the information you provide is accurate.
          </p>
        </div>

        {/* 4. Your account */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Your account</h2>
          <p style={textStyle}>
            You are responsible for keeping your login credentials secure. One account per person.
            Do not share your account with others. You are responsible for all activity under your
            account.
          </p>
          <p style={textStyle}>
            We may suspend or terminate your account if we reasonably believe you are violating
            these terms or using the platform in a way that could harm other users or the service.
          </p>
        </div>

        {/* 5. Payment */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Payment</h2>
          <p style={textStyle}>
            Each program is a one-time payment. There are no hidden subscriptions and no recurring
            charges unless you explicitly opt into a continuation plan after your program ends.
            Payments are processed securely through Stripe. We do not store your credit card
            information &mdash; Stripe handles all payment data under their own{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: colors.coral, textDecoration: "none" }}>
              privacy policy
            </a>
            .
          </p>
        </div>

        {/* 6. Refunds */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Refunds</h2>
          <p style={textStyle}>
            If you are not satisfied within the first 7 days and have not completed more than 3 days
            of the program, you can request a full refund by emailing{" "}
            <a
              href="mailto:crew@allmindsondeck.com"
              style={{ color: colors.coral, textDecoration: "none" }}
            >
              crew@allmindsondeck.com
            </a>
            . After that window, refunds are handled on a case-by-case basis.
          </p>
        </div>

        {/* 7. AI content */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. AI-generated content</h2>
          <p style={textStyle}>
            The reflections, pattern insights, exercise recommendations, and coaching summaries you
            receive are generated by artificial intelligence (currently Claude by Anthropic). If you
            use voice coaching, your speech is transcribed by Deepgram and coaching responses are
            spoken using ElevenLabs text-to-speech. Voice audio is processed in real time and is not
            stored after your session ends. This content is designed to be helpful and grounded in
            real coaching frameworks, but:
          </p>
          <ul style={listStyle}>
            <li>It is not professional advice (medical, legal, financial, or psychological).</li>
            <li>It may occasionally be inaccurate or miss important context.</li>
            <li>It should not be your sole basis for making important life decisions.</li>
          </ul>
          <p style={textStyle}>
            Use your own judgment. If something feels off, trust yourself over the system. AI
            reflections are a starting point for self-exploration, not a final answer.
          </p>
        </div>

        {/* 8. Your data */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Your data and intellectual property</h2>
          <p style={textStyle}>
            Your journal entries, exercise responses, and personal reflections belong to you. You
            retain full ownership of everything you write on this platform.
          </p>
          <p style={textStyle}>
            By using the service, you grant us a limited licence to process your content through our
            AI systems solely for the purpose of delivering the coaching experience. We do not sell
            your data. Your entries are never used to train AI models. See our{" "}
            <a href="/privacy-policy" style={{ color: colors.coral, textDecoration: "none" }}>
              Privacy Policy
            </a>
            {" "}for full details on data handling.
          </p>
          <p style={textStyle}>
            The coaching frameworks, exercise designs, programme structure, and platform design are
            the intellectual property of All Minds on Deck LLC. You may not reproduce, distribute,
            or commercially use these materials outside the platform.
          </p>
          <p style={textStyle}>
            Some exercises on this platform are adapted from third-party frameworks used under
            licence or with attribution requirements. These include, but are not limited to:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>The Seven Levels of Personal, Group and Organizational Effectiveness</strong>{" "}
              &mdash; &copy; BEabove Leadership. This framework is copyrighted and used within the
              coaching relationship. It may not be shared, reproduced, or distributed outside of
              your personal coaching experience on this platform.
            </li>
          </ul>
          <p style={textStyle}>
            When these frameworks appear in your coaching exercises or reflections, they are
            presented with proper attribution to their originators. The frameworks remain the
            intellectual property of their respective owners.
          </p>
        </div>

        {/* 9. Coach sharing */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Coach sharing</h2>
          <p style={textStyle}>
            If you choose to share coaching summaries with a human coach, you control what is shared.
            You can review, redact sections, and revoke access to shared summaries at any time.
            Coach sharing is entirely optional and off by default.
          </p>
          <p style={textStyle}>
            When you approve a summary for sharing, your assigned coach can view only the approved
            version. They cannot see your raw journal entries, exercises, or any sections you redacted.
          </p>
        </div>

        {/* 10. Acceptable use */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Acceptable use</h2>
          <p style={textStyle}>You agree not to:</p>
          <ul style={listStyle}>
            <li>Use the platform for any unlawful purpose.</li>
            <li>Attempt to extract, reverse-engineer, or scrape the AI system prompts, coaching
              frameworks, or proprietary methodology.</li>
            <li>Share your account credentials with others.</li>
            <li>Use the platform to generate content that is harmful, abusive, or violates the
              rights of others.</li>
            <li>Attempt to manipulate, bypass, or abuse the AI system.</li>
          </ul>
        </div>

        {/* 11. Limitation of liability */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>11. Limitation of liability</h2>
          <p style={textStyle}>
            Mindcraft and All Minds on Deck LLC provide this service &ldquo;as is&rdquo; and
            &ldquo;as available.&rdquo; We do our best to make it useful and reliable, but we
            cannot guarantee specific outcomes, uninterrupted service, or that AI-generated content
            will be error-free.
          </p>
          <p style={textStyle}>
            To the maximum extent permitted by law, All Minds on Deck LLC shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages arising from your
            use of the platform. Our total liability for any claim related to the service shall not
            exceed the amount you paid for the programme.
          </p>
          <p style={textStyle}>
            You acknowledge that the platform uses AI to generate coaching content and that AI
            outputs may occasionally be unhelpful, inaccurate, or inappropriate. You agree not to
            rely solely on AI-generated content for important decisions affecting your health,
            career, relationships, or finances.
          </p>
        </div>

        {/* 12. Indemnification */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>12. Indemnification</h2>
          <p style={textStyle}>
            You agree to indemnify and hold harmless All Minds on Deck LLC, its owners, employees,
            and contractors from any claims, damages, or expenses arising from your use of the
            platform, your violation of these terms, or your violation of any third party&rsquo;s
            rights.
          </p>
        </div>

        {/* 13. Changes */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>13. Changes to these terms</h2>
          <p style={textStyle}>
            We may update these terms from time to time. If we make significant changes, we will
            notify you via the email address associated with your account. Continued use of the
            platform after notification constitutes acceptance of the updated terms. If you
            disagree with material changes, you may close your account and request data deletion.
          </p>
        </div>

        {/* 14. Governing law */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>14. Governing law</h2>
          <p style={textStyle}>
            These terms are governed by the laws of the State of California, United States, without
            regard to conflict of law principles. Any disputes shall be resolved in the courts
            located in the State of California.
          </p>
        </div>

        {/* 15. Contact */}
        <div style={{ ...sectionStyle, marginBottom: 0 }}>
          <h2 style={headingStyle}>15. Questions?</h2>
          <p style={textStyle}>
            Reach out at{" "}
            <a
              href="mailto:crew@allmindsondeck.com"
              style={{ color: colors.coral, textDecoration: "none" }}
            >
              crew@allmindsondeck.com
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: `1px solid ${colors.borderDefault}`,
          }}
        >
          <p
            style={{
              fontFamily: body,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            &copy; 2026 Mindcraft &middot;{" "}
            <a href="/privacy-policy" style={{ color: colors.textMuted, textDecoration: "underline" }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
