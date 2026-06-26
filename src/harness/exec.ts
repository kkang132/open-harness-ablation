// Run a shell command with a hard timeout. Captures stdout and stderr together.

import { spawn } from "node:child_process";

export interface ExecResult {
  code: number | null; // exit code, or null if killed
  output: string; // stdout and stderr interleaved
  timedOut: boolean;
}

export function runShell(cmd: string, cwd: string, timeoutSec: number): Promise<ExecResult> {
  return new Promise((resolve) => {
    const child = spawn(cmd, { cwd, shell: true });
    let output = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutSec * 1000);

    child.stdout.on("data", (d) => (output += d.toString()));
    child.stderr.on("data", (d) => (output += d.toString()));

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output, timedOut });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ code: null, output: `${output}\n[spawn error] ${err.message}`, timedOut });
    });
  });
}
