import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 2", () => {
  it("case 2", () => {
    expect(deepMerge({ a: 5 }, { a: { x: 1 } })).toStrictEqual({ a: { x: 1 } });
  });
});
