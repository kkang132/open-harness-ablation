import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 4", () => {
  it("case 4", () => {
    expect(deepMerge({ a: { x: 1 } }, { a: 5 })).toStrictEqual({ a: 5 });
  });
});
