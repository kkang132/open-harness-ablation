// Deterministic test selection. Pops N pool files pinned by a seed.
//
// Selection is per task: every arm and every seed of a task pops the same tests.
// This keeps the ablation ladder a clean comparison. Rotate selectionSeed between
// campaigns, never within one.

import { readdirSync } from "node:fs";

// Small seedable PRNG. Math.random cannot be seeded, so we need our own to make
// selection reproducible. Algorithm: mulberry32 (Tommy Ettinger, public domain).
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded Fisher-Yates over a sorted copy. Sorting first makes the result
// independent of filesystem enumeration order.
function shuffle<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  const rand = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

// Return the chosen file names from a pool directory. Pure function of (dir contents, n, seed).
export function selectTests(poolDir: string, n: number, seed: number): string[] {
  const all = readdirSync(poolDir).sort();
  if (all.length < n) {
    throw new Error(`pool ${poolDir} has ${all.length} tests, need ${n}`);
  }
  return shuffle(all, seed).slice(0, n);
}
