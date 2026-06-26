// Rung behaviour: best-of-N selection and cost summation, verify-repair looping.
// These exercise the rungs directly with fakes, no live agent or model.

import { describe, expect, it, vi } from "vitest";
import { bestOfNRung } from "../src/rungs/best-of-n.ts";
import type { SampleContext, SampleResult } from "../src/rungs/types.ts";
import { verifyRepairRung } from "../src/rungs/verify-repair.ts";

function sample(visiblePass: boolean, costUsd: number): SampleResult {
  return {
    visiblePass,
    usage: { inputTokens: 0, outputTokens: 0, costUsd },
    repairs: 0,
    transcriptPath: "",
    workdir: "/tmp/x",
  };
}

describe("best-of-N", () => {
  it("selects the sample passing visible tests and charges for every sample", async () => {
    const results = [sample(false, 0.5), sample(true, 0.7)];
    let i = 0;
    const sampleOnce = async () => results[i++]!;

    const out = await bestOfNRung(2).wrapRun!({ task: {} as never, seed: 0 }, sampleOnce);

    expect(out.visiblePass).toBe(true);
    expect(out.usage.costUsd).toBeCloseTo(1.2); // both samples charged
  });

  it("falls back to the last sample when none pass", async () => {
    const results = [sample(false, 0.1), sample(false, 0.2)];
    let i = 0;
    const out = await bestOfNRung(2).wrapRun!({ task: {} as never, seed: 0 }, async () => results[i++]!);
    expect(out.visiblePass).toBe(false);
    expect(out.usage.costUsd).toBeCloseTo(0.3);
  });
});

describe("verify-repair", () => {
  it("repairs until the visible tests pass, then stops", async () => {
    const runAgent = vi.fn(async () => {});
    const repairPrompt = vi.fn(async () => {});
    const visibleResults = ["fail one", "fail two", null]; // green on the third check
    let v = 0;

    const ctx: SampleContext = {
      task: {} as never,
      session: {} as never,
      compile: async () => null,
      runVisibleTests: async () => visibleResults[v++]!,
      repairPrompt,
      repairCap: 3,
    };

    await verifyRepairRung().wrapSample!(ctx, runAgent);

    expect(runAgent).toHaveBeenCalledOnce();
    expect(repairPrompt).toHaveBeenCalledTimes(2); // two reds, then green
  });

  it("respects the repair cap when tests never pass", async () => {
    const repairPrompt = vi.fn(async () => {});
    const ctx: SampleContext = {
      task: {} as never,
      session: {} as never,
      compile: async () => null,
      runVisibleTests: async () => "always failing",
      repairPrompt,
      repairCap: 3,
    };

    await verifyRepairRung().wrapSample!(ctx, async () => {});

    expect(repairPrompt).toHaveBeenCalledTimes(3);
  });
});
