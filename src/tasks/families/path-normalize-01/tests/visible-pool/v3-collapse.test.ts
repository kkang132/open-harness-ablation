import { describe, expect, it } from "vitest";
import { normalizePath } from "../../normalize.ts";

describe("normalizePath: multiple parents cancel a relative path", () => {
  it("returns . when all segments are removed", () => {
    expect(normalizePath("a/b/../..")).toBe(".");
  });
});
