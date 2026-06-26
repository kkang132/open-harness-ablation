# Findings

## What this is

A test of one idea: can cheap, generic changes to a lightweight coding *harness*
make a small local model perform like a model a tier larger, on everyday
software-engineering tasks? No fine-tuning, no model change, and everything runs
locally at zero API cost.

## The harness, and why Pi

A harness is the scaffolding around a language model that turns it into a coding
agent: it reads files, calls tools (edit a file, run a command), and loops until
the job is done. The model is the engine; the harness is the rest of the car.

We use **Pi**, a small open-source harness, precisely because it is minimal and
open. The modifications are transparent and anyone can reproduce them. The whole
experiment changes the *harness*, never the model.

## The two modifications (the rungs)

- **verify-repair:** after the model writes its code, the harness runs the task's
  visible tests. If any fail, it hands the failures back to the model and lets it
  try again, up to three rounds. This is what a developer does with a failing test
  suite.
- **best-of-N:** the harness asks the model twice and keeps the attempt that passes
  the visible tests (N=2 here).

Both are cheap and model-agnostic. Neither ever sees the hidden tests used for
grading.

## The two models, and why these

- **Floor: Mellum2-12B** (JetBrains' small open code model), run locally. The model
  we want to lift.
- **Ceiling: gpt-oss:20b** (OpenAI's open-weight model), run locally. The "next
  tier" target. It is a good benchmark because it is open, runs on the same laptop,
  and is materially stronger: it solves these tasks about 80% of the time where
  Mellum2 manages 27%. If the harnessed small model reaches it, the harness is
  worth roughly a model tier.

## The tasks, and how they were chosen (important)

Three real-world TypeScript utilities, written from a spec: an `.env` parser, a URL
slugifier, and a query-string parser. Each has edge-case-heavy hidden tests.

**The tasks were pre-selected.** We first ran Mellum2 on the bare harness and kept
only tasks it *fails* (roughly 0 to 3 of 5 seeds). This is deliberate: a harness
can only help where the model is falling short, so we measure its value where a gap
exists. It is not a claim that the harness helps on every task. Tasks the model
already passes, or cannot solve even with feedback, show no lift (earlier runs
confirmed both, which is why pre-selection matters).

## The ladder (hidden-test pass rate, k=5)

| Arm | envfile | slugify | querystring | overall |
|-----|---------|---------|-------------|---------|
| Mellum2 floor | 3/5 | 1/5 | 0/5 | **27%** |
| + verify-repair | 4/5 | 0/5 | 2/5 | **40%** |
| + verify-repair + best-of-N | 4/5 | 4/5 | 3/5 | **73%** |
| gpt-oss:20b (ceiling) | 3/5 | 5/5 | 4/5 | **80%** |

**The harness takes Mellum2 from 27% to 73% (11/15), closing about 85% of the gap
to the next model tier, with no billed API cost.** (The rungs do spend more local
inference; see the caveats below.)

## What each rung did

- **verify-repair (27 -> 40):** rescued querystring from 0/5 to 2/5. Mellum2's
  failures show up in the visible tests too, so the repair loop has a real signal:
  it sees the failing edge case and patches it. This is a fixable failure, unlike a
  wrong-whole-algorithm task it could never recover from.
- **best-of-N (40 -> 73):** the largest jump. These tasks sit at Mellum2's boundary,
  where it succeeds some of the time. Drawing two samples and keeping the one that
  passes the visible tests turns partial success into a reliable pass (slugify
  0 -> 4, querystring 2 -> 3).

## Honest caveats

- **k=5 is small.** Per-task cells are noisy: slugify dips 1 -> 0 under verify-repair
  (a regression more seeds would smooth), and on envfile Mellum2+best-of-N (4/5)
  edges out the ceiling (3/5). The robust signal is the overall monotonic climb,
  not any single cell.
- **best-of-N does most of the lifting**, at N times the samples. It is a
  cost/quality trade, not a free win.
- **Three tasks, pre-selected to Mellum2's band** (see above). Measures lift where a
  gap exists, not a universal claim.

## Method notes

- An earlier run was discarded: a sandbox bug let agents edit the real task files.
  Fixed (the agent now works outside the repo, and its working directory matches the
  prompt). Seeds are verified intact after every run.
- A task is admitted only if a reference solution passes the visible and hidden
  tests while the stub fails the visible tests. Visible and hidden pools are disjoint.
- A second track (qwen2.5-coder plus a tool-call adapter) is documented separately.
  qwen emits tool calls as plain text the bare harness ignores, so the adapter is
  needed just to make it act, but qwen is too weak to convert that into passes here.
