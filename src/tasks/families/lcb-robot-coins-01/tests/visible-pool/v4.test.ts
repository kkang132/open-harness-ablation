import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: all-negative 2x2", () => {
  it("neutralizes the two worst cells on the path", () => {
    expect(maximumAmount([[-2, -3], [-4, -1]])).toBe(-1);
  });
});
