// Rung: few-shot. Prepend a short worked example and a fixed work order. Cheap,
// modest gain. Family-agnostic so it does not leak any specific task's answer.

import type { Rung } from "./types.ts";

const DEFAULT_GUIDANCE = [
  "Work in this order on every task:",
  "1. Read the failing code and the task spec.",
  "2. Form the smallest change that satisfies the spec.",
  "3. Apply it with the edit tool, matching surrounding style.",
  "4. Re-read your change before stopping.",
  "",
  "Worked example. Spec: parseRange('2-5') should return [2,3,4,5].",
  "A naive loop that starts at 0 is wrong; start at the lower bound and include the upper.",
  "Fix the bounds, do not rewrite the function.",
].join("\n");

export function fewShotRung(guidance: string = DEFAULT_GUIDANCE): Rung {
  return {
    name: "few-shot",
    apply(build) {
      build.systemPromptAppend.push(guidance);
    },
  };
}
