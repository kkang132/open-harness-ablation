import { describe, expect, it } from "vitest";
import { chunk } from "../../chunk.ts";

describe("chunk: empty input", () => {
  it("returns an empty array", () => {
    expect(chunk([], 3)).toEqual([]);
  });
});
