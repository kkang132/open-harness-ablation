# pi-harness-ablation

Cheap, generic modifications to a lightweight coding **harness** can lift a small
local model most of the way to the next model tier on real-world software
tasks. No fine-tuning, no model change, no API cost. The lever is the harness.

## Result

A local 12B model (Mellum2) running on a stock harness, then with two cheap rungs
added, measured against a larger local model (gpt-oss:20b) as the ceiling. Three
real-world TypeScript tasks (an `.env` parser, a URL slugifier, a query-string
parser), graded on held-out hidden tests, k=5 seeds.

| Arm | Pass (hidden tests) |
|-----|---------------------|
| Mellum2 floor | 27% |
| + verify-repair | 40% |
| + verify-repair + best-of-N | **73%** |
| gpt-oss:20b (ceiling) | 80% |

**The harness takes the small model from 27% to 73%, closing about 85% of the gap
to the next tier, for free.** Full analysis and caveats in [FINDINGS.md](./FINDINGS.md).

## What is a harness, and why Pi

A harness is the scaffolding around a language model that turns it into a coding
agent: it reads files, calls tools (edit, run a command), and loops until the job
is done. The model is the engine; the harness is the rest of the car. We build on
[Pi](https://github.com/badlogic/pi-mono), a small open harness, because it is
minimal and the modifications stay transparent. This project changes the harness,
never the model.

## The rungs

Each rung is one composable modification. The two that carry the result:

1. **verify-repair**. After the model writes code, run the visible tests; on
   failure, hand the failures back and let it fix, up to 3 rounds. What a
   developer does with a failing suite.
2. **best-of-N**. Sample the model N times (N=2), keep the attempt that passes the
   visible tests.

Also included and pluggable: `localization`, `few-shot`, `reasoning`. Each lives
in one file under `src/rungs/`.

## How it works

- **Floor vs ceiling**: two local models. The floor is the small model we lift;
  the ceiling is a larger local model that marks the "next tier".
- **Tasks**: implement-to-spec utilities with edge-case-heavy tests. Each task
  splits tests into a visible pool (the repair loop may see these) and a disjoint
  hidden pool (grading only). The model never sees the hidden tests.
- **Isolation**: the agent edits a sandbox outside the repo; grading runs hidden
  tests on a pristine copy, so a model cannot pass by editing tests.
- **Task selection**: tasks are pre-screened so the floor model genuinely fails
  them. A harness can only help where there is a gap.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for internals.

## Quickstart

Everything runs locally. You need [Ollama](https://ollama.com) and, for a
second model, a [llama.cpp](https://github.com/ggml-org/llama.cpp) server.

```bash
npm ci                       # exact pinned versions
npm run check                # lint, typecheck, tests

ollama pull gpt-oss:20b      # the ceiling model
# serve a floor model with llama.cpp on :8080 (see scripts/reproduce.ts header)

npm run reproduce            # run the ladder above and write results/summary/ladder.md
```

Other entry points: `npm run pilot` (quick rung screen on one model), `npm run
bench` (cumulative ladder over all tasks), `npm run report` (redraw the chart).

## Docs

- [FINDINGS.md](./FINDINGS.md): the result, in full, with honest caveats.
- [ARCHITECTURE.md](./ARCHITECTURE.md): internals, data flow, the Rung contract.
- [AGENTS.md](./AGENTS.md): rules for agents working in the repo, task authoring.
- [GLOSSARY.md](./GLOSSARY.md): every term in plain language, no background assumed.
