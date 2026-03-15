/**
 * Parse and seed ALL common framework exercises from markdown files (00-12)
 * into the frameworks_library table with extended V2 columns.
 *
 * Run: npx tsx scripts/seed-common-frameworks.ts
 *
 * Requires: frameworks-library-v2.sql migration applied first
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

// Use service role key to bypass RLS for seeding
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("Get it from: Supabase Dashboard → Settings → API → service_role key");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey
);

const COACH_ID = "00000000-0000-0000-0000-000000000001";

// ── Framework source files ──────────────────────────────────────
const FRAMEWORK_DIR =
  "/Users/stefaniekamps/Documents/World-of-Steffi/Journaling & Tools/Exercises & Frameworks";

const SOURCE_FILES: {
  filename: string;
  fileId: string;
  defaultModality: string;
}[] = [
  {
    filename: "00-key-frameworks (1).md",
    fileId: "00",
    defaultModality: "mixed",
  },
  {
    filename: "01-cognitive-tools-expanded (1).md",
    fileId: "01",
    defaultModality: "cognitive",
  },
  {
    filename: "02-relational-tools-expanded (1).md",
    fileId: "02",
    defaultModality: "relational",
  },
  {
    filename: "03-somatic-tools-expanded.md",
    fileId: "03",
    defaultModality: "somatic",
  },
  {
    filename: "04-integrative-tools-expanded.md",
    fileId: "04",
    defaultModality: "integrative",
  },
  {
    filename: "05-systems-facilitation-tools-expanded (1).md",
    fileId: "05",
    defaultModality: "systems",
  },
  {
    filename: "07-pressure-career-therapy-tools.md",
    fileId: "07",
    defaultModality: "cognitive",
  },
  {
    filename: "11-midlife-program.md",
    fileId: "11",
    defaultModality: "integrative",
  },
];

// ── Attribution lookup from 06-master-source-attribution ────────
interface Attribution {
  originator: string;
  sourceWork: string;
}

function loadAttributionMap(): Map<string, Attribution> {
  const attrPath = path.join(FRAMEWORK_DIR, "06-master-source-attribution (1).md");
  const content = fs.readFileSync(attrPath, "utf-8");
  const map = new Map<string, Attribution>();

  // Parse table rows: | Tool Name | Source / Originator |
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (match && !match[1].includes("---") && !match[1].includes("Tool")) {
      const toolName = match[1].trim();
      const sourceStr = match[2].trim();

      // Parse originator and source work
      // Pattern: "Name, *Book Title* (year)" or "Name, Framework Name"
      let originator = sourceStr;
      let sourceWork = "";

      // Extract book/work in asterisks
      const bookMatch = sourceStr.match(/\*(.+?)\*/);
      if (bookMatch) {
        sourceWork = bookMatch[1];
      }

      // Extract originator (before the first comma or parenthetical)
      const commaIdx = sourceStr.indexOf(",");
      if (commaIdx > 0) {
        originator = sourceStr.substring(0, commaIdx).trim();
      } else {
        // Take everything before any parenthetical
        const parenIdx = sourceStr.indexOf("(");
        if (parenIdx > 0) {
          originator = sourceStr.substring(0, parenIdx).trim();
        }
      }

      // Clean up
      originator = originator.replace(/\*/g, "").trim();
      if (!sourceWork) {
        // Use the text after originator as sourceWork
        const rest = sourceStr.substring(commaIdx + 1).trim();
        sourceWork = rest.replace(/\*/g, "").replace(/\(\d{4}\)/g, "").trim();
      }

      map.set(toolName.toLowerCase(), { originator, sourceWork });
    }
  }

  return map;
}

// ── Quick-reference dispatch signals from 09 ────────────────────
function loadDispatchSignals(): Map<string, string> {
  const dispatchPath = path.join(FRAMEWORK_DIR, "09-tool-quick-reference.md");
  const content = fs.readFileSync(dispatchPath, "utf-8");
  const map = new Map<string, string>();

  let currentSignal = "";
  const lines = content.split("\n");

  for (const line of lines) {
    // Section headers like "### Stuck / Can't Decide / Two Paths"
    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch) {
      currentSignal = sectionMatch[1].trim();
      continue;
    }
    // Signal descriptions like "*Journal signals: torn between options..."
    const signalMatch = line.match(/^\*Journal signals:\s*(.+)\*$/);
    if (signalMatch) {
      currentSignal = signalMatch[1].trim();
      continue;
    }
    // Table rows: | Tool Name | Ref | Min |
    const tableMatch = line.match(/^\|\s*(.+?)\s*\|\s*(\d+:\d+)\s*\|\s*(.+?)\s*\|$/);
    if (tableMatch && currentSignal) {
      const toolName = tableMatch[1].trim();
      map.set(toolName.toLowerCase(), currentSignal);
    }
  }

  return map;
}

