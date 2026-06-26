import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: example 1", () => {
  it("neutralizes the costly robber on the best path", () => {
    expect(maximumAmount([[0, 1, -1], [1, -2, 3], [2, -3, 4]])).toBe(8);
  });
});
