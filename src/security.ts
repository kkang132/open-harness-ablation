// Trust-boundary guards.
//
// Task content (task.json, the test pools) is author-supplied and may be written
// by an offline agent. Two surfaces in this repo turn that content into action:
//
//   1. exec.ts runs the task's command strings through a shell.
//   2. sandbox.ts copies pool files by name into a throwaway directory.
//
// A hostile task could inject shell commands or escape the sandbox with a "../"
// file name. These guards close both. Tasks remain trusted author content; the
// guards are defence in depth, not a licence to run arbitrary task definitions.

// Shell metacharacters that let one command string become several, or read the
// environment. Each task command must be a single plain command. Compose steps
// using the separate compileCmd / visibleCmd / hiddenCmd fields instead.
const DANGEROUS_SHELL = /[;&|`$<>\n]|\$\(/;

export function assertSafeCommand(label: string, cmd: string): void {
  if (DANGEROUS_SHELL.test(cmd)) {
    throw new Error(
      `Unsafe ${label}: ${JSON.stringify(cmd)}. ` +
        `Command strings may not contain shell operators (; & | \` $ < >). ` +
        `Use one plain command per field.`,
    );
  }
}

// A pool file name must be a plain base name: no directory separators, no "..".
// Otherwise a copy-by-name could write outside the sandbox.
export function assertSafeFilename(name: string): void {
  if (name.includes("/") || name.includes("\\") || name === ".." || name.includes("..")) {
    throw new Error(`Unsafe test file name: ${JSON.stringify(name)}. Pool files must be plain base names.`);
  }
}
