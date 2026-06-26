import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: single element, other value", () => {
  it("counts the one subarray", () => {
    expect(countNonDecreasingSubarrays([14], 1)).toBe(1);
  });
});
