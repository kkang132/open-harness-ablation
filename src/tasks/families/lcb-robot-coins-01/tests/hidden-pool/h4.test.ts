import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: 4x4 mixed grid", () => {
  it("balances early robbers against later gains", () => {
    expect(maximumAmount([[-6, -15, -16, -8], [-10, 11, 6, 16], [1, 2, 18, 12], [15, 19, 4, 17]])).toBe(64);
  });
});
