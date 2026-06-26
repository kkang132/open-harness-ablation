import { describe, expect, it } from "vitest";
import { normalizePath } from "../../normalize.ts";

describe("normalizePath: leading parent in a relative path", () => {
  it("preserves an unresolved leading ..", () => {
    expect(normalizePath("../a")).toBe("../a");
  });
});
