# Glossary

Plain definitions for the terms used in this repo. No machine-learning or
TypeScript background assumed.

**Model.** The AI that writes code. Here, either a small one running on your own
machine (`gpt-oss:20b`) or a large hosted one (the reference bars).

**Frontier vs non-frontier.** Frontier means the strongest available models.
Non-frontier means smaller, cheaper, often local ones. The whole point of this
repo is to narrow the gap between the two.

**Harness.** The scaffolding around the model: the loop that reads files, runs
the model, applies its edits, runs commands. The model is the engine; the harness
is the rest of the car. We use a lightweight open one called Pi.

**Rung.** One small, cheap modification to the harness. Named for the steps of a
ladder: each rung we add should lift the result a little. See the five rungs in
the [README](./README.md).

**Verify-repair.** A rung. After the model says it is done, run the tests. If they
fail, hand the failures back and let it try again, up to a cap. The single most
effective rung, because it puts the test result inside the loop.

**Best-of-N.** A rung. Ask the model N times, keep the answer that passes. We cap
N at 2. Cost counts all N attempts, not just the winner.

**Oracle.** The thing that knows the right answer. Here it is the test suite. A
modification that lets the harness consult the oracle (verify-repair) is high
leverage.

**Tests: visible vs hidden.** Visible tests are shown to the harness during the
repair loop. Hidden tests are kept back and used only for the final grade. The
split stops a model from passing by overfitting to the tests it can see.

**Test pool.** A larger set of tests per task. Each run pops a fixed subset, pinned
by a seed, so every comparison faces the same tests.

**Sandbox.** A throwaway copy of the code where tests run. The model edits its own
copy; tests run against a fresh copy with clean test files dropped in. This is how
a model is prevented from editing the tests to fake a pass.

**Seed.** A number that makes a random choice repeatable. We use it to pick the
same tests every time, and to label repeated runs.

**Arm.** One configuration being measured: a model plus a set of rungs. The bars
on the chart (A, B, C, D) are arms.

**Floor and ceiling.** Floor is the weakest arm (local model, no rungs). Ceiling is
the strongest reference (frontier model). The goal is to push the local model up
toward the ceiling using only rungs.

**Ablation ladder.** The headline chart. Start at the floor, add one rung at a
time, watch the score climb. Ablation means removing or adding one piece at a time
to see what each is worth.

**Pass-rate.** The fraction of trials that pass the hidden tests. The headline
number. We report pass-rate and cost, not token counts, because token counts do
not compare across different model vendors.

**Trial.** One run of one task, by one arm, with one seed.
