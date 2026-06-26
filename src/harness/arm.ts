// An arm is a model plus an ordered list of rungs. The ablation ladder is a list
// of arms; the cumulative ladder adds one rung per step.
//
// Reasoning is a model knob rather than a structural rung, so it is not in the
// candidate set; add it to an arm deliberately when studying it.

import { bestOfNRung } from "../rungs/best-of-n.ts";
import { fewShotRung } from "../rungs/few-shot.ts";
import { localizationRung } from "../rungs/localization.ts";
import type { Rung } from "../rungs/types.ts";
import { verifyRepairRung } from "../rungs/verify-repair.ts";
import type { ModelKey } from "./provider.ts";

export interface Arm {
  name: string; // "A", "B2", ...
  label: string; // human label for charts
  modelKey: ModelKey;
  rungs: Rung[];
  noBuiltins?: boolean; // below-floor anchor: disable Pi's built-in tools
  // Optional explicit local model id, overriding modelKey resolution.
  // Used for the tier ladder, where different local models are the floor.
  modelId?: string;
  // Optional base URL for the local model (e.g. a llama.cpp server on :8080).
  // Defaults to OLLAMA_BASE_URL when omitted.
  baseUrl?: string;
}

// Candidate rungs in oracle-leverage order. The pilot screens these one at a time.
export const CANDIDATE_RUNGS: Rung[] = [verifyRepairRung(), bestOfNRung(2), localizationRung(), fewShotRung()];

// Bar A: the floor. Local model, stock harness, no rungs.
export const FLOOR: Arm = { name: "A", label: "gpt-oss:20b stock Pi", modelKey: "local-20b", rungs: [] };

// The cumulative ladder: A, then +each candidate rung in order, ending at hero B.
export function cumulativeLadder(): Arm[] {
  const arms: Arm[] = [FLOOR];
  const acc: Rung[] = [];
  CANDIDATE_RUNGS.forEach((rung, i) => {
    acc.push(rung);
    const isHero = i === CANDIDATE_RUNGS.length - 1;
    arms.push({
      name: isHero ? "B" : `B${i + 1}`,
      label: isHero ? `gpt-oss:20b + all rungs` : `gpt-oss:20b + ${acc.map((r) => r.name).join(" + ")}`,
      modelKey: "local-20b",
      rungs: acc.slice(),
    });
  });
  return arms;
}
