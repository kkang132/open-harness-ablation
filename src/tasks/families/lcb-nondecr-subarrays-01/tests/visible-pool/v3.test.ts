import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: single element", () => {
  it("counts the one subarray", () => {
    expect(countNonDecreasingSubarrays([12], 1)).toBe(1);
  });
});
