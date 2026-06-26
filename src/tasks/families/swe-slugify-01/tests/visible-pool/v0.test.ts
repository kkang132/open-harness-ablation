import { describe, expect, it } from "vitest";
import { slugify } from "../../slugify.ts";

describe("slugify case 0", () => {
  it("case 0", () => {
    expect(slugify("Hello World")).toStrictEqual("hello-world");
  });
});
