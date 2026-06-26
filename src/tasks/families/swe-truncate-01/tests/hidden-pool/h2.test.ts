import { describe, expect, it } from "vitest";
import { truncate } from "../../truncate.ts";

describe("truncate case 2", () => {
  it("case 2", () => {
    expect(truncate("abcdefgh", 6, "..")).toStrictEqual("abcd..");
  });
});
