import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 3", () => {
  it("case 3", () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toStrictEqual({ a: 1, b: 3, c: 4 });
  });
});
