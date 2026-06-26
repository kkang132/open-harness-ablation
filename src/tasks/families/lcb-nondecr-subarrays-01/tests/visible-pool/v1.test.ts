import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: example 1", () => {
  it("counts 17 of 21 subarrays", () => {
    expect(countNonDecreasingSubarrays([6, 3, 1, 2, 4, 4], 7)).toBe(17);
  });
});
