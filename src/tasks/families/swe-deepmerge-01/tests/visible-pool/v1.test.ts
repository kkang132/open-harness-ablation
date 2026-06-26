import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 1", () => {
  it("case 1", () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 } })).toStrictEqual({ a: { x: 1, y: 2 } });
  });
});
