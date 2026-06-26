import { describe, expect, it } from "vitest";
import { parseQueryString } from "../../querystring.ts";

describe("parseQueryString case 3", () => {
  it("case 3", () => {
    expect(parseQueryString("name=John+Doe")).toStrictEqual({ name: "John Doe" });
  });
});
