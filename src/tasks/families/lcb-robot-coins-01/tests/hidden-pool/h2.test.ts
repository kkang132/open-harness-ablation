import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: small mixed grid", () => {
  it("takes the positive row then descends", () => {
    expect(maximumAmount([[12, 19], [0, 0]])).toBe(31);
  });
});
