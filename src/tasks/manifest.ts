// Task manifest: the type, plus a loader that validates and fails loud.
//
// A task is one directory under families/<family>-<nn>/ holding task.json,
// prompt.md, workdir/, and tests/{visible-pool,hidden-pool}/.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { assertSafeCommand, assertSafeFilename } from "../security.ts";

// Raw shape of task.json on disk.
interface TaskManifest {
  id: string;
  family: string;
  prompt: string; // file name relative to the task dir, e.g. "prompt.md"
  cwd: string; // workdir, relative to the task dir
  compileCmd: string; // pre-gate, e.g. "tsc --noEmit"
  visibleCmd: string; // repair loop runs this; sees visible tests only
  hiddenCmd: string; // grader runs this; never exposed to the agent
  nVisible: number; // how many visible-pool tests to pop
  nHidden: number; // how many hidden-pool tests to pop
  selectionSeed: number; // pins which tests pop, identically across arms and seeds
  timeoutSec: number;
  difficulty: string; // band label, e.g. "band-2"
}

// Resolved task: absolute paths and loaded prompt text.
export interface Task extends TaskManifest {
  dir: string; // absolute task dir
  promptText: string; // contents of the prompt file
  workdir: string; // absolute path to seed files
  visiblePoolDir: string; // absolute
  hiddenPoolDir: string; // absolute
}

const REQUIRED_STRINGS = [
  "id",
  "family",
  "prompt",
  "cwd",
  "compileCmd",
  "visibleCmd",
  "hiddenCmd",
  "difficulty",
] as const;
const REQUIRED_NUMBERS = ["nVisible", "nHidden", "selectionSeed", "timeoutSec"] as const;

function fail(taskDir: string, msg: string): never {
  throw new Error(`Invalid task at ${taskDir}: ${msg}`);
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// Load and validate one task directory. Throws on any problem.
export function loadTask(taskDir: string): Task {
  if (!isAbsolute(taskDir)) fail(taskDir, "task dir must be an absolute path");
  if (!isDir(taskDir)) fail(taskDir, "task dir does not exist");

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(taskDir, "task.json"), "utf8"));
  } catch (e) {
    fail(taskDir, `cannot read task.json: ${(e as Error).message}`);
  }
  const m = raw as Record<string, unknown>;

  for (const key of REQUIRED_STRINGS) {
    if (typeof m[key] !== "string" || (m[key] as string).length === 0) {
      fail(taskDir, `field "${key}" must be a non-empty string`);
    }
  }
  for (const key of REQUIRED_NUMBERS) {
    if (typeof m[key] !== "number" || !Number.isFinite(m[key])) {
      fail(taskDir, `field "${key}" must be a finite number`);
    }
  }

  const manifest = m as unknown as TaskManifest;
  if (manifest.nVisible < 1) fail(taskDir, "nVisible must be at least 1");
  if (manifest.nHidden < 1) fail(taskDir, "nHidden must be at least 1");

  // Trust-boundary guard: command strings must be single plain commands.
  assertSafeCommand("compileCmd", manifest.compileCmd);
  assertSafeCommand("visibleCmd", manifest.visibleCmd);
  assertSafeCommand("hiddenCmd", manifest.hiddenCmd);

  const workdir = join(taskDir, manifest.cwd);
  const visiblePoolDir = join(taskDir, "tests", "visible-pool");
  const hiddenPoolDir = join(taskDir, "tests", "hidden-pool");

  if (!isDir(workdir)) fail(taskDir, `workdir "${manifest.cwd}" does not exist`);
  if (!isDir(visiblePoolDir)) fail(taskDir, "tests/visible-pool/ does not exist");
  if (!isDir(hiddenPoolDir)) fail(taskDir, "tests/hidden-pool/ does not exist");

  // Pools must be disjoint: no shared file names. Hidden are held-out cases, not copies.
  const visiblePool = readdirSync(visiblePoolDir);
  const hiddenPool = readdirSync(hiddenPoolDir);
  for (const f of [...visiblePool, ...hiddenPool]) assertSafeFilename(f);
  const visibleFiles = new Set(visiblePool);
  const overlap = hiddenPool.filter((f) => visibleFiles.has(f));
  if (overlap.length > 0) {
    fail(taskDir, `visible and hidden pools share file names: ${overlap.join(", ")}`);
  }
  if (visibleFiles.size < manifest.nVisible) {
    fail(taskDir, `visible pool has ${visibleFiles.size} tests, need nVisible=${manifest.nVisible}`);
  }
  if (hiddenPool.length < manifest.nHidden) {
    fail(taskDir, `hidden pool has fewer tests than nHidden=${manifest.nHidden}`);
  }

  let promptText: string;
  try {
    promptText = readFileSync(join(taskDir, manifest.prompt), "utf8");
  } catch (e) {
    fail(taskDir, `cannot read prompt file "${manifest.prompt}": ${(e as Error).message}`);
  }

  return {
    ...manifest,
    dir: taskDir,
    promptText,
    workdir,
    visiblePoolDir,
    hiddenPoolDir,
  };
}

// Load every task directory under a families root.
export function loadTaskFamilies(familiesRoot: string): Task[] {
  if (!isDir(familiesRoot)) return [];
  return readdirSync(familiesRoot)
    .map((name) => join(familiesRoot, name))
    .filter(isDir)
    .map(loadTask);
}
