import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for the vote API route logic.
 * We test the business logic directly without spinning up Next.js.
 */

// Mocked vote store for testing deduplication logic
function createVoteStore() {
  const votes = new Set<string>();

  return {
    hasVoted(tipId: string, session: string) {
      return votes.has(`${tipId}:${session}`);
    },
    addVote(tipId: string, session: string) {
      if (this.hasVoted(tipId, session)) return false;
      votes.add(`${tipId}:${session}`);
      return true;
    },
    removeVote(tipId: string, session: string) {
      return votes.delete(`${tipId}:${session}`);
    },
    size() {
      return votes.size;
    },
  };
}

describe("Vote deduplication logic", () => {
  it("allows a first vote", () => {
    const store = createVoteStore();
    const result = store.addVote("tip-1", "session-abc");
    expect(result).toBe(true);
    expect(store.size()).toBe(1);
  });

  it("prevents duplicate votes from the same session", () => {
    const store = createVoteStore();
    store.addVote("tip-1", "session-abc");
    const result = store.addVote("tip-1", "session-abc");
    expect(result).toBe(false);
    expect(store.size()).toBe(1);
  });

  it("allows different sessions to vote on the same tip", () => {
    const store = createVoteStore();
    store.addVote("tip-1", "session-abc");
    store.addVote("tip-1", "session-xyz");
    expect(store.size()).toBe(2);
  });

  it("allows same session to vote on different tips", () => {
    const store = createVoteStore();
    store.addVote("tip-1", "session-abc");
    store.addVote("tip-2", "session-abc");
    expect(store.size()).toBe(2);
  });

  it("allows un-voting and re-voting", () => {
    const store = createVoteStore();
    store.addVote("tip-1", "session-abc");
    store.removeVote("tip-1", "session-abc");
    const result = store.addVote("tip-1", "session-abc");
    expect(result).toBe(true);
    expect(store.size()).toBe(1);
  });
});

describe("Session ID generation", () => {
  it("generates a valid UUID format", () => {
    const id = crypto.randomUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    expect(id).toMatch(uuidRegex);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => crypto.randomUUID()));
    expect(ids.size).toBe(100);
  });
});
