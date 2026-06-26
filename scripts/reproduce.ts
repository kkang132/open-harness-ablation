// Reproduce the headline result in FINDINGS.md: a small local model (Mellum2-12B)
// climbs toward the next tier (gpt-oss:20b) as harness rungs are added, on
// real-world SWE tasks. All local, no API cost.
//
// Prerequisites (see README):
//   1. Ollama serving the ceiling model:  ollama pull gpt-oss:20b
//   2. A llama.cpp server for the floor model on :8080, e.g.
//      llama-server -m Mellum2-12B-A2.5B-Instruct-Q5_K_M.gguf --port 8080 \
//        --ctx-size 32768 --n-gpu-layers 99 --jinja
//
// Run: npx tsx scripts/reproduce.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Arm, FLOOR_MODEL } from "../src/harness/arm.ts";
import { runTrial, type TrialRecord } from "../src/harness/runner.ts";
import { aggregate } from "../src/report/aggregate.ts";
import { renderLadder } from "../src/report/ladder.ts";
import { bestOfNRung } from "../src/rungs/best-of-n.ts";
import { verifyRepairRung } from "../src/rungs/verify-repair.ts";
import { loadTask } from "../src/tasks/manifest.ts";

const K = 5;
const REPAIR_CAP = 3;

// Floor model: a small local model served by llama.cpp (FLOOR_MODEL, shared with
// arm.ts). Ceiling: a larger local model via Ollama, resolved from modelKey.
// Tasks where the floor fails at baseline but the failures are fixable (chosen by a
// floor pre-screen; see FINDINGS.md).
const TASK_IDS = ["swe-envfile-01", "swe-slugify-01", "swe-querystring-01"];

async function main(): Promise<void> {
  const resultsDir = join(process.cwd(), "results");
  const arms: Arm[] = [
    { name: "floor", label: "Mellum2 floor", modelKey: "local-20b", rungs: [], ...FLOOR_MODEL },
    {
      name: "+verify-repair",
      label: "+ verify-repair",
      modelKey: "local-20b",
      rungs: [verifyRepairRung()],
      ...FLOOR_MODEL,
    },
    {
      name: "+verify-repair+best-of-N",
      label: "+ verify-repair + best-of-N",
      modelKey: "local-20b",
      rungs: [verifyRepairRung(), bestOfNRung(2)],
      ...FLOOR_MODEL,
    },
    { name: "ceiling", label: "gpt-oss:20b ceiling", modelKey: "local-20b", rungs: [] },
  ];

  const records: TrialRecord[] = [];
  for (const arm of arms) {
    for (const id of TASK_IDS) {
      const task = loadTask(join(process.cwd(), "src", "tasks", "families", id));
      for (let seed = 0; seed < K; seed++) {
        console.log(`[reproduce] ${arm.name} | ${id} | seed ${seed}`);
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
}

main();
