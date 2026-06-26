import { describe, expect, it } from "vitest";
import { deepMerge } from "../../deepmerge.ts";

describe("deepMerge case 2", () => {
  it("case 2", () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toStrictEqual({ a: 2 });
  });
});
