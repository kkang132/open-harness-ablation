// Aggregate raw trial records into per-arm summaries. Report pass-rate and cost,
// not raw tokens: tokenisers differ across vendors, so tokens do not compare.

import type { TrialRecord } from "../harness/runner.ts";

export interface ArmSummary {
  arm: string;
  modelKey: string;
  trials: number;
  errors: number;
  visiblePassRate: number; // fraction passing visible tests
  hiddenPassRate: number; // fraction passing hidden tests (the headline)
  meanCostUsd: number;
  meanRepairs: number;
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function aggregate(records: TrialRecord[]): ArmSummary[] {
  const byArm = new Map<string, TrialRecord[]>();
  for (const r of records) {
    const list = byArm.get(r.arm) ?? [];
    list.push(r);
    byArm.set(r.arm, list);
  }

  const summaries: ArmSummary[] = [];
  for (const [arm, list] of byArm) {
    summaries.push({
      arm,
      modelKey: list[0]!.modelKey,
      trials: list.length,
      errors: list.filter((r) => r.error).length,
      visiblePassRate: mean(list.map((r) => (r.visiblePass ? 1 : 0))),
      hiddenPassRate: mean(list.map((r) => (r.hiddenPass ? 1 : 0))),
      meanCostUsd: mean(list.map((r) => r.usage.costUsd)),
      meanRepairs: mean(list.map((r) => r.repairs)),
    });
  }
  return summaries;
}
