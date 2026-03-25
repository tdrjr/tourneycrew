import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted runs before vi.mock factories, so mockCreate is available in the factory
const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = { create: mockCreate };
    constructor(_opts?: unknown) {}
  }
  return { default: MockAnthropic };
});

// Import AFTER the mock is registered
import { moderateTip } from "@/lib/claude/moderate";

function setResponse(text: string) {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text }],
  });
}

describe("moderateTip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approves a high-quality tip", async () => {
    setResponse(JSON.stringify({ approved: true, score: 0.95, reason: "Very helpful parking tip." }));

    const result = await moderateTip(
      "Best parking spot",
      "Park in Lot B — it's free and closest to the entrance. Fills up fast after 8am.",
      "parking"
    );

    expect(result.approved).toBe(true);
    expect(result.score).toBeCloseTo(0.95);
    expect(result.reason).toBeTruthy();
  });

  it("rejects spam or promotional content", async () => {
    setResponse(JSON.stringify({ approved: false, score: 0.1, reason: "Promotional content." }));

    const result = await moderateTip(
      "Buy my sports gear!",
      "Check out my store at example.com for the best deals!",
      "general"
    );

    expect(result.approved).toBe(false);
    expect(result.score).toBeLessThan(0.5);
  });

  it("handles JSON wrapped in markdown code block", async () => {
    setResponse("```json\n{\"approved\": true, \"score\": 0.8, \"reason\": \"Good tip.\"}\n```");

    const result = await moderateTip("Good food tip", "The pizza place nearby is great.", "food");
    expect(result.approved).toBe(true);
    expect(result.score).toBeCloseTo(0.8);
  });

  it("returns fallback on parse error", async () => {
    setResponse("This is not JSON at all!");

    const result = await moderateTip("Title", "Body", "general");
    expect(result.approved).toBe(false);
    expect(result.score).toBe(0);
    expect(result.reason).toContain("Moderation parsing error");
  });
});
