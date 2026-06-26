import { describe, expect, it } from "vitest";
import { chunk } from "../../chunk.ts";

describe("chunk: even split", () => {
  it("splits an array into equal chunks", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});
