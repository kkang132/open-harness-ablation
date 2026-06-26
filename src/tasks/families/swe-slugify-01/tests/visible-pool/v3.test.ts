import { describe, expect, it } from "vitest";
import { slugify } from "../../slugify.ts";

describe("slugify case 3", () => {
  it("case 3", () => {
    expect(slugify("Already-Slug")).toStrictEqual("already-slug");
  });
});
