const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents,
} = require("docx");
const fs = require("fs");

// Design tokens
const BRAND = { coral: "E09585", plum: "B08DAD", dark: "1A1A1E", gold: "D4A843", grey: "666666" };
const FONT = "Arial";
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// Helpers
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: BRAND.dark })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: BRAND.dark })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: BRAND.dark })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: FONT, size: 22, color: opts.color || "333333", ...opts })] });
}
function bold(text) {
  return new TextRun({ text, font: FONT, size: 22, bold: true, color: "333333" });
}
function normal(text) {
  return new TextRun({ text, font: FONT, size: 22, color: "333333" });
}
function italic(text) {
  return new TextRun({ text, font: FONT, size: 22, italics: true, color: "666666" });
}
function para(...runs) {
  return new Paragraph({ spacing: { after: 120 }, children: runs });
}
function statusBadge(text, color) {
  return new TextRun({ text: ` [${text}] `, font: FONT, size: 20, bold: true, color });
}

// Table helpers
const COL_FULL = 9360; // US Letter minus 1" margins
function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: BRAND.dark, type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20, bold: true, color: "FFFFFF" })] })],
  });
}
function cell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20, color: "333333" })] })],
  });
}
function statusCell(text, width, status) {
  const color = status === "live" ? "2E7D32" : status === "partial" ? BRAND.gold : "CC3333";
  const label = status === "live" ? "LIVE" : status === "partial" ? "PARTIAL" : "NEEDS PRD";
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text: label, font: FONT, size: 20, bold: true, color })] })],
  });
}

