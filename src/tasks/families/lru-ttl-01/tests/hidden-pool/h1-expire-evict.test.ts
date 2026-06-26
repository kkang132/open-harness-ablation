import { describe, expect, it } from "vitest";
import { LRUCache } from "../../cache.ts";

describe("LRUCache: expiry on a single slot", () => {
  it("expires the only entry once its ttl elapses", () => {
    const c = new LRUCache<number>(1, 50);
    expect(c.get("a", 0)).toBeUndefined();
    c.set("a", 1, 0);
    expect(c.get("a", 49)).toBe(1);
    expect(c.get("a", 50)).toBeUndefined();
  });
});
