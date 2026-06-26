import { describe, expect, it } from "vitest";
import { chunk } from "../../chunk.ts";

describe("chunk: exact multiple", () => {
  it("splits into equal chunks with no remainder", () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });
});
