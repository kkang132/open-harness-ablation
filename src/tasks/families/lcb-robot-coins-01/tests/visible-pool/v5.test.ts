import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: alternating 3x3", () => {
  it("picks the path where neutralizing two robbers wins", () => {
    expect(maximumAmount([[5, -10, 5], [-10, 5, -10], [5, -10, 5]])).toBe(15);
  });
});
