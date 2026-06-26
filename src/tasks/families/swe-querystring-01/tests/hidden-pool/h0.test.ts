import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 0", () => {
  it("case 0", () => {
    expect(parseQueryString("a=%26&b=c")).toStrictEqual({ a: "&", b: "c" });
  });
});
