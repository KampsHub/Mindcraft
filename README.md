# Coaching Hub

A subscription-based daily coaching companion that gives clients a structured, personalised growth experience between (or instead of) live coaching sessions. Built by All Minds on Deck.

## What it does

- **Intake flow** — Clients select a coaching package (layoff recovery, international move, new manager, general growth) and answer tailored questions about values, family patterns, identity, relationships, saboteurs, work context, and goals.
- **AI-generated coaching plan** — Claude reads the intake responses and generates a personalised 12-week plan with goals, focus areas, weekly themes, and recommended frameworks.
- **Daily journaling** — Clients write journal entries and receive coaching reflections powered by Claude, with automatic theme tagging.
- **Auth & data privacy** — Email/password authentication with Row Level Security. Users can only access their own data. Journal content is private by default.

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS) |
| Auth & Database | Supabase (Postgres + Auth + RLS) |
| AI | Claude API (Sonnet) via Anthropic SDK |
| Hosting | Vercel |

## Local setup

1. **Clone the repo**
   ```
   git clone https://github.com/KampsHub/Mindcraft.git
   cd Mindcraft
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   CLAUDE_API_KEY=your-anthropic-api-key
   ```

4. **Set up Supabase tables**

   Run each SQL file in `supabase/` in the Supabase SQL Editor:
   - `schema.sql` — core tables (coaches, clients, frameworks_library)
   - `entries-rls.sql` — entries table with RLS
   - `intake-table.sql` — intake responses
   - `coaching-plans-table.sql` — coaching plans

5. **Run the dev server**
   ```
   npm run dev
   ```

6. **Open** `http://localhost:3000`

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── reflect/        # Journal → Claude → coaching reflection + theme tags
│   │   └── generate-plan/  # Intake → Claude → personalised coaching plan
│   ├── auth/callback/      # Email confirmation redirect
│   ├── intake/             # Multi-step intake questionnaire
│   ├── journal/            # Daily journaling + reflections
│   ├── login/              # Sign in
│   ├── plan/               # Coaching plan display
│   └── signup/             # Create account
├── lib/
│   ├── supabase.ts         # Browser client
│   └── supabase-server.ts  # Server client
└── middleware.ts            # Auth protection for /journal
supabase/
├── schema.sql              # Core database schema
├── entries-rls.sql         # Entries table + RLS
├── intake-table.sql        # Intake responses table
└── coaching-plans-table.sql # Coaching plans table
```

## User flow

Signup → Intake (package + questions) → Plan generation → Daily journaling → Coaching reflections
