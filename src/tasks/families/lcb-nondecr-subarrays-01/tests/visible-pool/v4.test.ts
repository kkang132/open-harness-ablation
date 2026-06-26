import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: strictly decreasing within budget", () => {
  it("counts all 21 subarrays", () => {
    expect(countNonDecreasingSubarrays([6, 5, 4, 3, 2, 1], 15)).toBe(21);
  });
});
