import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 0", () => {
  it("case 0", () => {
    expect(deepMerge({}, { a: 1 })).toStrictEqual({ a: 1 });
  });
});
