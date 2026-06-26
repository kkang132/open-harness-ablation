import { describe, expect, it } from "vitest";
import { normalizePath } from "../../normalize.ts";

describe("normalizePath: resolves to nothing", () => {
  it("returns . when a relative path cancels out", () => {
    expect(normalizePath("a/..")).toBe(".");
  });
});
