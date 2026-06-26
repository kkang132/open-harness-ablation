import { describe, expect, it } from "vitest";
import { normalizePath } from "../../normalize.ts";

describe("normalizePath: surplus parents leave a bare ..", () => {
  it("returns .. when one unresolved parent remains", () => {
    expect(normalizePath("x/y/../../..")).toBe("..");
  });
});