// ─── DOCUMENT ───

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: FONT }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: FONT }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: FONT }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ─── COVER ───
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [
        new Paragraph({ spacing: { before: 4000 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "MINDCRAFT", font: FONT, size: 48, bold: true, color: BRAND.dark })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "by All Minds On Deck", font: FONT, size: 24, color: BRAND.grey })] }),
        new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Product Requirements Document", font: FONT, size: 36, bold: true, color: BRAND.coral })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Post-Login Experience", font: FONT, size: 28, color: BRAND.dark })] }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Version 1.0  \u2022  March 2026", font: FONT, size: 22, color: BRAND.grey })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Author: Stefanie Kamps", font: FONT, size: 22, color: BRAND.grey })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Status: Living Document", font: FONT, size: 22, color: BRAND.gold })] }),
      ],
    },

    // ─── TOC + CONTENT ───
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: "Mindcraft PRD \u2014 Post-Login Experience", font: FONT, size: 18, color: BRAND.grey })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", font: FONT, size: 18, color: BRAND.grey }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: BRAND.grey })] })] }),
      },
      children: [
        // TOC
        new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: "Table of Contents", font: FONT, size: 32, bold: true, color: BRAND.dark })] }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ─── PART 1: OVERVIEW ───
        h1("1. Product Overview"),
        p("Mindcraft is a 30-day AI-powered coaching platform that delivers structured personal development programs through daily journaling, personalized exercises, and coaching insights. Three programs serve distinct career transitions:"),
        new Paragraph({ spacing: { after: 80 } }),

        new Table({
          width: { size: COL_FULL, type: WidthType.DXA },
          columnWidths: [2000, 2500, 4860],
          rows: [
            new TableRow({ children: [headerCell("Program", 2000), headerCell("Audience", 2500), headerCell("Core Territory", 4860)] }),
            new TableRow({ children: [cell("Parachute", 2000), cell("Layoff recovery", 2500), cell("Grief, identity loss, financial anxiety, rebuilding confidence after involuntary separation", 4860)] }),
            new TableRow({ children: [cell("Jetstream", 2000), cell("PIP navigation", 2500), cell("Performance pressure, manager dynamics, self-advocacy, deciding whether to fight or exit", 4860)] }),
            new TableRow({ children: [cell("Basecamp", 2000), cell("New role confidence", 2500), cell("Imposter syndrome, culture adaptation, stakeholder navigation, proving yourself again", 4860)] }),
          ],
        }),

        new Paragraph({ spacing: { before: 200 } }),
        p("All three programs share the same post-login architecture (dashboard, day flow, goals, insights) but differ in content: intake questions, daily territories, exercise selection, weekly themes, and AI prompt context."),

        // ─── PART 2: FEATURE STATUS ───
        new Paragraph({ children: [new PageBreak()] }),
        h1("2. Feature Status Matrix"),
        p("Current implementation status of all post-login features. Features marked NEEDS PRD require dedicated specification before implementation or iteration."),
        new Paragraph({ spacing: { before: 100 } }),

        new Table({
          width: { size: COL_FULL, type: WidthType.DXA },
          columnWidths: [2800, 1200, 5360],
          rows: [
            new TableRow({ children: [headerCell("Feature", 2800), headerCell("Status", 1200), headerCell("Notes", 5360)] }),
            new TableRow({ children: [cell("Authentication (signup, login, reset)", 2800), statusCell("", 1200, "live"), cell("Supabase Auth. Email confirmation required.", 5360)] }),
            new TableRow({ children: [cell("Intake & Onboarding", 2800), statusCell("", 1200, "live"), cell("7 universal + program-specific question sets. Consent flow.", 5360)] }),
            new TableRow({ children: [cell("Dashboard", 2800), statusCell("", 1200, "live"), cell("Program cards, exercises, quick links, upsells, background images.", 5360)] }),
            new TableRow({ children: [cell("Day Flow (5-step)", 2800), statusCell("", 1200, "live"), cell("Themes \u2192 Journal \u2192 Processing \u2192 Exercises \u2192 Summary.", 5360)] }),
            new TableRow({ children: [cell("Goal Generation & Selection", 2800), statusCell("", 1200, "live"), cell("6 AI-generated goals after Day 3. User selects 2\u20133.", 5360)] }),
            new TableRow({ children: [cell("Weekly Review / Insights", 2800), statusCell("", 1200, "live"), cell("Weekly stats, AI insights, goal ratings, theme charts.", 5360)] }),
            new TableRow({ children: [cell("Monthly Summary", 2800), statusCell("", 1200, "partial"), cell("Theme charts + entry list exist. No AI narrative yet.", 5360)] }),
            new TableRow({ children: [cell("Mindful Journal (NVC)", 2800), statusCell("", 1200, "live"), cell("Free-flow + feelings/needs checklists. Saves to entries.", 5360)] }),
            new TableRow({ children: [cell("Exercise Framework Library", 2800), statusCell("", 1200, "live"), cell("250+ frameworks. 5 modalities. Per-program + common.", 5360)] }),
            new TableRow({ children: [cell("Enneagram Add-on", 2800), statusCell("", 1200, "partial"), cell("Purchase flow works. Results display + integration incomplete.", 5360)] }),
            new TableRow({ children: [cell("1:1 Coaching Application", 2800), statusCell("", 1200, "live"), cell("9-step form. Email notification to coach.", 5360)] }),
            new TableRow({ children: [cell("Contact & Quality Flags", 2800), statusCell("", 1200, "live"), cell("Contact form + in-product flag buttons on day pages.", 5360)] }),
            new TableRow({ children: [cell("Coach Dashboard", 2800), statusCell("", 1200, "partial"), cell("Client list + analytics. No real-time messaging.", 5360)] }),
            new TableRow({ children: [cell("Account & Settings", 2800), statusCell("", 1200, "live"), cell("Profile, consent, data export, account deletion.", 5360)] }),
            new TableRow({ children: [cell("Email System", 2800), statusCell("", 1200, "live"), cell("Welcome, confirmation, contact, application via Resend.", 5360)] }),
            new TableRow({ children: [cell("Stripe Payments", 2800), statusCell("", 1200, "live"), cell("Program checkout, enneagram checkout, webhook handling.", 5360)] }),
            new TableRow({ children: [cell("Program Completion Flow", 2800), statusCell("", 1200, "needs"), cell("No defined experience for Day 30+. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Download / Export Section", 2800), statusCell("", 1200, "needs"), cell("Users want PDF/printable journals. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Notifications & Reminders", 2800), statusCell("", 1200, "needs"), cell("No push/email nudges for daily sessions. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Mobile Experience", 2800), statusCell("", 1200, "needs"), cell("Responsive CSS exists but not optimized. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Onboarding Tour / First-Time UX", 2800), statusCell("", 1200, "needs"), cell("No guided walkthrough for new users. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Coach\u2013Client Messaging", 2800), statusCell("", 1200, "needs"), cell("No in-app communication channel. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Multi-Program Enrollment", 2800), statusCell("", 1200, "needs"), cell("Switcher exists but UX for 2+ programs unclear. Needs PRD.", 5360)] }),
            new TableRow({ children: [cell("Re-enrollment / Program Restart", 2800), statusCell("", 1200, "needs"), cell("What happens if someone wants to redo the program? Needs PRD.", 5360)] }),
          ],
        }),

        // ─── PART 3: CURRENT FEATURES (DETAILED) ───
        new Paragraph({ children: [new PageBreak()] }),
        h1("3. Current Features (Detailed)"),

        // 3.1 AUTH
        h2("3.1 Authentication"),
        para(bold("Sign Up: "), normal("Email + password via Supabase Auth. Confirmation email required. Minimum 6-character password. Success redirects to intake.")),
        para(bold("Log In: "), normal("Email + password. Forgot-password link sends recovery email. Success redirects to dashboard.")),
        para(bold("Protected Routes: "), normal("Middleware redirects unauthenticated users to /login. Protected: dashboard, day, goals, weekly-review, monthly-summary, journal, exercise, coach, my-account.")),

        // 3.2 INTAKE
        h2("3.2 Intake & Onboarding"),
        p("Multi-screen questionnaire completed before Day 1. Responses stored in program_enrollments and client_assessments tables."),
        h3("Universal Questions (All Programs)"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Values & Motivation (5 questions): decision-making, aliveness, importance ranking, cost of values")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Family of Origin (4 questions): climate, rewards, conflict resolution, absorbed messages")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Identity & Self-Concept (4 questions): self-description, perception by others, feared self, authenticity")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Relationship Patterns (4 questions): status, recurring tension, hurt response, hardest ask")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Inner Patterns (3 questions): success underminer, stress response, repeated pattern")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Work & Professional (3 questions): current role, best environment, proud moment")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Goals & Context (3 questions): why now, 6-month vision, what tried")] }),

        h3("Program-Specific Questions"),
        para(bold("Parachute: "), normal("Timeline, identity impact narrative, unsaid feelings, greatest fears, relief/opportunity perception")),
        para(bold("Jetstream: "), normal("PIP timeline & duration, stated reasons, feedback validity, manager history, financial runway, isolation patterns")),
        para(bold("Basecamp: "), normal("Transition context, role details, culture differences, manager impressions, emotional starting point, relationship impact")),

        h3("Consent"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("AI processing (required)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Coach sharing (optional)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Aggregate analytics (optional, default on)")] }),

        // 3.3 DASHBOARD
        new Paragraph({ children: [new PageBreak()] }),
        h2("3.3 Dashboard"),
        p("Primary post-login landing page. Shows enrollment status, daily progress, and navigation."),
        h3("Components"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Welcome Section: "), normal("Program-specific daily greeting (13\u201315 rotated options per program), user email")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Program Card: "), normal("Week/day pills, active goals (up to 3), 7-day progress row, \u201CContinue today\u201D button")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Exercises Section: "), normal("Incomplete exercises from current enrollment")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Quick Links: "), normal("Journal, Progress (Goals), Insights (Weekly Review)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Upsell Section: "), normal("Enneagram add-on ($300) + 1:1 Coaching application. Separator line divides from main content.")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Background Images: "), normal("Program-specific rotating daily images (9 parachute, 8 jetstream, 12 basecamp). Stable within session.")] }),

        // 3.4 DAY FLOW
        h2("3.4 Day Flow (5-Step Daily Session)"),
        p("The core product experience. Each day follows a structured 5-step workflow:"),

        h3("Step 1: Yesterday\u2019s Themes"),
        para(bold("AI Source: "), normal("/api/daily-themes")),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Thread: narrative connecting last 2\u20133 days\u2019 patterns")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Theme tags displayed as pills")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Commitment check-in from previous day")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("\u201CFor Tomorrow\u201D suggestions: watch / try / sit-with")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [italic("Day 1 exception: skipped (no yesterday to review)")] }),

        h3("Step 2: Free-Flow Journal"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Open text area for journaling")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Optional territory prompts from program day config")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Prompts include context field explaining concepts (e.g., \u201Cseven disruptions\u201D)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Word count displayed. Saves to daily_sessions.step_2_journal")] }),

        h3("Step 3: Journal Processing"),
        para(bold("AI Source: "), normal("/api/process-journal")),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Reading: "), normal("3\u20135 sentence coaching response. Only quotes user\u2019s actual words.")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Coaching Questions: "), normal("2\u20133 probing questions to sit with")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Reframe: "), normal("Old thought \u2192 New thought transformation")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Pattern Challenge: "), normal("Behavioral experiment for the day")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Exercise Selection: "), normal("4 exercises chosen from 250+ framework library")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Crisis Detection: "), normal("If urgency = high, shows hotline numbers (988, 741741) instead of exercises")] }),

        h3("Step 4: Exercises"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("4 personalized exercises per day")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Each shows: framework name, originator, custom framing, duration, prompts")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Response capture per exercise (text input)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Star rating (1\u20135) + optional feedback")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Modality balance: cognitive, somatic, relational, integrative, systems")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Avoids repeating frameworks used in last 3 days")] }),

        h3("Step 5: Daily Summary"),
        para(bold("AI Source: "), normal("/api/daily-summary")),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Summary prose of the day\u2019s work")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Exercise insights: what was learned from each")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Goal progress observations")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Tomorrow preview: title, territory, connection")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Day rating (1\u20135 stars) + feedback")] }),

        // 3.5 GOALS
        new Paragraph({ children: [new PageBreak()] }),
        h2("3.5 Goal Generation & Management"),
        para(bold("Trigger: "), normal("After Day 3 completion")),
        para(bold("AI Source: "), normal("/api/generate-goals (Claude generates exactly 6 goals)")),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Goals are developmental outcomes, not tasks")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Each includes why_generated explanation referencing client\u2019s words")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("User selects 2\u20133 active goals; rest stay visible")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Weekly self-ratings (1\u201310) per active goal")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Goals can be swapped at weekly review")] }),

        // 3.6 WEEKLY REVIEW
        h2("3.6 Weekly Review & Insights"),
        para(bold("AI Source: "), normal("/api/weekly-insights")),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Program progress: 4-week horizontal stepper")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Week stats: sessions completed, exercises done, journal entries")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("4\u20136 AI-generated insights (types: pattern, shift, sticking_point, breakthrough, connection)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Goal rating sliders with notes")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Theme frequency charts (Recharts)")] }),

        // 3.7 EXERCISES
        h2("3.7 Exercise Framework Library"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("250+ frameworks across 5 modalities")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Common frameworks shared across programs + program-specific sets")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Each framework: name, originator, source work, category, modality, difficulty, theme tags, when_to_use, duration")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Selection considers: journal themes, modality balance, recency, difficulty, urgency")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Custom framing: AI personalizes exercise instructions to the client\u2019s specific context")] }),

        // 3.8 AI
        h2("3.8 AI Integration (Claude API)"),
        p("All AI features use Claude Sonnet via the shared getAnthropicClient() factory. Rate limited to 10 requests/minute per user."),
        new Paragraph({ spacing: { before: 100 } }),

        new Table({
          width: { size: COL_FULL, type: WidthType.DXA },
          columnWidths: [2800, 2200, 4360],
          rows: [
            new TableRow({ children: [headerCell("Endpoint", 2800), headerCell("Trigger", 2200), headerCell("Output", 4360)] }),
            new TableRow({ children: [cell("/api/daily-themes", 2800), cell("Step 1 open", 2200), cell("Thread narrative, theme tags, commitments, tomorrow suggestions", 4360)] }),
            new TableRow({ children: [cell("/api/process-journal", 2800), cell("Step 3 click", 2200), cell("Reading, coaching Qs, reframe, exercises, pattern challenge", 4360)] }),
            new TableRow({ children: [cell("/api/daily-exercise", 2800), cell("Exercise detail", 2200), cell("Personalized exercise instructions", 4360)] }),
            new TableRow({ children: [cell("/api/daily-summary", 2800), cell("Step 5 open", 2200), cell("Day summary, insights, goal progress, tomorrow preview", 4360)] }),
            new TableRow({ children: [cell("/api/reflect", 2800), cell("Journal submit", 2200), cell("Coaching reflection + theme tags", 4360)] }),
            new TableRow({ children: [cell("/api/framework-analysis", 2800), cell("Framework deep-dive", 2200), cell("Framework explanation, application, reflection prompt", 4360)] }),
            new TableRow({ children: [cell("/api/weekly-insights", 2800), cell("Weekly review open", 2200), cell("4\u20136 typed insights with source attribution", 4360)] }),
            new TableRow({ children: [cell("/api/generate-goals", 2800), cell("Day 3 complete", 2200), cell("6 personalized coaching goals", 4360)] }),
            new TableRow({ children: [cell("/api/generate-plan", 2800), cell("Program end", 2200), cell("Coaching plan summary", 4360)] }),
            new TableRow({ children: [cell("/api/generate-profile", 2800), cell("Before goals", 2200), cell("Client coaching profile for coach dashboard", 4360)] }),
          ],
        }),

        // 3.9 PAYMENTS
        new Paragraph({ children: [new PageBreak()] }),
        h2("3.9 Payments (Stripe)"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Program Checkout: "), normal("Stripe Checkout sessions per program. Customer lookup by email.")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Enneagram Checkout: "), normal("Separate Stripe product ($300). Webhook creates assessment record.")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Webhook Handler: "), normal("Handles subscription updates/deletions. Links Stripe customer to Supabase user.")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [bold("Customer Portal: "), normal("Links to Stripe portal for billing management.")] }),

        // 3.10 ACCOUNT
        h2("3.10 Account & Settings"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Profile: name (editable), email (display only)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Consent toggles: AI processing, coach sharing, analytics")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Data export: download all user data as JSON")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Account deletion: confirmation flow with typed \u201CDELETE\u201D")] }),

        // ─── PART 4: NEEDS PRD ───
        new Paragraph({ children: [new PageBreak()] }),
        h1("4. Features Requiring PRD"),
        p("The following features are either missing, partially implemented, or need design decisions before building. Each section outlines the gap and key questions to answer."),

        // 4.1
        h2("4.1 Program Completion Flow"),
        para(bold("Gap: "), normal("No defined experience for what happens after Day 30. Users currently see the dashboard with a completed status but no ceremony, summary, or next steps.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("What does the Day 30 experience look like? Final summary, celebration, certificate?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Is there a post-program dashboard state? Or does the user lose access?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Can users re-enroll in the same program? Different program?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("What happens to their data? Goals, journal entries, exercise history?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Is there a final coaching report / takeaway document?")] }),

        // 4.2
        h2("4.2 Download & Export Section"),
        para(bold("Gap: "), normal("Users can export raw JSON from account settings, but there\u2019s no formatted export. Users want printable journals, exercise summaries, and progress reports.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("What formats? PDF, DOCX, or both?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("What content is exportable? Full journal, weekly summaries, exercise responses, goal progress?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Branded templates or plain text?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Per-day, per-week, or full-program exports?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Where does the download button live? Account page? Each page individually?")] }),

        // 4.3
        h2("4.3 Notifications & Reminders"),
        para(bold("Gap: "), normal("No push notifications, email nudges, or SMS reminders for daily sessions. Users who miss a day have no re-engagement trigger.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Email reminders? Daily morning nudge? Missed-day follow-up?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Push notifications (requires PWA or native app)?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("User-configurable reminder time?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Streak tracking and encouragement?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Coach alerts for clients who go silent?")] }),

        // 4.4
        h2("4.4 Mobile Experience"),
        para(bold("Gap: "), normal("Responsive CSS exists but the experience is not optimized for mobile. Journaling on phone is common but the text editor, exercise cards, and charts are desktop-first.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("PWA (Progressive Web App) or native app?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Which flows are mobile-critical? (Journaling, exercise completion, daily themes)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Offline support? Can users journal without internet?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Touch-optimized exercise interactions?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Mobile-specific navigation (bottom tabs vs. hamburger)?")] }),

        // 4.5
        h2("4.5 Onboarding Tour / First-Time UX"),
        para(bold("Gap: "), normal("After intake completion, users land on the dashboard with no guided introduction. The 5-step day flow, goals system, and weekly review need explanation.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Tooltip tour, video walkthrough, or interactive onboarding?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Day 1 special experience (currently just \u201CWelcome to Day 1\u201D)?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Should onboarding surface different content per program?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Progress indicators for intake completion?")] }),

        // 4.6
        h2("4.6 Coach\u2013Client Messaging"),
        para(bold("Gap: "), normal("No in-app communication channel between coach and client. Coach notes exist but are one-directional. Contact form exists but is not conversational.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Real-time chat or async messaging?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Integrated into the day flow or separate messaging section?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Voice/video capability?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Message history and searchability?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Notification preferences per message type?")] }),

        // 4.7
        h2("4.7 Multi-Program Enrollment"),
        para(bold("Gap: "), normal("Program switcher component exists but the UX for managing 2+ concurrent programs is undefined. Background images, greeting rotations, and day flows need clear program scoping.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Can users run two programs simultaneously?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("How does the dashboard prioritize? Most recent enrollment?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Shared journal entries across programs or separate?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Cross-program goal continuity?")] }),

        // 4.8
        h2("4.8 Re-enrollment & Program Restart"),
        para(bold("Gap: "), normal("No mechanism for repeating a program or restarting from scratch. Users who complete Parachute and later face another layoff have no re-entry path.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Fresh start or continue from where they left off?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Previous data visible or archived?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Pricing for re-enrollment? Discount? Free?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Skip intake if already completed?")] }),

        // 4.9
        h2("4.9 Enneagram Integration (Post-Purchase)"),
        para(bold("Gap: "), normal("Purchase flow works but results display, type integration into exercises, and debrief scheduling are incomplete.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("How are IEQ9 results imported? Manual upload or API?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Results page design: type description, wings, instinctual variants?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("How do results modify exercise selection and AI prompts?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("1-hour debrief scheduling: Calendly, in-app, or manual?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Coach notes integration with Enneagram type?")] }),

        // 4.10
        h2("4.10 Monthly Summary (Enhancement)"),
        para(bold("Gap: "), normal("Basic charts and entry list exist. No AI-generated monthly narrative, no trend analysis across weeks, no comparison to program trajectory.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("AI-generated monthly coaching narrative?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Week-over-week trend visualization?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Goal trajectory chart (are ratings improving)?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Shareable monthly report for coach review?")] }),

        // 4.11
        h2("4.11 Coaching Questions (Interactive)"),
        para(bold("Gap: "), normal("Step 3 generates \u201Cquestions to sit with\u201D but users cannot respond to them in-app. Responses would enrich the coaching data for future AI personalization.")),
        h3("Key Questions"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Inline text input below each coaching question?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Responses stored as entries or as session metadata?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Do responses feed into next day\u2019s themes?")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [normal("Optional or required before proceeding to exercises?")] }),

        // ─── PART 5: DATABASE ───
        new Paragraph({ children: [new PageBreak()] }),
        h1("5. Database Schema (Key Tables)"),
        new Paragraph({ spacing: { before: 100 } }),

        new Table({
          width: { size: COL_FULL, type: WidthType.DXA },
          columnWidths: [2600, 6760],
          rows: [
            new TableRow({ children: [headerCell("Table", 2600), headerCell("Purpose & Key Fields", 6760)] }),
            new TableRow({ children: [cell("programs", 2600), cell("Program metadata: slug, name, tagline, weekly_themes (JSON), intake_config, pricing", 6760)] }),
            new TableRow({ children: [cell("program_enrollments", 2600), cell("User\u2192Program link: status, current_day, goals_approved, pre_start_data, onboarding_data", 6760)] }),
            new TableRow({ children: [cell("program_days", 2600), cell("Day content: territory, seed_prompts (with context), exercises, themes per day per program", 6760)] }),
            new TableRow({ children: [cell("daily_sessions", 2600), cell("Session data: step_2_journal, step_3_analysis (JSON), step_5_summary, ratings, completed_at", 6760)] }),
            new TableRow({ children: [cell("exercise_completions", 2600), cell("Exercise tracking: framework_id, responses (JSON), star_rating, feedback, modality", 6760)] }),
            new TableRow({ children: [cell("client_goals", 2600), cell("Coaching goals: goal_text, why_generated, status (active/proposed), order_index", 6760)] }),
            new TableRow({ children: [cell("weekly_reviews", 2600), cell("Weekly data: goal_ratings (JSON), reflection, feedback, week_number", 6760)] }),
            new TableRow({ children: [cell("frameworks_library", 2600), cell("250+ exercises: name, modality, originator, source_work, category, theme_tags, difficulty", 6760)] }),
            new TableRow({ children: [cell("entries", 2600), cell("Journal entries: content, theme_tags, metadata (NVC, source), date. Vector embeddings for RAG.", 6760)] }),
            new TableRow({ children: [cell("client_assessments", 2600), cell("Assessments: type (enneagram), results_json", 6760)] }),
            new TableRow({ children: [cell("consent_settings", 2600), cell("Privacy: ai_processing, coach_sharing, aggregate_analytics", 6760)] }),
            new TableRow({ children: [cell("quality_flags", 2600), cell("Product feedback: reason, type, quote, daily_session_id", 6760)] }),
            new TableRow({ children: [cell("subscriptions", 2600), cell("Stripe links: customer_id, status, product_id", 6760)] }),
            new TableRow({ children: [cell("email_events", 2600), cell("Email engagement: delivered, opened, clicked, bounced", 6760)] }),
          ],
        }),

        // ─── PART 6: TECH STACK ───
        new Paragraph({ children: [new PageBreak()] }),
        h1("6. Technical Architecture"),
        new Paragraph({ spacing: { before: 100 } }),

        new Table({
          width: { size: COL_FULL, type: WidthType.DXA },
          columnWidths: [2600, 6760],
          rows: [
            new TableRow({ children: [headerCell("Layer", 2600), headerCell("Technology", 6760)] }),
            new TableRow({ children: [cell("Framework", 2600), cell("Next.js 16 (App Router) on Vercel Hobby plan", 6760)] }),
            new TableRow({ children: [cell("Database", 2600), cell("Supabase (PostgreSQL + Auth + Row Level Security)", 6760)] }),
            new TableRow({ children: [cell("AI", 2600), cell("Anthropic Claude Sonnet via @anthropic-ai/sdk", 6760)] }),
            new TableRow({ children: [cell("Payments", 2600), cell("Stripe (Checkout, Webhooks, Customer Portal)", 6760)] }),
            new TableRow({ children: [cell("Email", 2600), cell("Resend from allmindsondeck.com domain", 6760)] }),
            new TableRow({ children: [cell("Styling", 2600), cell("Inline styles with shared theme tokens (src/lib/theme.ts)", 6760)] }),
            new TableRow({ children: [cell("Charts", 2600), cell("Recharts (bar, pie, line charts)", 6760)] }),
            new TableRow({ children: [cell("Animation", 2600), cell("Framer Motion (page transitions, hover states)", 6760)] }),
            new TableRow({ children: [cell("Search", 2600), cell("Vector embeddings via Supabase pgvector for RAG", 6760)] }),
          ],
        }),

        // ─── APPENDIX A: INTAKE QUESTIONS ───
        new Paragraph({ children: [new PageBreak()] }),
        h1("Appendix A: Full Intake Questionnaire"),
        p("All questions shown to users during the intake flow, organized by category. Universal questions appear for all programs; program-specific questions appear only for the selected program."),

        h2("A.1 Universal Questions"),

        h3("Values & Motivation"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Think of a decision you made recently that felt right \u2014 even if it was hard. What made it feel right?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("When have you felt most alive in the last year?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Rank these in order of importance to you (drag or number 1\u20137):"), normal(" Autonomy, Belonging, Achievement, Security, Growth, Impact, Creativity (ranking)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s a value you hold that sometimes costs you \u2014 at work or in relationships?"), normal(" (textarea)")] }),

        h3("Family of Origin"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Describe the emotional climate of your family growing up. What was the general atmosphere?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What was rewarded in your family? What was punished or ignored?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How did your family handle conflict and strong emotions?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s a message you absorbed growing up that you\u2019re still carrying \u2014 even if you know it\u2019s not fully true?"), normal(" (textarea)")] }),

        h3("Identity & Self-Concept"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How would you describe yourself in three words?"), normal(" (short text)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How would the people closest to you describe you?"), normal(" (short text)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s the version of yourself you\u2019re most afraid of being?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Where do you feel most like yourself? Least?"), normal(" (textarea)")] }),

        h3("Relationship Patterns"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Are you currently in a significant relationship? If so, how long?"), normal(" (short text)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s a recurring tension or pattern in your closest relationships?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("When you feel hurt or disconnected, what do you typically do?"), normal(" Options: Move toward / Pull away / Push back / It depends (select)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s the hardest thing for you to ask for in a relationship?"), normal(" (textarea)")] }),

        h3("Inner Critics & Saboteurs"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("When things go well, what\u2019s the voice in your head that tries to undermine it? What does it say?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What do you tend to do when you\u2019re under stress?"), normal(" Options: Over-control / Withdraw / Perform / Intellectualise / Other (select)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s a pattern you know isn\u2019t serving you but keep repeating?"), normal(" (textarea)")] }),

        h3("Work & Professional Context"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What do you do, and how did you end up there?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s the best professional environment you\u2019ve ever been in? What made it work?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s a professional moment you\u2019re genuinely proud of?"), normal(" (textarea)")] }),

        h3("Goals & Current Context"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s happening in your life right now that made you seek coaching?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("If this process works, what\u2019s different in 6 months?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What have you already tried?"), normal(" (textarea)")] }),

        // Program-specific
        new Paragraph({ children: [new PageBreak()] }),
        h2("A.2 Parachute (Layoff Recovery)"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("When did the layoff happen, and how much notice did you get?"), normal(" (short text)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How much of your identity was tied to your role or company? What feels different about you now that it\u2019s gone?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s the story you\u2019re telling yourself about why this happened?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What\u2019s something about this experience you haven\u2019t said out loud to anyone yet?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What are you most afraid of right now \u2014 financially, professionally, or personally?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Is there any part of you \u2014 even a small part \u2014 that feels relieved or sees an opportunity in this?"), normal(" (textarea)")] }),

        h2("A.3 Jetstream (PIP Navigation)"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("When was the PIP issued? What preceded it \u2014 how was it delivered, and what is the formal duration?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What are the stated reasons on the PIP document? Be as specific as you can \u2014 verbatim if possible."), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Your honest assessment: which feedback is valid, which is political, and which you genuinely cannot tell?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Describe your manager relationship history. When did it shift? What did you notice? What did you ignore?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("Financial runway: roughly how many months can you sustain current spending if you lost this income? Who knows about the PIP, and who is helping?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How is this PIP affecting your partner, family, or close friendships? Where are you withdrawing? If single, where is isolation showing up?"), normal(" (textarea)")] }),

        h2("A.4 Basecamp (New Role Confidence)"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What is the context of this transition? Were you recruited, did you apply, is this an internal move, or are you returning from leave?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What is your new role? Include title, function, team size, and whether you are remote, hybrid, or in-person."), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What do you already know about the culture? What feels different from where you came from \u2014 pace, communication norms, hierarchy, how decisions get made?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("What are your first impressions of your manager? What do you think they need from you?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How would you describe your emotional starting point \u2014 excited, anxious, both, numb, cautious, relieved, pressured?"), normal(" (textarea)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [bold("How is this transition affecting the people closest to you \u2014 partner, family, close friends? Where is the stress landing at home?"), normal(" (textarea)")] }),

        new Paragraph({ spacing: { before: 300 } }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND.coral } }, spacing: { after: 200 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [italic("End of PRD \u2014 Living document. Last updated March 2026.")] }),
      ],
    },
  ],
});

// Write
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/Users/stefaniekamps/Documents/World-of-Steffi/mindcraft-ninja/docs/PRD-Post-Login-Product.docx", buffer);
  console.log("PRD written successfully.");
});
