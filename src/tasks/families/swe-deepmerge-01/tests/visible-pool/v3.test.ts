import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 3", () => {
  it("case 3", () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toStrictEqual({ a: [3] });
  });
});
