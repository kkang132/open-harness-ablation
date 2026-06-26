// Rung: best-of-N. Take N independent samples, select the one passing the visible
// tests. Capped at N=2 by default. Cost is the sum of all samples: we paid for
// every one, and honest cost reporting must reflect that.
//
// Samples run sequentially, not in parallel, to avoid swamping a local Ollama.

import { addUsage, emptyUsage, type Rung, type SampleResult } from "./types.ts";

export function bestOfNRung(n = 2): Rung {
  return {
    name: `best-of-${n}`,
    async wrapRun(_ctx, sampleOnce) {
      const samples: SampleResult[] = [];
      for (let i = 0; i < n; i++) {
        samples.push(await sampleOnce());
      }

      const totalUsage = samples.reduce((acc, s) => addUsage(acc, s.usage), emptyUsage());
      const winner = samples.find((s) => s.visiblePass) ?? samples[samples.length - 1]!;

      // Report the winner's outcome, but charge for every sample taken.
      return { ...winner, usage: totalUsage };
    },
  };
}
