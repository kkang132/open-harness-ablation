import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 2", () => {
  it("case 2", () => {
    expect(parseQueryString("a=1&a=2")).toStrictEqual({ a: ["1", "2"] });
  });
});
