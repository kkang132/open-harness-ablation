import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: already non-decreasing pair", () => {
  it("counts all subarrays when no operations are needed", () => {
    expect(countNonDecreasingSubarrays([1, 1000000000], 999999999)).toBe(3);
  });
});
