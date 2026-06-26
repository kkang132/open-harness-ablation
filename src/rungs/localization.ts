// Rung: localization. Enable grep/find/ls and nudge the model to locate before
// editing. Only moves the needle on multi-file tasks; near-free on single-file ones.

import type { Rung } from "./types.ts";

export function localizationRung(): Rung {
  return {
    name: "localization",
    apply(build) {
      build.enableTools.add("grep");
      build.enableTools.add("find");
      build.enableTools.add("ls");
      build.systemPromptAppend.push(
        "Before editing, locate the relevant code with grep and find. Read it, then make the smallest change that satisfies the spec.",
      );
    },
  };
}
