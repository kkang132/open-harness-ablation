import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 4", () => {
  it("case 4", () => {
    expect(deepMerge({ a: { keep: 1, over: 1 } }, { a: { over: 2 } })).toStrictEqual({ a: { keep: 1, over: 2 } });
  });
});
