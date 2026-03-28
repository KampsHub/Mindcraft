/**
 * Safely parse JSON from Claude responses.
 * Strips markdown code fences and handles parse errors gracefully.
 */
export function parseAIResponse<T = Record<string, unknown>>(text: string): T {
  let raw = text.trim();
  // Strip markdown code fences
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```[^\n]*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(raw);
}
