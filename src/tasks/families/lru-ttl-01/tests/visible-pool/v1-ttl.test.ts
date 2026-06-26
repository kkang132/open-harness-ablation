import { describe, expect, it } from "vitest";
import { LRUCache } from "../../cache.ts";

describe("LRUCache: entries expire", () => {
  it("returns undefined once now reaches the expiry", () => {
    const c = new LRUCache<number>(2, 100);
    c.set("a", 1, 0);
    expect(c.get("a", 50)).toBe(1);
    expect(c.get("a", 100)).toBeUndefined();
  });
});
