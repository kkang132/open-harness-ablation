import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: single negative cell", () => {
  it("neutralizes the only cell to reach zero", () => {
    expect(maximumAmount([[-4]])).toBe(0);
  });
});
