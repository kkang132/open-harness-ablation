import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 2", () => {
  it("case 2", () => {
    expect(parseQueryString("?x=&y=1")).toStrictEqual({ x: "", y: "1" });
  });
});
