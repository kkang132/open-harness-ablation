import { describe, expect, it } from "vitest";
import { chunk } from "../../chunk.ts";

describe("chunk: size larger than input", () => {
  it("returns a single chunk holding every element", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });
});
