// Proof of the task invariants, with no model in the loop. For every task:
//   1. it loads (the manifest is valid; pools exist, are disjoint, and large enough)
//   2. its committed stub FAILS its own visible tests
// (2) means the task is genuinely unsolved. It is the check that catches a seed
// that has been accidentally completed (the failure mode that once corrupted a run).
//
// Run: npm run verify:tasks   (exits non-zero if any invariant is broken)

import { rmSync } from "node:fs";
import { join } from "node:path";
import { runVisible } from "../src/grade/grader.ts";
import { loadTaskFamilies } from "../src/tasks/manifest.ts";

const root = process.cwd();
const sandboxRoot = join(root, "results", "verify");

// loadTaskFamilies throws on the first malformed task (invariant 1).
const tasks = loadTaskFamilies(join(root, "src", "tasks", "families"));
if (tasks.length === 0) {
  console.error("no tasks found under src/tasks/families");
  process.exit(1);
}

let broken = 0;
for (const task of tasks) {
  const stubFailsVisible = (await runVisible(task, task.workdir, join(sandboxRoot, task.id))) !== null;
  if (stubFailsVisible) {
    console.log(`ok    ${task.id}`);
  } else {
    broken += 1;
    console.log(`BROKEN ${task.id}: the stub passes its own visible tests (task is solved or trivial)`);
  }
}

rmSync(sandboxRoot, { recursive: true, force: true });

if (broken > 0) {
  console.error(`\n${broken} task(s) broke the invariant.`);
  process.exit(1);
}
console.log(`\nall ${tasks.length} tasks valid; every stub fails its visible tests.`);
