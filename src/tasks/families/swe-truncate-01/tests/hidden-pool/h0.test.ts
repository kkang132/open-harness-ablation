import { describe, expect, it } from "vitest";
import { truncate } from "../../truncate.ts";

describe("truncate case 0", () => {
  it("case 0", () => {
    expect(truncate("abcdef", 3)).toStrictEqual("...");
  });
});
