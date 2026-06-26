import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 1", () => {
  it("case 1", () => {
    expect(parseQueryString("?x=hello+world")).toStrictEqual({ x: "hello world" });
  });
});
