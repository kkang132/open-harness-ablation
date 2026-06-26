// The runner executes one trial: one (task x arm x seed). It is the only component
// that touches a live agent. It builds a fresh session per sample, applies the arm's
// rungs, runs under a turn budget, then grades the winner on hidden tests.

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuthStorage, createAgentSession, ModelRegistry, SessionManager } from "@earendil-works/pi-coding-agent";
import { gradeHidden, runVisible } from "../grade/grader.ts";
import { prepareWorkdir } from "../grade/sandbox.ts";
import {
  addUsage,
  type BuildContext,
  emptyUsage,
  type Rung,
  type SampleContext,
  type SampleResult,
  type Usage,
} from "../rungs/types.ts";
import type { Task } from "../tasks/manifest.ts";
import type { Arm } from "./arm.ts";
import { runShell } from "./exec.ts";
import { localOllamaModel, OLLAMA_PROVIDER, registerOllamaProvider, resolveModel } from "./provider.ts";

// Step budget. Pi has no hard cap, so we add one: abort after this many turns.
const MAX_TURNS = 60;
const DEFAULT_TOOLS = ["read", "write", "edit", "bash"];

// Sampling temperature, pinned equal across every arm so the comparison is fair.
// Positive (not 0) so the k seeds of a trial differ and we can measure variance.
const TEMPERATURE = 0.2;

// The agent edits its workdir HERE, OUTSIDE the repo, so it cannot reach the real
// task source or repo config even if it searches the filesystem. Grading runs in
// throwaway copies under results/grading (inside the repo, so npx resolves tools).
const AGENT_SANDBOX_ROOT = join(tmpdir(), "pi-harness-agent");

export interface TrialRecord {
  taskId: string;
  family: string;
  arm: string;
  modelKey: string;
  seed: number;
  visiblePass: boolean;
  hiddenPass: boolean;
  usage: Usage;
  repairs: number;
  transcriptPath: string;
  error?: string;
}

// Sum token usage and cost over the assistant messages in a session.
function sumUsage(
  messages: Array<{ role?: string; usage?: { input: number; output: number; cost: { total: number } } }>,
): Usage {
  let acc = emptyUsage();
  for (const m of messages) {
    if (m.role === "assistant" && m.usage) {
      acc = addUsage(acc, { inputTokens: m.usage.input, outputTokens: m.usage.output, costUsd: m.usage.cost.total });
    }
  }
  return acc;
}

// Compose rung hooks. apply runs in order; wrapSample and wrapRun nest, first rung outermost.
function applyAll(rungs: Rung[], build: BuildContext): void {
  for (const r of rungs) r.apply?.(build);
}

function composeSample(rungs: Rung[], ctx: SampleContext, runAgent: () => Promise<void>): () => Promise<void> {
  let inner = runAgent;
  for (let i = rungs.length - 1; i >= 0; i--) {
    const rung = rungs[i]!;
    if (!rung.wrapSample) continue;
    const next = inner;
    inner = () => rung.wrapSample!(ctx, next);
  }
  return inner;
}

function composeRun(
  rungs: Rung[],
  ctx: { task: Task; seed: number },
  sampleOnce: () => Promise<SampleResult>,
): () => Promise<SampleResult> {
  let inner = sampleOnce;
  for (let i = rungs.length - 1; i >= 0; i--) {
    const rung = rungs[i]!;
    if (!rung.wrapRun) continue;
    const next = inner;
    inner = () => rung.wrapRun!(ctx, next);
  }
  return inner;
}

export interface RunnerOptions {
  resultsDir: string; // where raw transcripts and sandboxes live
  repairCap: number;
}

