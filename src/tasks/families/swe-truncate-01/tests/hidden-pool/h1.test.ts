import { describe, expect, it } from "vitest";
import { truncate } from "../../truncate.ts";

describe("truncate case 1", () => {
  it("case 1", () => {
    expect(truncate("abcdef", 1)).toStrictEqual(".");
  });
});
