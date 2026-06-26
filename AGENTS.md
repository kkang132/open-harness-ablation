# Agent rules

Rules for any AI agent working in this repository. Read before acting.

## Hard rules

- Never read, edit, or delete anything under `tests/hidden-pool/`. These grade the benchmark. Touching them invalidates results.
- Never weaken, skip, or delete a test to make it pass. Fix the code.
- The model under evaluation never writes tests. It writes solution code in `workdir/` only.
- Never reference a task's `hiddenCmd` from a rung or from the runner's agent loop. The repair loop sees `visibleCmd` only.
- Never change `selectionSeed`, `nVisible`, or `nHidden` mid-campaign. Reseeding within a comparison breaks the ladder.
- Results are reproducible or they do not count. Do not hand-edit anything under `results/`.

## Adding a task

A task is one directory under `src/tasks/families/<family>-<nn>/`.

```
<family>-<nn>/
├── task.json              # manifest (see ARCHITECTURE.md)
├── prompt.md              # what the agent is asked to do
├── workdir/               # seed files the agent edits
└── tests/
    ├── visible-pool/      # repair loop pops nVisible from here
    └── hidden-pool/       # grader pops nHidden from here, never exposed
```

Tests may be pre-written by a separate offline agent, then frozen. Rules for a good task:

- Difficulty band: the ceiling model passes, the floor model often fails. Outside that band the task tells us nothing.
- Pools are disjoint sets of the same spec. Hidden are held-out cases, not copies of visible.
- Each pool test passes against a known-good reference solution and fails against a known-bad mutation before it is admitted.
- Must compile clean before tests run (`compileCmd`).
- Keep it small. High-frequency SWE shapes, low token cost.

Validate with `npm run pilot` on the new task before adding it to the suite.

## Style

The code should read for someone who does not write TypeScript or know machine
learning. Optimise for that reader.

- Every file opens with a comment saying what it is for and why it exists.
- Comment intent, not mechanics. Say why, not what the next line plainly does.
- Plain names over clever ones. A longer clear name beats a short cryptic one.
- Small functions, one job each. No deep nesting.
- No clever one-liners where a loop is clearer.
- One rung per file under `src/rungs/`.
- Unfamiliar terms are defined in [GLOSSARY.md](./GLOSSARY.md). Add to it, do not
  assume the reader knows a term.
- Prose in Markdown: clear and concise.

## Tooling

- TypeScript throughout, strict mode.
- Biome formats and lints. Run `npm run lint` and `npm run format`.
- Vitest for tests. Run `npm run test`.
- `npm run check` runs lint, typecheck, and tests together. Keep it green.
- Dependencies are pinned to exact versions. Install with `npm ci`.
