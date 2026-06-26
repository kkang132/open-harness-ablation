import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 1", () => {
  it("case 1", () => {
    expect(parseQueryString("k=a&k=b&k=c")).toStrictEqual({ k: ["a", "b", "c"] });
  });
});
