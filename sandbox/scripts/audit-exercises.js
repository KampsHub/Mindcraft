#!/usr/bin/env node
/**
 * Exercise Audit Script
 * Checks all exercises against the design learnings rubric.
 * Run: node sandbox/scripts/audit-exercises.js
 */

const fs = require("fs");
const path = require("path");

const PREVIEW_DIR = path.join(__dirname, "../src/app/exercises/preview");
const UNSUPPORTED_PRIMITIVES = new Set(["guided", "emotionWheel", "stakeholderMap", "progressRiver", "beforeAfter", "wordCloud"]);

// Parse exercise objects from TypeScript files
function extractExercises(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const exercises = [];
  const regex = /\{\s*id:\s*"([^"]+)"[\s\S]*?primitive:\s*"([^"]+)"[\s\S]*?\}/g;

  // Simpler: split by exercise objects
  const blocks = content.split(/(?=\{\s*id:\s*")/);
  for (const block of blocks) {
    const idMatch = block.match(/id:\s*"([^"]+)"/);
    const primMatch = block.match(/primitive:\s*"([^"]+)"/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    if (!idMatch || !primMatch) continue;

    exercises.push({
      id: idMatch[1],
      name: nameMatch ? nameMatch[1] : idMatch[1],
      primitive: primMatch[1],
      hasPrePopulated: block.includes("prePopulated"),
      hasWhyThis: block.includes("whyThis:"),
      hasWhyNow: block.includes("whyNow:"),
      hasInstruction: block.includes("instruction:"),
      hasTags: block.includes("tags:"),
      hasAvailableTags: block.includes("availableTags"),
      rawBlock: block.substring(0, 500), // First 500 chars for analysis
    });
  }
  return exercises;
}

// Audit rules
const rules = [
  {
    id: "missing-prepopulated",
    name: "Missing prePopulated data",
    severity: "high",
    check: (ex) => !ex.hasPrePopulated && !UNSUPPORTED_PRIMITIVES.has(ex.primitive),
    fix: "Add prePopulated data in the correct format for this primitive type.",
  },
  {
    id: "missing-whythis",
    name: "Missing whyThis (has old whyNow/science instead)",
    severity: "medium",
    check: (ex) => !ex.hasWhyThis && ex.hasWhyNow,
    fix: "Migrate whyNow + science into a single whyThis field that teaches the framework.",
  },
  {
    id: "tags-without-descriptions",
    name: "Has availableTags but tags may lack descriptions",
    severity: "low",
    check: (ex) => ex.hasAvailableTags && !ex.rawBlock.includes("—"),
    fix: "Ensure tag labels include behavioral descriptions (e.g., 'Criticism — attacking character').",
  },
  {
    id: "missing-instruction",
    name: "Missing instruction field",
    severity: "critical",
    check: (ex) => !ex.hasInstruction,
    fix: "Every exercise must have an instruction telling the user what to do.",
  },
];

// Run audit
const files = [
  "exerciseData.ts",
  "exerciseDataCognitiveSomatic.ts",
  "exerciseDataMissingRelIntSys.ts",
  "exerciseDataMissingSomatic.ts",
  "exerciseDataSystems.ts",
  "exerciseDataCore.ts",
];

let totalExercises = 0;
let totalIssues = 0;
const issuesByRule = {};
const issuesByFile = {};

for (const file of files) {
  const filePath = path.join(PREVIEW_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const exercises = extractExercises(filePath);
  totalExercises += exercises.length;
  issuesByFile[file] = [];

  for (const ex of exercises) {
    for (const rule of rules) {
      if (rule.check(ex)) {
        totalIssues++;
        if (!issuesByRule[rule.id]) issuesByRule[rule.id] = [];
        issuesByRule[rule.id].push({ file, exercise: ex.id, name: ex.name, primitive: ex.primitive });
        issuesByFile[file].push({ rule: rule.id, exercise: ex.id, name: ex.name });
      }
    }
  }
}

// Report
console.log("═══════════════════════════════════════════════════");
console.log("  EXERCISE AUDIT REPORT");
console.log("═══════════════════════════════════════════════════");
console.log(`  Total exercises scanned: ${totalExercises}`);
console.log(`  Total issues found: ${totalIssues}`);
console.log("");

// By severity
for (const rule of rules) {
  const issues = issuesByRule[rule.id] || [];
  if (issues.length === 0) continue;
  console.log(`\n[${rule.severity.toUpperCase()}] ${rule.name} (${issues.length} exercises)`);
  console.log(`  Fix: ${rule.fix}`);
  for (const issue of issues.slice(0, 10)) {
    console.log(`  - ${issue.exercise} (${issue.primitive}) in ${issue.file}`);
  }
  if (issues.length > 10) console.log(`  ... and ${issues.length - 10} more`);
}

// Summary by file
console.log("\n─── Issues by File ───");
for (const [file, issues] of Object.entries(issuesByFile)) {
  if (issues.length > 0) {
    console.log(`  ${file}: ${issues.length} issues`);
  } else {
    console.log(`  ${file}: ✓ clean`);
  }
}

// Score
const score = Math.round(((totalExercises - totalIssues) / totalExercises) * 100);
console.log(`\n═══════════════════════════════════════════════════`);
console.log(`  SCORE: ${score}% (${totalExercises - totalIssues}/${totalExercises} exercises pass)`);
console.log(`═══════════════════════════════════════════════════`);
