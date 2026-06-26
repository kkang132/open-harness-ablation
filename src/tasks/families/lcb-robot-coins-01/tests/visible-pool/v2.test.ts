import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: all positive", () => {
  it("sums the whole path when nothing is stolen", () => {
    expect(maximumAmount([[10, 10, 10], [10, 10, 10]])).toBe(40);
  });
});
