import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: two robbers on a short grid", () => {
  it("neutralizes both costly cells", () => {
    expect(maximumAmount([[1, -5, 1], [1, -5, 1]])).toBe(3);
  });
});
