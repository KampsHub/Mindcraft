#!/usr/bin/env bash
# PostToolUse hook: run tsc --noEmit on TypeScript files after Edit/Write.
#
# Non-blocking: prints errors to stderr so Claude sees them, but exits 0
# so the tool call completes. This is the "warn, don't block" pattern
# recommended by Claude Code power users — Claude decides whether to fix
# rather than being hard-stopped mid-session.
#
# Reads the edited file path from the CLAUDE_FILE_PATHS env var (Claude
# Code sets this before calling PostToolUse hooks).

set -uo pipefail

# Only act on .ts / .tsx files
if [[ -z "${CLAUDE_FILE_PATHS:-}" ]]; then
  exit 0
fi

if ! [[ "$CLAUDE_FILE_PATHS" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

# Only act when inside the Mindcraft repo root (where package.json + tsconfig live)
if [[ ! -f "package.json" ]] || [[ ! -f "tsconfig.json" ]]; then
  exit 0
fi

# Run tsc --noEmit --skipLibCheck against the whole project
# (single-file mode isn't reliable for Next.js with its module resolution).
OUTPUT=$(npx --no-install tsc --noEmit --skipLibCheck 2>&1 || true)
EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]] && [[ -n "$OUTPUT" ]]; then
  echo "⚠️  TypeScript errors detected after edit to $CLAUDE_FILE_PATHS:" >&2
  echo "$OUTPUT" | head -30 >&2
  echo "---" >&2
  echo "Fix before committing. Hook is non-blocking — the edit was written." >&2
fi

# Always exit 0 — this is a feedback hook, not a gate
exit 0