// ── Coaching questions from 12 ──────────────────────────────────
function loadCoachingQuestions(): Map<string, string[]> {
  const questionsPath = path.join(FRAMEWORK_DIR, "12-coaching-questions-bank.md");
  const content = fs.readFileSync(questionsPath, "utf-8");
  const map = new Map<string, string[]>();

  let currentTheme = "";
  const lines = content.split("\n");

  for (const line of lines) {
    const themeMatch = line.match(/^##\s+(.+)/);
    if (themeMatch) {
      currentTheme = themeMatch[1].trim();
      continue;
    }
    // Questions with file references like "- (01:394) What pattern..."
    const qMatch = line.match(/^-\s*\((\d+):(\d+)\)\s*(.+)/);
    if (qMatch && currentTheme) {
      const fileRef = qMatch[1];
      const question = qMatch[3].trim();
      const key = `${fileRef}:questions`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(question);
    }
  }

  return map;
}

// ── Tool parser ─────────────────────────────────────────────────
interface ParsedTool {
  name: string;
  description: string;
  instructions: string;
  howToRun: string;
  category: string;
  modality: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number | null;
  whenToUse: string;
  neuroscienceRationale: string;
  originator: string;
  sourceWork: string;
  themeTags: string[];
  fileLineRef: string;
  soloAdaptation: string;
}

function parseToolsFromFile(
  content: string,
  fileId: string,
  defaultModality: string,
  attributionMap: Map<string, Attribution>,
  dispatchMap: Map<string, string>
): ParsedTool[] {
  const tools: ParsedTool[] = [];
  const lines = content.split("\n");
  let currentSection = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Track H2 sections for category
    const h2Match = line.match(/^## (.+)/);
    if (h2Match) {
      currentSection = h2Match[1].replace(/[*_]/g, "").trim();
      i++;
      continue;
    }

    // Parse H3 tools: ### Tool Name (Originator / Source)
    const h3Match = line.match(/^### (.+)/);
    if (h3Match) {
      const lineNum = i + 1;
      const rawTitle = h3Match[1].trim();

      // Extract name and inline originator
      let name = rawTitle;
      let inlineOriginator = "";
      const parenMatch = rawTitle.match(/^(.+?)\s*\((.+?)\)\s*$/);
      if (parenMatch) {
        name = parenMatch[1].trim();
        inlineOriginator = parenMatch[2].trim();
      }

      // Collect all content until next H3 or H2
      i++;
      let toolContent = "";
      while (i < lines.length && !lines[i].match(/^#{2,3} /)) {
        toolContent += lines[i] + "\n";
        i++;
      }

      // Parse structured fields from content
      const durationMatch = toolContent.match(
        /\*\*Duration:\*\*\s*(.+?)(?:\||$)/m
      );
      let durationMinutes: number | null = null;
      if (durationMatch) {
        const durStr = durationMatch[1].trim();
        const numMatch = durStr.match(/(\d+)/);
        if (numMatch) durationMinutes = parseInt(numMatch[1]);
        // Handle ranges: "5-10 min" → take average
        const rangeMatch = durStr.match(/(\d+)-(\d+)/);
        if (rangeMatch) {
          durationMinutes = Math.round(
            (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2
          );
        }
      }

      const whenMatch = toolContent.match(
        /\*\*When to use:\*\*\s*(.+?)(?:\n\n|\n\*\*)/s
      );
      const whenToUse = whenMatch ? whenMatch[1].trim() : "";

      const neuroMatch = toolContent.match(
        /\*\*Neuroscience:\*\*\s*(.+?)(?:\n\n|\n\*\*)/s
      );
      const neuroscienceRationale = neuroMatch ? neuroMatch[1].trim() : "";

      const howToRunMatch = toolContent.match(
        /\*\*How to run it:\*\*\s*(.+?)(?:\n---|\n\*\*|$)/s
      );
      const howToRun = howToRunMatch ? howToRunMatch[1].trim() : "";

      const soloMatch = toolContent.match(
        /\*\*Solo adaptation:\*\*\s*(.+?)(?:\n\n|\n\*\*|$)/s
      );
      const soloAdaptation = soloMatch ? soloMatch[1].trim() : "";

      // Build description (first paragraph of content, truncated)
      const descLines = toolContent
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("**") && !l.startsWith("---"))
        .slice(0, 3);
      const description = descLines.join(" ").substring(0, 500).trim();

      // Look up attribution
      const attrKey = name.toLowerCase();
      const attr = attributionMap.get(attrKey);
      let originator = inlineOriginator;
      let sourceWork = "";
      if (attr) {
        originator = attr.originator;
        sourceWork = attr.sourceWork;
      } else if (inlineOriginator) {
        // Parse inline: "Albert Ellis / REBT"
        const parts = inlineOriginator.split("/").map((s) => s.trim());
        originator = parts[0];
        sourceWork = parts[1] || "";
      }

      // Look up dispatch signals
      const dispatchKey = name.toLowerCase();
      const dispatchSignal = dispatchMap.get(dispatchKey) || whenToUse;

      // Determine difficulty based on duration and complexity
      let difficulty: "beginner" | "intermediate" | "advanced" = "intermediate";
      if (durationMinutes !== null) {
        if (durationMinutes <= 3) difficulty = "beginner";
        else if (durationMinutes >= 15) difficulty = "advanced";
      }
      if (
        toolContent.includes("Full protocol") ||
        toolContent.includes("advanced") ||
        toolContent.includes("15-20 min") ||
        toolContent.includes("20-30 min")
      ) {
        difficulty = "advanced";
      }
      if (
        toolContent.includes("Quick") ||
        toolContent.includes("Fastest") ||
        toolContent.includes("30 sec") ||
        toolContent.includes("1 min")
      ) {
        difficulty = "beginner";
      }

      // Generate theme tags from content keywords
      const themeTags = inferThemeTags(toolContent, name, currentSection);

      // Determine modality from content or default
      let modality = defaultModality;
      if (toolContent.includes("body") && toolContent.includes("nervous system"))
        modality = "somatic";
      if (toolContent.includes("IFS") || toolContent.includes("parts"))
        modality = "integrative";
      if (
        toolContent.includes("relationship") &&
        toolContent.includes("partner")
      )
        modality = "relational";

      tools.push({
        name,
        description,
        instructions: toolContent.trim().substring(0, 4000),
        howToRun,
        category: currentSection || "General",
        modality,
        difficulty,
        durationMinutes,
        whenToUse: dispatchSignal,
        neuroscienceRationale,
        originator,
        sourceWork,
        themeTags,
        fileLineRef: `${fileId}:${lineNum}`,
        soloAdaptation,
      });

      continue;
    }

    i++;
  }

  return tools;
}

// ── Theme tag inference ─────────────────────────────────────────
function inferThemeTags(content: string, name: string, section: string): string[] {
  const tags: string[] = [];
  const lc = (content + " " + name + " " + section).toLowerCase();

  const tagMap: Record<string, string[]> = {
    identity_self_worth: ["identity", "self-worth", "self-concept", "who am i"],
    fear_of_failure: ["fear of failure", "imposter", "not enough", "falling short"],
    boundary_setting: ["boundary", "boundaries", "saying no", "limits"],
    cultural_adjustment: ["cultural", "culture", "cross-cultural", "expatriate"],
    authority_relationships: ["authority", "boss", "manager", "power", "hierarchy"],
    perfectionism: ["perfectionism", "perfect", "flawless", "standards"],
    inner_critic: ["inner critic", "critical voice", "self-criticism", "saboteur"],
    grief_loss: ["grief", "loss", "mourning", "letting go", "goodbye"],
    purpose_alignment: ["purpose", "meaning", "values", "alignment", "calling"],
    interpersonal_conflict: ["conflict", "tension", "disagreement", "friction"],
    vulnerability_avoidance: ["vulnerability", "avoidance", "hiding", "armor"],
    autonomy: ["autonomy", "independence", "freedom", "choice"],
    belonging: ["belonging", "connection", "community", "isolation"],
    performance_anxiety: ["performance", "anxiety", "pressure", "overwhelm"],
    transition_grief: ["transition", "change", "moving", "new chapter"],
    control: ["control", "controlling", "micromanage", "letting go"],
    people_pleasing: ["people-pleas", "approval", "fawn", "accommodate"],
    resilience: ["resilience", "bounce back", "recovery", "strength"],
    self_awareness: ["self-awareness", "awareness", "notice", "observe", "reflection"],
    growth_momentum: ["growth", "momentum", "progress", "forward"],
  };

  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => lc.includes(kw))) {
      tags.push(tag);
    }
  }

  // Always include self_awareness for cognitive tools
  if (tags.length === 0) tags.push("self_awareness");

  return tags.slice(0, 3); // max 3 tags
}

