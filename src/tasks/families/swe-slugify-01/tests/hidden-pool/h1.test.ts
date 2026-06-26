import { describe, expect, it } from "vitest";
import { slugify } from "../../slugify.ts";

describe("slugify case 1", () => {
  it("case 1", () => {
    expect(slugify("C++ Tutorial")).toStrictEqual("c-tutorial");
  });
});
