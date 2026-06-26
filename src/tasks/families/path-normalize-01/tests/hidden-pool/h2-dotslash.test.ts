import { describe, expect, it } from "vitest";
import { normalizePath } from "../../normalize.ts";

describe("normalizePath: dot then trailing slash", () => {
  it("returns . for ./", () => {
    expect(normalizePath("./")).toBe(".");
  });
});
