import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 1", () => {
  it("case 1", () => {
    expect(deepMerge({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } })).toStrictEqual({ a: { b: { c: 1, d: 2 } } });
  });
});
