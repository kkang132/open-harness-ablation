// Fuller sweep. The cumulative ladder (every candidate rung) on the Mellum2 floor,
// over every task family in the repo, k=5. This is wider but looser than the
// headline: it includes extra tasks that were not floor-pre-screened, and it has
// no ceiling arm. For the trustworthy headline result use scripts/reproduce.ts.
//
// Run: npm run bench  (then npm run report to redraw the ladder)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cumulativeLadder } from "../src/harness/arm.ts";
import { runTrial, type TrialRecord } from "../src/harness/runner.ts";
import { aggregate } from "../src/report/aggregate.ts";
import { renderLadder } from "../src/report/ladder.ts";
import { loadTaskFamilies } from "../src/tasks/manifest.ts";

const K = 5;
const REPAIR_CAP = 3;

async function main(): Promise<void> {
  const resultsDir = join(process.cwd(), "results");
  const tasks = loadTaskFamilies(join(process.cwd(), "src", "tasks", "families"));
  if (tasks.length === 0) {
    console.error("No tasks found under src/tasks/families. Author tasks first (see AGENTS.md).");
    process.exit(1);
  }

  const arms = cumulativeLadder();
  const records: TrialRecord[] = [];

  for (const task of tasks) {
    for (const arm of arms) {
      for (let seed = 0; seed < K; seed++) {
        console.log(`[bench] ${task.id} | ${arm.name} | seed ${seed}`);
        records.push(await runTrial(task, arm, seed, { resultsDir, repairCap: REPAIR_CAP }));
      }
    }
  }

  const summaryDir = join(resultsDir, "summary");
  mkdirSync(summaryDir, { recursive: true });
  writeFileSync(join(summaryDir, "trials.json"), JSON.stringify(records, null, 2));

  const md = renderLadder(aggregate(records));
  writeFileSync(join(summaryDir, "ladder.md"), md);
  console.log(`\n${md}`);
  console.log(`Wrote ${records.length} trials to results/summary/trials.json`);
}

main();
