import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: example 2", () => {
  it("counts 12 subarrays", () => {
    expect(countNonDecreasingSubarrays([6, 3, 1, 3, 6], 4)).toBe(12);
  });
});
