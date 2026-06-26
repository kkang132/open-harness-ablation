// Aggregation math: pass-rate and mean cost per arm.

import { describe, expect, it } from "vitest";
import type { TrialRecord } from "../src/harness/runner.ts";
import { aggregate } from "../src/report/aggregate.ts";

function record(arm: string, hiddenPass: boolean, costUsd: number): TrialRecord {
  return {
    taskId: "t1",
    family: "f",
    arm,
    modelKey: "local-20b",
    seed: 0,
    visiblePass: hiddenPass,
    hiddenPass,
    usage: { inputTokens: 0, outputTokens: 0, costUsd },
    repairs: 0,
    transcriptPath: "",
  };
}

describe("aggregate", () => {
  it("computes hidden pass-rate and mean cost per arm", () => {
    const records: TrialRecord[] = [
      record("A", true, 0.1),
      record("A", false, 0.3),
      record("B", true, 1.0),
      record("B", true, 2.0),
    ];
    const summaries = aggregate(records);
    const a = summaries.find((s) => s.arm === "A")!;
    const b = summaries.find((s) => s.arm === "B")!;

    expect(a.hiddenPassRate).toBeCloseTo(0.5);
    expect(a.meanCostUsd).toBeCloseTo(0.2);
    expect(b.hiddenPassRate).toBeCloseTo(1.0);
    expect(b.meanCostUsd).toBeCloseTo(1.5);
    expect(b.trials).toBe(2);
  });
});
