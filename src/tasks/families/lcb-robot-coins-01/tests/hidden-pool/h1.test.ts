import { describe, expect, it } from "vitest";
import { maximumAmount } from "../../solution.ts";

describe("maximumAmount: all negative, two neutralizations", () => {
  it("leaves a single robbery on the shortest path", () => {
    expect(maximumAmount([[-1, -1], [-1, -1]])).toBe(-1);
  });
});
