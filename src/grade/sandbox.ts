// Sandbox isolation. The agent edits its own workdir copy. Tests run in throwaway
// copies of that workdir with pristine pool tests dropped in. The agent never sees
// the test files, so it cannot fake green by editing a test.

import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { runShell } from "../harness/exec.ts";
import { assertSafeFilename } from "../security.ts";

// Copy a task's seed workdir into a fresh per-trial directory the agent will edit.
export function prepareWorkdir(taskWorkdir: string, trialDir: string): string {
  const agentWorkdir = join(trialDir, "workdir");
  rmSync(agentWorkdir, { recursive: true, force: true });
  mkdirSync(agentWorkdir, { recursive: true });
  cpSync(taskWorkdir, agentWorkdir, { recursive: true });
  return agentWorkdir;
}

export interface TestRunOptions {
  agentWorkdir: string; // the agent's current code
  poolDir: string; // visible-pool or hidden-pool
  selected: string[]; // file names popped from the pool
  placeUnder: string; // where the cmd expects them, e.g. "tests/visible"
  cmd: string; // visibleCmd or hiddenCmd
  timeoutSec: number;
  sandboxDir: string; // throwaway dir for this test run
}

export interface TestRunResult {
  ok: boolean; // true when the suite passed
  output: string; // combined stdout/stderr, used as repair feedback when red
}

// Build a pristine sandbox = agent code + selected tests, then run the suite.
export async function runTestsAgainst(opts: TestRunOptions): Promise<TestRunResult> {
  rmSync(opts.sandboxDir, { recursive: true, force: true });
  mkdirSync(opts.sandboxDir, { recursive: true });
  cpSync(opts.agentWorkdir, opts.sandboxDir, { recursive: true });

  const testDir = join(opts.sandboxDir, opts.placeUnder);
  mkdirSync(testDir, { recursive: true });
  for (const file of opts.selected) {
    assertSafeFilename(file); // defence in depth: no escaping the sandbox by name
    cpSync(join(opts.poolDir, file), join(testDir, file));
  }

  const res = await runShell(opts.cmd, opts.sandboxDir, opts.timeoutSec);
  return { ok: res.code === 0 && !res.timedOut, output: res.output };
}
