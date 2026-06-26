// Pilot screen. Rank each candidate rung's expected value before investing in the
// full suite. Floor vs floor+one-rung, on the headline tasks, k=3. Same floor as
// the headline (Mellum2, served on :8080).
//
// Run: npm run pilot

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Arm, CANDIDATE_RUNGS, FLOOR, FLOOR_MODEL } from "../src/harness/arm.ts";
import { runTrial, type TrialRecord } from "../src/harness/runner.ts";
import { aggregate } from "../src/report/aggregate.ts";
import { loadTask } from "../src/tasks/manifest.ts";

const K = 3;
const REPAIR_CAP = 3;

// The headline tasks: the floor fails them at baseline but the failures are fixable.
const TASK_IDS = ["swe-envfile-01", "swe-slugify-01", "swe-querystring-01"];

async function main(): Promise<void> {
  const resultsDir = join(process.cwd(), "results");
  const tasks = TASK_IDS.map((id) => loadTask(join(process.cwd(), "src", "tasks", "families", id)));

  // Floor, plus one arm per candidate rung (floor + that rung alone).
  const arms: Arm[] = [
    FLOOR,
    ...CANDIDATE_RUNGS.map((rung) => ({
      name: `A+${rung.name}`,
      label: `floor + ${rung.name}`,
      modelKey: "local-20b" as const,
      rungs: [rung],
      ...FLOOR_MODEL,
    })),
  ];

  const records: TrialRecord[] = [];
  for (const task of tasks) {
    for (const arm of arms) {
      for (let seed = 0; seed < K; seed++) {
        console.log(`[pilot] ${task.id} | ${arm.name} | seed ${seed}`);
        records.push(await runTrial(task, arm, seed, { resultsDir, repairCap: REPAIR_CAP }));
      }
    }
  }

  const summaries = aggregate(records);
  const floor = summaries.find((s) => s.arm === FLOOR.name);
  const floorRate = floor?.hiddenPassRate ?? 0;

  console.log("\n=== Pilot EV ranking (hidden pass-rate lift over floor) ===");
  const ranked = summaries
    .filter((s) => s.arm !== FLOOR.name)
    .map((s) => ({ arm: s.arm, lift: s.hiddenPassRate - floorRate, cost: s.meanCostUsd }))
    .sort((a, b) => b.lift - a.lift);
  for (const s of ranked) {
    console.log(`${s.arm.padEnd(28)} lift ${(s.lift * 100).toFixed(0).padStart(4)}%   cost $${s.cost.toFixed(4)}`);
  }

  const summaryDir = join(resultsDir, "summary");
  mkdirSync(summaryDir, { recursive: true });
  writeFileSync(join(summaryDir, "pilot.json"), JSON.stringify(records, null, 2));
  console.log(`\nWrote ${records.length} trials to results/summary/pilot.json`);
}

main();