// Run one trial end to end.
export async function runTrial(task: Task, arm: Arm, seed: number, opts: RunnerOptions): Promise<TrialRecord> {
  const trialKey = `${task.id}-${arm.name}-seed${seed}`;
  const model = arm.modelId ? localOllamaModel(arm.modelId, arm.baseUrl) : resolveModel(arm.modelKey);

  // Build a model registry that knows the local provider (keyless dummy auth).
  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);
  registerOllamaProvider(modelRegistry);

  // Static knobs from the arm's rungs.
  const build: BuildContext = {
    task,
    enableTools: new Set(DEFAULT_TOOLS),
    systemPromptAppend: [],
    promptPrefix: [],
  };
  applyAll(arm.rungs, build);

  // Guidance (system-prompt append and prompt prefix) is delivered as a preamble
  // to the task prompt. INTEGRATION TODO: promote systemPromptAppend to a true
  // system-prompt append via DefaultResourceLoader if the distinction matters.
  const promptText = [...build.systemPromptAppend, ...build.promptPrefix, task.promptText].join("\n\n");

  let sampleCounter = 0;

  const sampleOnce = async (): Promise<SampleResult> => {
    const idx = sampleCounter++;
    // Agent works OUTSIDE the repo; grading copies live inside the repo.
    const agentTrialDir = join(AGENT_SANDBOX_ROOT, trialKey, `sample-${idx}`);
    mkdirSync(agentTrialDir, { recursive: true });
    const agentWorkdir = prepareWorkdir(task.workdir, agentTrialDir); // agentTrialDir/workdir
    const gradingBase = join(opts.resultsDir, "grading", trialKey, `sample-${idx}`);

    const { session } = await createAgentSession({
      // cwd is the trial dir, so the prompt's "workdir/<file>" resolves to the
      // sandbox copy. (Setting cwd to the workdir itself caused a workdir/workdir
      // mismatch, which made the agent search and edit the real task files.)
      cwd: agentTrialDir,
      model,
      thinkingLevel: build.thinkingLevel,
      tools: arm.noBuiltins ? undefined : Array.from(build.enableTools),
      noTools: arm.noBuiltins ? "builtin" : undefined,
      authStorage,
      modelRegistry,
      sessionManager: SessionManager.inMemory(),
    });

    // Pin the sampling temperature for local models, equal across arms, so the
    // ablation is fair.
    const baseStream = session.agent.streamFn;
    let streamFn: typeof baseStream = (m, context, options) => {
      const pin = m.provider === OLLAMA_PROVIDER;
      return baseStream(m, context, pin ? { ...options, temperature: TEMPERATURE } : options);
    };
    // Rung stream wrappers (e.g. the tool-call adapter) compose over the base.
    for (const rung of arm.rungs) {
      if (rung.wrapStream) streamFn = rung.wrapStream(streamFn);
    }
    session.agent.streamFn = streamFn;

    // Turn budget: abort the run if it exceeds MAX_TURNS.
    let turns = 0;
    const unsubscribe = session.agent.subscribe((event) => {
      if (event.type === "turn_start") {
        turns++;
        if (turns > MAX_TURNS) void session.abort();
      }
    });

    let repairs = 0;
    const ctx: SampleContext = {
      task,
      session,
      compile: async () => {
        // Compile a repo-internal copy so `npx tsc` resolves the toolchain.
        const cdir = join(gradingBase, "compile");
        rmSync(cdir, { recursive: true, force: true });
        mkdirSync(cdir, { recursive: true });
        cpSync(agentWorkdir, cdir, { recursive: true });
        const res = await runShell(task.compileCmd, cdir, task.timeoutSec);
        return res.code === 0 && !res.timedOut ? null : res.output;
      },
      runVisibleTests: () => runVisible(task, agentWorkdir, gradingBase),
      repairPrompt: async (feedback: string) => {
        repairs++;
        await session.prompt(feedback);
      },
      repairCap: opts.repairCap,
    };

    const runAgent = () => session.prompt(promptText);
    const composed = composeSample(arm.rungs, ctx, runAgent);

    try {
      await composed();
    } finally {
      unsubscribe();
    }

    // A stream error (quota, rate limit, network) is recorded on a message, not
    // thrown. Surface it as a real error so it is not mistaken for a failed fix.
    const messages = session.agent.state.messages as Array<{ errorMessage?: string }>;
    const streamError = messages.find((m) => m.errorMessage)?.errorMessage;
    if (streamError) throw new Error(streamError);

    const visibleFailure = await runVisible(task, agentWorkdir, gradingBase);
    const usage = sumUsage(session.agent.state.messages as never[]);

    const transcriptPath = join(opts.resultsDir, "raw", `${trialKey}-sample${idx}.json`);
    mkdirSync(join(opts.resultsDir, "raw"), { recursive: true });
    writeFileSync(transcriptPath, JSON.stringify(session.agent.state.messages, null, 2));

    return { visiblePass: visibleFailure === null, usage, repairs, transcriptPath, workdir: agentWorkdir };
  };

  // Remove this trial's scratch dirs (agent sandbox in tmp + grading copies).
  const cleanup = () => {
    rmSync(join(AGENT_SANDBOX_ROOT, trialKey), { recursive: true, force: true });
    rmSync(join(opts.resultsDir, "grading", trialKey), { recursive: true, force: true });
  };

  try {
    const composedRun = composeRun(arm.rungs, { task, seed }, sampleOnce);
    const result = await composedRun();
    const hiddenPass = await gradeHidden(task, result.workdir, join(opts.resultsDir, "grading", trialKey));

    cleanup();
    return {
      taskId: task.id,
      family: task.family,
      arm: arm.name,
      modelKey: arm.modelKey,
      seed,
      visiblePass: result.visiblePass,
      hiddenPass,
      usage: result.usage,
      repairs: result.repairs,
      transcriptPath: result.transcriptPath,
    };
  } catch (err) {
    cleanup();
    return {
      taskId: task.id,
      family: task.family,
      arm: arm.name,
      modelKey: arm.modelKey,
      seed,
      visiblePass: false,
      hiddenPass: false,
      usage: emptyUsage(),
      repairs: 0,
      transcriptPath: "",
      error: (err as Error).message,
    };
  }
}
