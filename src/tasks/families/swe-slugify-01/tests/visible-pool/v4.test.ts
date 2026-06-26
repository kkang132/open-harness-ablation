import { describe, expect, it } from "vitest";
import { slugify } from "../../slugify.ts";

describe("slugify case 4", () => {
  it("case 4", () => {
    expect(slugify("snake_case_name")).toStrictEqual("snake-case-name");
  });
});
