import { describe, expect, it } from "vitest";
import { slugify } from "../../slugify.ts";

describe("slugify case 2", () => {
  it("case 2", () => {
    expect(slugify("  ")).toStrictEqual("");
  });
});
