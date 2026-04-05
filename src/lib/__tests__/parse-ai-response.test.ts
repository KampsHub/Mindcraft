import { describe, it, expect } from "vitest";
import { parseAIResponse } from "@/lib/parse-ai-response";

describe("parseAIResponse", () => {
  it("parses plain JSON", () => {
    const result = parseAIResponse('{"key": "value", "num": 42}');
    expect(result).toEqual({ key: "value", num: 42 });
  });

  it("strips markdown code fences with json tag", () => {
    const input = '```json\n{"themes": ["identity", "fear"]}\n```';
    const result = parseAIResponse(input);
    expect(result).toEqual({ themes: ["identity", "fear"] });
  });

  it("strips markdown code fences without language tag", () => {
    const input = '```\n{"ok": true}\n```';
    const result = parseAIResponse(input);
    expect(result).toEqual({ ok: true });
  });

  it("handles whitespace around JSON", () => {
    const result = parseAIResponse('  \n {"a": 1} \n  ');
    expect(result).toEqual({ a: 1 });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseAIResponse("not json at all")).toThrow();
  });

  it("throws on incomplete JSON", () => {
    expect(() => parseAIResponse('{"key": "value"')).toThrow();
  });
});
