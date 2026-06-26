import { describe, expect, it } from "vitest";
import { chunk } from "../../chunk.ts";

describe("chunk: uneven split", () => {
  it("leaves a shorter final chunk when the length is not a multiple of size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
