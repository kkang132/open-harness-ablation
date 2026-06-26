import { describe, expect, it } from "vitest";
import { LRUCache } from "../../cache.ts";

describe("LRUCache: recency with three slots", () => {
  it("evicts the entry not touched by a recent get", () => {
    const c = new LRUCache<number>(3, 1000);
    c.set("a", 1, 0);
    c.set("b", 2, 0);
    c.set("c", 3, 0);
    c.get("a", 1); // touch a
    c.get("b", 1); // touch b, so c is least-recently-used
    c.set("d", 4, 1); // evicts c
    expect(c.get("c", 2)).toBeUndefined();
    expect(c.get("a", 2)).toBe(1);
    expect(c.get("d", 2)).toBe(4);
  });
});
