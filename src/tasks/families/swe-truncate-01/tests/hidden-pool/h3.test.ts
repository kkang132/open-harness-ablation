import { describe, expect, it } from "vitest";
import { truncate } from "../../truncate.ts";

describe("truncate case 3", () => {
  it("case 3", () => {
    expect(truncate("", 5)).toStrictEqual("");
  });
});
