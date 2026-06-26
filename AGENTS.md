# AGENTS.md

Guidance for AI agents in this repository.

**Which are you?** Being told you are the planner does not make you one. A **worker** writes code, fixes a test, or runs the benchmark; it follows *Rules* and *Working*. A **planner** designs tasks, and is a planner only insofar as its tasks make the *Proofs* pass. Planners read *Designing a task* before acting. When in doubt, work.

## Rules (never break these)

- Never read, edit, or delete `tests/hidden-pool/`. It grades the benchmark.
- Never weaken, skip, or delete a test to make it pass. Fix the code.
- The evaluated model writes `workdir/` only. It never writes tests.
- A rung never sees `hiddenCmd`. The repair loop uses `visibleCmd` only.
- Never change `selectionSeed`, `nVisible`, or `nHidden` within a comparison.
- Never hand-edit `results/`.

## Working

- Run `npm run check` (lint, typecheck, tests) and keep it green. Install with `npm ci`.
- Write for a reader who knows neither TypeScript nor machine learning.
- Every file opens with a comment: what it is for, and why.
- Comment intent, not mechanics. Plain names over clever ones. Small functions, one job each.
- One rung per file under `src/rungs/`. Define new terms in [GLOSSARY.md](./GLOSSARY.md).

## Designing a task (planners)

A task is one directory under `src/tasks/families/<family>-<nn>/`:

```
<family>-<nn>/
├── task.json         # manifest (see ARCHITECTURE.md)
├── prompt.md         # what the model is asked to do
├── workdir/          # the stub the model completes
└── tests/
    ├── visible-pool/ # the repair loop pops nVisible from here
    └── hidden-pool/  # the grader pops nHidden; never shown to the model
```

A good task:

- Difficulty: the ceiling model passes, the floor model often fails. Outside that band it tells you nothing.
- Visible and hidden pools are disjoint cases of one spec. Hidden are held out, not copies.
- Admit a test only if a correct reference solution passes it and a deliberate wrong version fails it.
- It must compile before tests run (`compileCmd`). Keep it small.

Validate a new task with `npm run pilot` before adding it to the suite.

## Proofs

Run these to confirm the project's invariants hold. Each is deterministic and uses no model. Run them before and after touching tasks.

```bash
# 1. the harness builds, typechecks, and unit tests pass
npm run check

# 2. every task loads, and its stub fails its own visible tests
#    (so each task is genuinely unsolved; catches a seed accidentally completed)
npm run verify:tasks

# 3. no rung can reach the hidden tests
grep -rnE "hiddenCmd|gradeHidden|hiddenPool|hidden-pool" src/rungs && echo "LEAK" || echo "ok"

# 4. nothing local or secret is tracked by git
git ls-files | grep -E "^results/|(^|/)\.idea/|(^|/)\.env$" && echo "TRACKED: remove it" || echo "ok"
```
