// An arm is stock Pi plus an ordered list of rungs. The ablation ladder is a list
// of arms. Cumulative ladder adds one rung per step; leave-one-out drops one from
// the full set. Both are just arm lists, no special code.
//
// Reasoning is held constant across all arms (a model knob, not a structural mod),
// so it is not part of the default ladder. Add it deliberately when studying it.

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

// Bar A: the floor. Local 20b, stock Pi, no rungs.
export const FLOOR: Arm = { name: "A", label: "gpt-oss:20b stock Pi", modelKey: "local-20b", rungs: [] };

// Optional anchor below A: stock Pi with built-in tools disabled.
export const SUB_FLOOR: Arm = {
  name: "A0",
  label: "gpt-oss:20b, built-ins off",
  modelKey: "local-20b",
  rungs: [],
  noBuiltins: true,
};

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

// Leave-one-out: the full set, then one arm per rung with that rung removed.
export function leaveOneOut(): Arm[] {
  const full = CANDIDATE_RUNGS;
  const arms: Arm[] = [{ name: "B", label: "gpt-oss:20b + all rungs", modelKey: "local-20b", rungs: full.slice() }];
  full.forEach((rung) => {
    arms.push({
      name: `B-no-${rung.name}`,
      label: `all rungs except ${rung.name}`,
      modelKey: "local-20b",
      rungs: full.filter((r) => r !== rung),
    });
  });
  return arms;
}
