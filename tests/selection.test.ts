// Test selection must be deterministic: same seed picks the same tests every time,
// so every arm and seed of a task faces the same instrument.

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { selectTests } from "../src/tasks/selection.ts";

let poolDir: string;

beforeAll(() => {
  poolDir = mkdtempSync(join(tmpdir(), "pool-"));
  for (let i = 0; i < 10; i++) {
    writeFileSync(join(poolDir, `case${String(i).padStart(2, "0")}.test.ts`), "");
  }
});

describe("selectTests", () => {
  it("is deterministic for a fixed seed", () => {
    const a = selectTests(poolDir, 3, 1729);
    const b = selectTests(poolDir, 3, 1729);
    expect(a).toEqual(b);
  });

  it("picks different sets for different seeds", () => {
    const a = selectTests(poolDir, 3, 1);
    const b = selectTests(poolDir, 3, 2);
    expect(a).not.toEqual(b);
  });

  it("returns exactly n names from the pool", () => {
    const picked = selectTests(poolDir, 4, 42);
    expect(picked).toHaveLength(4);
    expect(new Set(picked).size).toBe(4);
  });

  it("throws when the pool is smaller than n", () => {
    expect(() => selectTests(poolDir, 99, 1)).toThrow();
  });
});
