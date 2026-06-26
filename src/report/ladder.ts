// Render the ablation ladder from a trials file. Emits a markdown table with a
// unicode bar per arm. Run: npm run report.
//
// Reads results/summary/trials.json (an array of TrialRecord), writes
// results/summary/ladder.md, and prints the table.

import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TrialRecord } from "../harness/runner.ts";
import { type ArmSummary, aggregate } from "./aggregate.ts";

function bar(fraction: number, width = 24): string {
  const filled = Math.round(fraction * width);
  return "█".repeat(filled) + "·".repeat(width - filled);
}

function pct(x: number): string {
  return `${(x * 100).toFixed(0)}%`;
}

export function renderLadder(summaries: ArmSummary[]): string {
  const lines: string[] = [];
  lines.push("# Ablation ladder");
  lines.push("");
  lines.push("Hidden-test pass rate per arm. Cost is mean USD per trial.");
  lines.push("");
  lines.push("| Arm | Model | Pass (hidden) | | Cost | Repairs | Trials |");
  lines.push("|-----|-------|---------------|--|------|---------|--------|");
  for (const s of summaries) {
    lines.push(
      `| ${s.arm} | ${s.modelKey} | ${pct(s.hiddenPassRate)} | \`${bar(s.hiddenPassRate)}\` | $${s.meanCostUsd.toFixed(4)} | ${s.meanRepairs.toFixed(1)} | ${s.trials}${s.errors ? ` (${s.errors} err)` : ""} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function main(): void {
  const summaryDir = join(process.cwd(), "results", "summary");
  const trialsPath = join(summaryDir, "trials.json");
  let records: TrialRecord[];
  try {
    records = JSON.parse(readFileSync(trialsPath, "utf8"));
  } catch {
    console.error(`No trials at ${trialsPath}. Run npm run bench first.`);
    process.exit(1);
  }

  const summaries = aggregate(records);
  const md = renderLadder(summaries);
  mkdirSync(summaryDir, { recursive: true });
  writeFileSync(join(summaryDir, "ladder.md"), md);
  console.log(md);
}

// Run only when this file is the entry point, not when imported by bench.ts.
function isEntryPoint(): boolean {
  try {
    return realpathSync(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntryPoint()) main();
