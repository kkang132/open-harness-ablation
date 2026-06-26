import { describe, expect, it } from "vitest";
import { countNonDecreasingSubarrays } from "../../solution.ts";

describe("countNonDecreasingSubarrays: large leading value", () => {
  it("handles a costly first element", () => {
    expect(countNonDecreasingSubarrays([1000000000, 1, 1, 1, 1], 1000000000)).toBe(12);
  });
});
