// The tool-call adapter must turn a tool call the model wrote as JSON-in-text into
// a real toolCall block, and leave everything else alone.

import type { StreamFn } from "@earendil-works/pi-agent-core";
import type { AssistantMessage, AssistantMessageEventStream, ToolCall } from "@earendil-works/pi-ai";
import * as PiAi from "@earendil-works/pi-ai";
import { describe, expect, it } from "vitest";
import { toolCallAdapterRung } from "../src/rungs/tool-call-adapter.ts";

const createStream = (PiAi as unknown as { createAssistantMessageEventStream: () => AssistantMessageEventStream })
  .createAssistantMessageEventStream;

const fakeModel = {
  id: "m",
  name: "m",
  api: "openai-completions",
  provider: "ollama",
  baseUrl: "",
  reasoning: false,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 1,
  maxTokens: 1,
} as never;

function message(content: AssistantMessage["content"]): AssistantMessage {
  return {
    role: "assistant",
    content,
    api: "openai-completions",
    provider: "ollama",
    model: "m",
    usage: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 0,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    stopReason: "stop",
    timestamp: 0,
  };
}

// An inner stream function that emits a single done event carrying `msg`.
function innerWith(msg: AssistantMessage): StreamFn {
  return (() => {
    const stream = createStream();
    stream.push({ type: "done", reason: "stop", message: msg });
    return stream;
  }) as unknown as StreamFn;
}

async function runAdapter(msg: AssistantMessage): Promise<AssistantMessage> {
  const wrapped = toolCallAdapterRung().wrapStream?.(innerWith(msg));
  if (!wrapped) throw new Error("adapter has no wrapStream");
  return wrapped(fakeModel, {} as never, undefined).result();
}

describe("tool-call adapter", () => {
  it("rewrites a fenced JSON tool call in text into a toolCall block", async () => {
    const text = '```json\n{"name":"edit","arguments":{"path":"x.ts","edits":[]}}\n```';
    const out = await runAdapter(message([{ type: "text", text }]));
    const calls = out.content.filter((c): c is ToolCall => c.type === "toolCall");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.name).toBe("edit");
    expect(calls[0]?.arguments).toEqual({ path: "x.ts", edits: [] });
    expect(out.stopReason).toBe("toolUse");
  });

  it("parses a bare JSON tool call with no fences", async () => {
    const out = await runAdapter(message([{ type: "text", text: '{"name":"read","arguments":{"path":"y"}}' }]));
    expect(out.content.filter((c) => c.type === "toolCall")).toHaveLength(1);
  });

  it("leaves a message that already has a native toolCall untouched", async () => {
    const tc: ToolCall = { type: "toolCall", id: "1", name: "read", arguments: { path: "y" } };
    const out = await runAdapter(message([tc]));
    expect(out.content.filter((c) => c.type === "toolCall")).toHaveLength(1);
  });

  it("leaves plain prose alone", async () => {
    const out = await runAdapter(message([{ type: "text", text: "I will think about it." }]));
    expect(out.content.filter((c) => c.type === "toolCall")).toHaveLength(0);
  });
});
