import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 4", () => {
  it("case 4", () => {
    expect(parseQueryString("")).toStrictEqual({});
  });
});
