// Grading. Runs the hidden tests on a pristine copy of the agent's final code.
// This is the only place hidden tests run. No rung and no agent reaches it.

import { join } from "node:path";
import type { Task } from "../tasks/manifest.ts";
import { selectTests } from "../tasks/selection.ts";
import { runTestsAgainst } from "./sandbox.ts";

// Convention: hidden tests are placed under tests/hidden, matching hiddenCmd.
const HIDDEN_PLACE_UNDER = "tests/hidden";
// Convention: visible tests under tests/visible, matching visibleCmd.
const VISIBLE_PLACE_UNDER = "tests/visible";

// True when the agent's code passes the held-out hidden suite.
export async function gradeHidden(task: Task, agentWorkdir: string, sandboxDir: string): Promise<boolean> {
  const selected = selectTests(task.hiddenPoolDir, task.nHidden, task.selectionSeed);
  const res = await runTestsAgainst({
    agentWorkdir,
    poolDir: task.hiddenPoolDir,
    selected,
    placeUnder: HIDDEN_PLACE_UNDER,
    cmd: task.hiddenCmd,
    timeoutSec: task.timeoutSec,
    sandboxDir: join(sandboxDir, "grade"),
  });
  return res.ok;
}

// Run the visible suite. Returns failure output when red, null when green.
// Used by the verify-repair rung. Sees visible tests only.
export async function runVisible(task: Task, agentWorkdir: string, sandboxDir: string): Promise<string | null> {
  const selected = selectTests(task.visiblePoolDir, task.nVisible, task.selectionSeed);
  const res = await runTestsAgainst({
    agentWorkdir,
    poolDir: task.visiblePoolDir,
    selected,
    placeUnder: VISIBLE_PLACE_UNDER,
    cmd: task.visibleCmd,
    timeoutSec: task.timeoutSec,
    sandboxDir: join(sandboxDir, "visible"),
  });
  return res.ok ? null : res.output;
}
