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

const tableWrapStyle: React.CSSProperties = {
  overflowX: "auto",
  marginBottom: 16,
};

const thStyle: React.CSSProperties = {
  fontFamily: display,
  fontSize: 13,
  fontWeight: 600,
  color: colors.textPrimary,
  textAlign: "left",
  padding: "10px 14px",
  borderBottom: `1px solid ${colors.borderDefault}`,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  fontFamily: body,
  fontSize: 13,
  color: colors.textSecondary,
  padding: "10px 14px",
  borderBottom: `1px solid rgba(255,255,255,0.05)`,
  lineHeight: 1.5,
  verticalAlign: "top",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
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

        {/* Plain-English Summary */}
        <div style={{
          ...sectionStyle,
          padding: "24px",
          backgroundColor: colors.bgSurface,
          borderRadius: 12,
          border: `1px solid ${colors.borderDefault}`,
          marginBottom: 48,
        }}>
          <h2 style={{ ...headingStyle, fontSize: 18, marginBottom: 16 }}>The short version</h2>
          <ul style={{ ...listStyle, lineHeight: 1.8 }}>
            <li><strong>Your journal is yours.</strong> No human reads it unless you choose to share with a coach.</li>
            <li><strong>AI processes your entries to coach you</strong> — then the data stays in your account. Anthropic does not train on your data.</li>
            <li><strong>We don&rsquo;t sell your data.</strong> Not to advertisers, not to data brokers, not to anyone.</li>
            <li><strong>You can export or delete everything</strong> at any time from your account settings.</li>
            <li><strong>Voice sessions are processed in real time</strong> and not stored after the session ends.</li>
            <li><strong>We use only essential cookies.</strong> Analytics cookies are optional and you can opt out.</li>
          </ul>
        </div>

        {/* 1. Overview */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Overview</h2>
          <p style={textStyle}>
            Mindcraft is operated by All Minds on Deck LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
            &ldquo;our&rdquo;). This Privacy Policy explains what personal data we collect, how we
            use it, who we share it with, and what rights you have. It applies to all users of the
            Mindcraft platform.
          </p>
          <p style={textStyle}>
            We take your privacy seriously &mdash; especially because the data you share with us is
            deeply personal. We designed Mindcraft to give you control over your information and to
            minimise what we share with third parties.
          </p>
        </div>

        {/* 2. Data we collect */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. Data we collect</h2>
          <p style={textStyle}>
            We collect the following categories of personal information:
          </p>

          <div style={tableWrapStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>What</th>
                  <th style={thStyle}>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Account</td>
                  <td style={tdStyle}>Email address, hashed password (or magic link token if passwordless)</td>
                  <td style={tdStyle}>Authentication, account recovery, contact</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Intake responses</td>
                  <td style={tdStyle}>Values, goals, family patterns, work context, programme-specific questions</td>
                  <td style={tdStyle}>Personalise your coaching plan and goal generation</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Journal entries</td>
                  <td style={tdStyle}>Free-form text you write during daily sessions</td>
                  <td style={tdStyle}>AI coaching reflections, pattern detection, exercise selection</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Exercise responses</td>
                  <td style={tdStyle}>Your written answers to coaching exercises, ratings, feedback</td>
                  <td style={tdStyle}>Track progress, avoid repeat exercises, refine recommendations</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Assessment data</td>
                  <td style={tdStyle}>Enneagram, Leadership Circle, or Saboteur results (if you upload them)</td>
                  <td style={tdStyle}>Personalise exercises and coaching insights</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Payment</td>
                  <td style={tdStyle}>Email, programme purchased, payment status</td>
                  <td style={tdStyle}>Process payment, manage subscriptions</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Contact messages</td>
                  <td style={tdStyle}>Issue type and message text from the support form</td>
                  <td style={tdStyle}>Customer support</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Voice data (optional)</td>
                  <td style={tdStyle}>Audio recordings during voice coaching sessions</td>
                  <td style={tdStyle}>Real-time transcription and voice coaching. Audio is processed in real time and not stored after the session ends.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Usage analytics</td>
                  <td style={tdStyle}>Page views, attribution source (how you found us)</td>
                  <td style={tdStyle}>Improve the product and understand how people find us</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={textStyle}>
            We do <strong>not</strong> collect: phone numbers, government IDs, physical addresses,
            IP addresses for tracking, or social media profiles.
          </p>
        </div>

        {/* 3. How we use your data */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. How we use your data</h2>
          <p style={textStyle}>We use your data to:</p>
          <ul style={listStyle}>
            <li><strong>Deliver coaching:</strong> Your journal entries and exercise responses are processed
              by AI to generate personalised reflections, detect patterns, and select relevant exercises.</li>
            <li><strong>Generate goals:</strong> Your intake responses and early journal entries are used to
              create personalised coaching goals.</li>
            <li><strong>Create summaries:</strong> If you choose to share with a coach, we generate
              AI summaries of your progress that you review and approve before sharing.</li>
            <li><strong>Improve the platform:</strong> Aggregate, anonymised usage data helps us understand
              what works and what to improve. This is optional and you can opt out.</li>
            <li><strong>Communicate with you:</strong> Respond to support requests, send programme updates,
              and notify you of changes to these policies.</li>
          </ul>
          <p style={textStyle}>
            We do <strong>not</strong> use your data to: train AI models, sell to third parties,
            serve advertisements, or build marketing profiles.
          </p>
        </div>

        {/* 4. AI processing */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. AI processing &mdash; how it works</h2>
          <p style={textStyle}>
            Mindcraft uses artificial intelligence to power its coaching features. Here is exactly
            what happens when you write a journal entry:
          </p>
          <ol style={listStyle}>
            <li>Your journal entry text is sent to Claude (made by Anthropic) via their API.</li>
            <li>A semantic search retrieves your most relevant past entries (up to 5) to provide
              context. This uses Voyage AI to generate text embeddings stored in our database.</li>
            <li>Claude generates a coaching reflection and theme tags based on your entry and past context.</li>
            <li>The response is returned to you. Nothing is stored by Anthropic or Voyage AI beyond
              the API call.</li>
          </ol>
          <p style={textStyle}>
            <strong>Important:</strong> Your data is sent to these AI services only for real-time
            processing. Anthropic does not use API data to train their models (per their{" "}
            <a href="https://www.anthropic.com/policies/privacy" target="_blank" rel="noopener noreferrer" style={{ color: colors.coral, textDecoration: "none" }}>
              data usage policy
            </a>
            ). We do not use your data to train or fine-tune any model.
          </p>
          <p style={textStyle}>
            AI processing is required for the coaching service to function. If you are uncomfortable
            with this, you should not use the platform.
          </p>
        </div>

        {/* 5. Third-party services */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Third-party services</h2>
          <p style={textStyle}>We share limited data with the following services:</p>

          <div style={tableWrapStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Data shared</th>
                  <th style={thStyle}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Anthropic (Claude)</td>
                  <td style={tdStyle}>Journal text, past entries context, exercise responses</td>
                  <td style={tdStyle}>Generate coaching reflections, summaries, and exercise selection</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Voyage AI</td>
                  <td style={tdStyle}>Journal text (for embedding generation)</td>
                  <td style={tdStyle}>Semantic search to find relevant past entries</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stripe</td>
                  <td style={tdStyle}>Email, programme/tier, payment details</td>
                  <td style={tdStyle}>Payment processing</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Supabase</td>
                  <td style={tdStyle}>All platform data (encrypted at rest)</td>
                  <td style={tdStyle}>Database hosting, authentication, file storage</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Resend</td>
                  <td style={tdStyle}>Email address, support message</td>
                  <td style={tdStyle}>Deliver contact form emails</td>
                </tr>
                <tr>
                  <td style={tdStyle}>LiveKit</td>
                  <td style={tdStyle}>Voice audio (real-time, not stored)</td>
                  <td style={tdStyle}>Voice coaching session infrastructure</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Deepgram</td>
                  <td style={tdStyle}>Voice audio (real-time transcription)</td>
                  <td style={tdStyle}>Convert speech to text for voice coaching sessions</td>
                </tr>
                <tr>
                  <td style={tdStyle}>ElevenLabs</td>
                  <td style={tdStyle}>Generated coaching text</td>
                  <td style={tdStyle}>Convert coaching responses to spoken audio</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Google Analytics</td>
                  <td style={tdStyle}>Page views, attribution source (anonymised)</td>
                  <td style={tdStyle}>Product analytics (optional, you can opt out)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={textStyle}>
            We do not share your data with any other third party. No data brokers, no advertising
            networks, no marketing platforms.
          </p>
        </div>

        {/* 6. Coach sharing */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Coach sharing</h2>
          <p style={textStyle}>
            If you enable coach sharing in your privacy settings, you can generate AI summaries of
            your coaching progress and share them with your assigned coach. You control this process
            completely:
          </p>
          <ul style={listStyle}>
            <li>Coach sharing is off by default.</li>
            <li>You review every summary before it is shared.</li>
            <li>You can redact any section you do not want your coach to see.</li>
            <li>You can revoke access to any shared summary at any time.</li>
            <li>Your coach never sees your raw journal entries or exercise responses &mdash; only
              the approved AI-generated summary.</li>
          </ul>
        </div>

        {/* 7. Data storage and security */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. Data storage and security</h2>
          <p style={textStyle}>
            Your data is stored in Supabase (hosted on AWS) with the following protections:
          </p>
          <ul style={listStyle}>
            <li><strong>Encryption at rest:</strong> All database content is encrypted.</li>
            <li><strong>Encryption in transit:</strong> All connections use HTTPS/TLS.</li>
            <li><strong>Row-level security (RLS):</strong> Database policies ensure you can only
              access your own data. Not even our application code can bypass these policies.</li>
            <li><strong>Secure authentication:</strong> Passwords are hashed by Supabase Auth.
              Session tokens are stored in httpOnly cookies (not accessible to JavaScript).</li>
          </ul>
          <p style={textStyle}>
            We do not store credit card numbers or payment details. All financial data is handled
            by Stripe under their PCI-DSS compliant infrastructure.
          </p>
        </div>

        {/* 8. Data retention */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Data retention</h2>
          <p style={textStyle}>
            We retain your data for as long as your account is active. If you delete your account
            or request data deletion, we will delete your personal data within 30 days. This
            includes journal entries, exercise responses, coaching summaries, intake data, and
            goals.
          </p>
          <p style={textStyle}>
            We may retain anonymised, aggregated data (e.g., &ldquo;X% of users completed the
            programme&rdquo;) that cannot be linked back to you.
          </p>
          <p style={textStyle}>
            System logs that may contain fragments of your data are automatically purged after
            90 days.
          </p>
        </div>

        {/* 9. Your rights */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Your rights</h2>
          <p style={textStyle}>
            Depending on your location, you may have the following rights under applicable data
            protection laws (including GDPR and CCPA):
          </p>
          <ul style={listStyle}>
            <li><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
            <li><strong>Correction:</strong> Ask us to correct inaccurate data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
            <li><strong>Portability:</strong> Receive your data in a commonly used format.</li>
            <li><strong>Restriction:</strong> Ask us to limit how we process your data.</li>
            <li><strong>Objection:</strong> Object to certain types of processing (e.g., analytics).</li>
            <li><strong>Withdraw consent:</strong> For optional data uses like coach sharing and
              analytics, you can change your settings at any time from the Privacy page in your
              account.</li>
          </ul>
          <p style={textStyle}>
            To exercise any of these rights, email{" "}
            <a href="mailto:crew@allmindsondeck.com" style={{ color: colors.coral, textDecoration: "none" }}>
              crew@allmindsondeck.com
            </a>
            . We will respond within 30 days.
          </p>
        </div>

        {/* 10. Cookies */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Cookies</h2>
          <p style={textStyle}>
            We use only essential cookies required for authentication (session tokens managed by
            Supabase Auth). These are httpOnly cookies that cannot be read by JavaScript.
          </p>
          <p style={textStyle}>
            If you have opted into analytics, Google Analytics may set its own cookies to track
            page views. You can opt out of analytics from your Privacy settings at any time.
          </p>
          <p style={textStyle}>
            We do not use advertising cookies, social media tracking pixels, or third-party
            marketing cookies.
          </p>
        </div>

        {/* 11. Children */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>11. Children&rsquo;s privacy</h2>
          <p style={textStyle}>
            Mindcraft is not intended for anyone under the age of 18. We do not knowingly collect
            data from minors. If you believe a minor has created an account, please contact us and
            we will delete the account promptly.
          </p>
        </div>

        {/* 12. International */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>12. International data transfers</h2>
          <p style={textStyle}>
            Our services and third-party providers are based in the United States. If you are
            located outside the US, your data will be transferred to and processed in the US. By
            using Mindcraft, you consent to this transfer. We rely on the data processing agreements
            of our service providers (Supabase, Anthropic, Stripe, LiveKit, Deepgram, ElevenLabs) to ensure your data is handled
            in compliance with applicable regulations.
          </p>
        </div>

        {/* 13. California residents */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>13. California residents (CCPA)</h2>
          <p style={textStyle}>
            If you are a California resident, you have additional rights under the California
            Consumer Privacy Act:
          </p>
          <ul style={listStyle}>
            <li>Right to know what personal information we collect and how it is used.</li>
            <li>Right to delete your personal information.</li>
            <li>Right to opt out of the &ldquo;sale&rdquo; of personal information. <strong>We do
              not sell your personal information.</strong></li>
            <li>Right to non-discrimination for exercising your privacy rights.</li>
          </ul>
        </div>

        {/* 14. Changes */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>14. Changes to this policy</h2>
          <p style={textStyle}>
            We may update this Privacy Policy from time to time. If we make material changes, we
            will notify you via the email associated with your account before the changes take
            effect. The &ldquo;last updated&rdquo; date at the top reflects the most recent version.
          </p>
        </div>

        {/* 15. Contact */}
        <div style={{ ...sectionStyle, marginBottom: 0 }}>
          <h2 style={headingStyle}>15. Contact</h2>
          <p style={textStyle}>
            For any privacy questions or data requests, contact:
          </p>
          <p style={textStyle}>
            All Minds on Deck LLC<br />
            <a href="mailto:crew@allmindsondeck.com" style={{ color: colors.coral, textDecoration: "none" }}>
              crew@allmindsondeck.com
            </a>
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
            <a href="/terms" style={{ color: colors.textMuted, textDecoration: "underline" }}>
              Terms &amp; Conditions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
