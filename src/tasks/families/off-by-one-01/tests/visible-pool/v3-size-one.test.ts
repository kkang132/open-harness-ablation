import { describe, expect, it } from "vitest";
import { chunk } from "../../chunk.ts";

describe("chunk: size one", () => {
  it("wraps each element in its own chunk", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});
