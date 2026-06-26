import { describe, expect, it } from "vitest";
import { normalizePath } from "../../normalize.ts";

describe("normalizePath: parents past the start of a relative path", () => {
  it("preserves the surplus .. that cannot be resolved", () => {
    expect(normalizePath("foo/bar/../../../x")).toBe("../x");
  });
});
