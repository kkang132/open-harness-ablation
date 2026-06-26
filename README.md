# pi-harness-ablation

A coding agent is a model plus a harness. The harness is the program around the model: it reads files, runs tools, and loops until the task is done. Most effort goes into choosing the model. This project leaves the model alone and changes the harness, which is open source, so each change is plain to read and to verify. Two such changes, both deterministic, raise a 12B model to nearly the level of a model twice its size, on ordinary coding tasks. The model is unchanged. Everything runs locally, and no calls are billed.

## Result

The small model is [Mellum2](https://huggingface.co/collections/JetBrains/mellum-2) (12B-A2.5B, JetBrains). It runs on [Pi](https://github.com/badlogic/pi-mono), a small open harness. The larger model, OpenAI's `gpt-oss:20b`, marks the next tier. The work is three TypeScript utilities, each implemented from a written specification: a parser for `.env` files, a slugifier that turns a title into a URL segment, and a parser for query strings. The model is given a natural-language specification and a typed, empty function stub, and must complete it. The result is graded on hidden tests, five runs each.

| Setup | Tasks passed (hidden tests) |
|-------|-----------------------------|
| Mellum2, stock harness | 27% |
| with verify-repair | 40% |
| with verify-repair and best-of-N | 73% |
| gpt-oss:20b, stock harness | 80% |

The two changes raise the small model from 27% to 73%; the larger model scores 80%. The changes recover most of the gap, at no extra token cost. `FINDINGS.md` gives the complete numbers and the caveats.

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

This is a toy, not a research benchmark. Three tasks and five runs are too few to prove a general claim, and the tasks were chosen to suit the method. The aim is practical: to show how to add a change to an open harness and measure whether it helps, on tasks you control. Treat it as a template for building and testing your own changes.

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

## Documents

- [FINDINGS.md](./FINDINGS.md): the result in full, with caveats.
- [ARCHITECTURE.md](./ARCHITECTURE.md): how it works inside.
- [AGENTS.md](./AGENTS.md): rules for agents in the repo, and how to add a task.
- [GLOSSARY.md](./GLOSSARY.md): every term in plain language.
