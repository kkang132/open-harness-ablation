import { describe, expect, it } from "vitest";
import { LRUCache } from "../../cache.ts";

describe("LRUCache: get updates recency", () => {
  it("a recent get protects an entry from eviction", () => {
    const c = new LRUCache<number>(2, 1000);
    c.set("a", 1, 0);
    c.set("b", 2, 0);
    c.get("a", 1); // touch a, so b is now least-recently-used
    c.set("c", 3, 1); // inserting c evicts the LRU, which should be b
    expect(c.get("b", 2)).toBeUndefined();
    expect(c.get("a", 2)).toBe(1);
  });
});
