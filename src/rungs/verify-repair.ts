// Rung: verify-repair. The highest-leverage mod: it puts the test oracle inside
// the loop. After the agent stops, gate on compile, then run the visible tests.
// On red, re-prompt the same session with the failure output and let it fix.
// Repeat to ctx.repairCap. Visible tests only; hidden tests never enter here.

import type { Rung } from "./types.ts";

export function verifyRepairRung(): Rung {
  return {
    name: "verify-repair",
    async wrapSample(ctx, runAgent) {
      await runAgent();

      for (let attempt = 0; attempt < ctx.repairCap; attempt++) {
        const compileErr = await ctx.compile();
        if (compileErr) {
          await ctx.repairPrompt(
            `The code does not compile:\n\n${compileErr}\n\nFix the code so it compiles. Do not edit the tests.`,
          );
          continue;
        }

        const testErr = await ctx.runVisibleTests();
        if (testErr === null) return; // green: stop early

        await ctx.repairPrompt(
          `The visible tests are failing:\n\n${testErr}\n\nFix the code so they pass. Do not edit or weaken the tests.`,
        );
      }
    },
  };
}
