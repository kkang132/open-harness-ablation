// The Rung contract. One rung is one harness modification.
//
// Three hooks, each optional, composed by an arm in order:
//
//   apply       static knobs set before the session is built
//               (thinking level, tools, system-prompt append, initial prompt).
//
//   wrapSample  wraps one sample's lifecycle on a single live session.
//               verify-repair lives here: prompt, run visible tests, repair, repeat.
//
//   wrapRun     wraps the set of samples for one trial.
//               best-of-N lives here: take N samples, select the one passing visible tests.
//
// Pi resolves session.prompt() when the agent stops calling tools, and binds its
// own beforeToolCall/afterToolCall. So we compose at the prompt boundary, not per turn.

import type { StreamFn } from "@earendil-works/pi-agent-core";
import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { Task } from "../tasks/manifest.ts";

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export function emptyUsage(): Usage {
  return { inputTokens: 0, outputTokens: 0, costUsd: 0 };
}

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    costUsd: a.costUsd + b.costUsd,
  };
}

// Mutable session build options, assembled before the agent is created.
// Rungs mutate this in apply(). The runner hands it to createAgentSession.
export interface BuildContext {
  task: Task;
  // Extra tool names to enable beyond Pi defaults (read/write/edit/bash). E.g. grep/find/ls.
  enableTools: Set<string>;
  // Lines appended to the system prompt (few-shot examples, localization guidance).
  systemPromptAppend: string[];
  // Text prepended to the task prompt before it is sent.
  promptPrefix: string[];
  // Pi thinking level. Set by the reasoning rung. Undefined means session default.
  thinkingLevel?: "low" | "medium" | "high";
}

// Per-sample context. One sample is one fresh session that may be repaired in place.
export interface SampleContext {
  task: Task;
  session: AgentSession;
  // Run the task's visible tests on a pristine isolated copy of the current workdir.
  // Returns the failure output when red, or null when green. Never touches hidden tests.
  runVisibleTests: () => Promise<string | null>;
  // Compile gate (tsc --noEmit). Returns error output when broken, null when clean.
  compile: () => Promise<string | null>;
  // Re-prompt the same session with repair feedback. Counts against the repair cap.
  repairPrompt: (feedback: string) => Promise<void>;
  // Hard ceiling on repair re-prompts for this sample.
  repairCap: number;
}

export interface SampleResult {
  visiblePass: boolean;
  usage: Usage;
  repairs: number;
  // Path to this sample's transcript on disk.
  transcriptPath: string;
  // The sample's workdir. best-of-N selects a winner; the grader runs on its code.
  workdir: string;
}

// Per-trial context shared across the samples of one (task, arm, seed).
export interface RunContext {
  task: Task;
  seed: number;
}

export interface Rung {
  name: string;
  apply?(build: BuildContext): void;
  wrapSample?(ctx: SampleContext, runAgent: () => Promise<void>): Promise<void>;
  wrapRun?(ctx: RunContext, sampleOnce: () => Promise<SampleResult>): Promise<SampleResult>;
  // Wrap the model stream. Used by the tool-call adapter: it parses a tool call
  // the model wrote as JSON-in-text and re-emits it as a real toolCall block,
  // so a model that does not speak Pi's native tool protocol can still drive it.
  wrapStream?(inner: StreamFn): StreamFn;
}
