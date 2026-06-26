// Rung: reasoning. A model knob, not a structural mod. Hold it constant when
// measuring the structural rungs, so their effect is not confounded by thinking.

import type { Rung } from "./types.ts";

export function reasoningRung(level: "low" | "medium" | "high" = "high"): Rung {
  return {
    name: `reasoning:${level}`,
    apply(build) {
      build.thinkingLevel = level;
    },
  };
}
