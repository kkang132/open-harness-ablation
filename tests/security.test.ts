// Security guards: command injection and sandbox-escape by file name.

import { describe, expect, it } from "vitest";
import { assertSafeCommand, assertSafeFilename } from "../src/security.ts";

describe("assertSafeCommand", () => {
  it("allows plain single commands", () => {
    expect(() => assertSafeCommand("compileCmd", "tsc --noEmit")).not.toThrow();
    expect(() => assertSafeCommand("visibleCmd", "vitest run tests/visible")).not.toThrow();
    expect(() => assertSafeCommand("hiddenCmd", "npm test")).not.toThrow();
  });

  it("rejects chaining and redirection operators", () => {
    expect(() => assertSafeCommand("c", "tsc; rm -rf /")).toThrow();
    expect(() => assertSafeCommand("c", "a && b")).toThrow();
    expect(() => assertSafeCommand("c", "a || b")).toThrow();
    expect(() => assertSafeCommand("c", "cat secrets > out")).toThrow();
    expect(() => assertSafeCommand("c", "echo $HOME")).toThrow();
  });

  it("rejects command substitution", () => {
    expect(() => assertSafeCommand("c", "echo $(whoami)")).toThrow();
    expect(() => assertSafeCommand("c", "echo `whoami`")).toThrow();
  });
});

describe("assertSafeFilename", () => {
  it("allows plain base names", () => {
    expect(() => assertSafeFilename("case01.test.ts")).not.toThrow();
    expect(() => assertSafeFilename("range.spec.ts")).not.toThrow();
  });

  it("rejects path separators and parent traversal", () => {
    expect(() => assertSafeFilename("../escape.ts")).toThrow();
    expect(() => assertSafeFilename("dir/file.ts")).toThrow();
    expect(() => assertSafeFilename("..")).toThrow();
    expect(() => assertSafeFilename("a\\b.ts")).toThrow();
  });
});
