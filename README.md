# open-harness-ablation

A coding agent is a model plus a harness. The harness is the program around the model: it reads files, runs tools, and loops until the task is done. Most effort goes into choosing the model. This project leaves the model alone and changes the harness, which is open source, so each change is plain to read and to verify. Two such changes, both deterministic, raise a 12B model close to a model twice its size on a small set of coding tasks chosen so the smaller model fails them. The model is unchanged. Everything runs locally, and no calls are billed.

## Result

The small model is [Mellum2](https://huggingface.co/collections/JetBrains/mellum-2) (12B-A2.5B, JetBrains). It runs on [Pi](https://github.com/badlogic/pi-mono), a small open harness. The larger model, OpenAI's `gpt-oss:20b`, marks the next tier. The work is three TypeScript utilities, each implemented from a written specification: a parser for `.env` files, a slugifier that turns a title into a URL segment, and a parser for query strings. The model is given a natural-language specification and a typed, empty function stub, and must complete it. The result is graded on hidden tests, five runs each.

| Setup | Tasks passed (hidden tests, n=15) |
|-------|-----------------------------------|
| Mellum2, stock harness | 27% (4/15) |
| with verify-repair | 40% (6/15) |
| with verify-repair and best-of-N | 73% (11/15) |
| gpt-oss:20b, stock harness | 80% (12/15) |

The two changes raise the small model from 27% to 73%; the larger model scores 80%. On this small, deliberately gap-selected set, the changes recover most of the distance to the larger model. They add no billed API cost, but they do spend more local inference: best-of-N samples twice, and verify-repair retries. `FINDINGS.md` gives the complete numbers and the caveats.

## Why these tasks

A harness change helps only where the model fails, and only when the failure can be corrected from a test result. These three tasks meet both conditions. Each has a short, exact specification and many edge cases: an empty input, a quoted value, a repeated key. The model usually handles the common case and fails an edge case. The failure appears as a failing test, and from the test the model can repair its code. A harder problem, wrong in its overall approach rather than in a detail, gives the harness nothing to repair. The tasks were also chosen in advance, by running the small model and keeping only the ones it failed; there is no point measuring a change where the baseline already passes.

## The two changes

Each change is simple and deterministic. Neither has access to the hidden tests.

`verify-repair` runs the visible tests after the model writes its code. If a test fails, the harness returns the failure to the model, which tries again, up to three times. This is the loop a programmer runs by hand against a failing suite.

`best-of-N` asks the model twice and keeps the answer that passes the visible tests.

Three other changes (`localization`, `few-shot`, `reasoning`) are included but were not needed for this result. Each is one file under `src/rungs/`.

## How it is measured

The grading gives the model no advantage. It is scored on hidden tests it never sees, run on a clean copy it cannot reach, so it cannot pass by editing a test. Each configuration runs five times, and the result is the pass rate. The full method is in the repository.

## Scope

This is a toy, not a research benchmark. Three tasks and five runs are too few to prove a general claim, and the tasks were chosen to suit the method. The counts are bounded by run time: every trial runs a local model end to end on one laptop (Apple M4 Max, 64 GB), so the number of rungs, arms, and tasks is what finishes in reasonable time, not what would be ideal. The aim is practical: to show how to add a change to an open harness and measure whether it helps, on tasks you control. Treat it as a template for building and testing your own changes.

Do not read it as: a benchmark, a model ranking, or a general comparison of Mellum2 and gpt-oss:20b. The numbers describe these three tasks under this setup, nothing wider.

## Running it

Everything runs locally, using [Ollama](https://ollama.com) and a [llama.cpp](https://github.com/ggml-org/llama.cpp) server.

```bash
npm ci            # install (exact pinned versions)
npm run check     # lint, typecheck, tests

ollama pull gpt-oss:20b      # the larger model
# serve the small model with a llama.cpp server on :8080
# (the command is at the top of scripts/reproduce.ts)

npm run reproduce            # run the comparison, write results/summary/ladder.md
```

`npm run pilot` screens the changes; `npm run bench` runs all tasks; `npm run report` redraws the table.

## A more robust test

This toy trades rigour for run time. To make it something you would trust:

- **More seeds.** Raise k from 5 to perhaps 30 and report a confidence interval; the single-cell noise here (one arm dipping on one task) goes away with more seeds.
- **More tasks.** Add families and more instances per family across the difficulty band. Floor-pre-screen each (run the small model first) and keep the ones it fails, so every task has headroom. A pass rate over 200 trials means something; over 15 it does not.
- **More rungs.** The repo ships `localization`, `few-shot`, `reasoning`, and a tool-call adapter beside the two used here. Run them as arms, both cumulative and leave-one-out (drop one rung at a time), to read each rung's marginal lift. Localization only earns its place once tasks span multiple files.
- **A cost axis.** The runner already records tokens and dollar cost per trial; for local models it reads zero. Point one or two arms at cloud models (Pi supports several providers; supply a key) and the ladder gains a quality-against-cost view: what each rung buys, and what it spends. The shipped harness is local-only, so this means wiring a cloud provider back in.
- **A time budget.** Cloud inference is faster and runs in parallel, so a far larger sweep finishes in a few hours where the same on one laptop would not. Design for what completes in, say, under four hours, then scale k and task count to fill it.

## Documents

- [FINDINGS.md](./FINDINGS.md): the result in full, with caveats.
- [ARCHITECTURE.md](./ARCHITECTURE.md): how it works inside.
- [AGENTS.md](./AGENTS.md): rules for agents in the repo, and how to add a task.
- [GLOSSARY.md](./GLOSSARY.md): every term in plain language.

## License

Apache 2.0. See [LICENSE](./LICENSE).