// ── Main seeding logic ──────────────────────────────────────────
async function main() {
  console.log("Loading attribution map from 06-master-source-attribution...");
  const attributionMap = loadAttributionMap();
  console.log(`  → ${attributionMap.size} attributions loaded`);

  console.log("Loading dispatch signals from 09-tool-quick-reference...");
  const dispatchMap = loadDispatchSignals();
  console.log(`  → ${dispatchMap.size} dispatch signals loaded`);

  console.log("Loading coaching questions from 12-coaching-questions-bank...");
  const _questionsMap = loadCoachingQuestions();

  let totalTools = 0;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const source of SOURCE_FILES) {
    const filePath = path.join(FRAMEWORK_DIR, source.filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ File not found: ${source.filename}`);
      continue;
    }

    console.log(`\nParsing ${source.filename}...`);
    const content = fs.readFileSync(filePath, "utf-8");
    const tools = parseToolsFromFile(
      content,
      source.fileId,
      source.defaultModality,
      attributionMap,
      dispatchMap
    );
    totalTools += tools.length;
    console.log(`  → ${tools.length} tools extracted`);

    // Batch insert
    for (const tool of tools) {
      const { error } = await supabase.from("frameworks_library").upsert(
        {
          coach_id: COACH_ID,
          name: tool.name,
          description: tool.description,
          instructions: tool.instructions,
          category: tool.category,
          difficulty_level: tool.difficulty,
          theme_tags: tool.themeTags,
          active: true,
          // V2 columns
          exercise_scope: "common",
          program_slug: null,
          source_file: tool.fileLineRef.split(":")[0],
          modality: tool.modality,
          originator: tool.originator || null,
          source_work: tool.sourceWork || null,
          duration_minutes: tool.durationMinutes,
          when_to_use: tool.whenToUse || null,
          neuroscience_rationale: tool.neuroscienceRationale || null,
          coaching_questions: [],
          file_line_ref: tool.fileLineRef,
          how_to_run: tool.howToRun || null,
          solo_adaptation: tool.soloAdaptation || null,
        },
        {
          onConflict: "name,coach_id",
          ignoreDuplicates: false,
        }
      );

      if (error) {
        // If upsert fails (no unique constraint), try insert
        const { error: insertError } = await supabase
          .from("frameworks_library")
          .insert({
            coach_id: COACH_ID,
            name: tool.name,
            description: tool.description,
            instructions: tool.instructions,
            category: tool.category,
            difficulty_level: tool.difficulty,
            theme_tags: tool.themeTags,
            active: true,
            exercise_scope: "common",
            program_slug: null,
            source_file: tool.fileLineRef.split(":")[0],
            modality: tool.modality,
            originator: tool.originator || null,
            source_work: tool.sourceWork || null,
            duration_minutes: tool.durationMinutes,
            when_to_use: tool.whenToUse || null,
            neuroscience_rationale: tool.neuroscienceRationale || null,
            coaching_questions: [],
            file_line_ref: tool.fileLineRef,
            how_to_run: tool.howToRun || null,
            solo_adaptation: tool.soloAdaptation || null,
          });

        if (insertError) {
          console.warn(`  ⚠ Failed to insert "${tool.name}": ${insertError.message}`);
          totalSkipped++;
        } else {
          totalInserted++;
        }
      } else {
        totalInserted++;
      }
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log(`Total tools parsed:    ${totalTools}`);
  console.log(`Total inserted/updated: ${totalInserted}`);
  console.log(`Total skipped:          ${totalSkipped}`);
  console.log("══════════════════════════════════════════");
}

main().catch(console.error);
