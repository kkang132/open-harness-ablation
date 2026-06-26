import { describe, expect, it } from "vitest";
import { truncate } from "../../truncate.ts";

describe("truncate case 4", () => {
  it("case 4", () => {
    expect(truncate("exact", 5, "...")).toStrictEqual("exact");
  });
});
