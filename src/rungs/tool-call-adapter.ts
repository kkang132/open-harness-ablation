// Rung: tool-call adapter. Pure I/O translation, not a capability boost.
//
// Some local models (qwen2.5-coder, llama3.2, ...) do not emit Pi's native
// tool_calls. They write the call as a JSON object in their text, e.g.
//
//   ```json
//   { "name": "edit", "arguments": { "path": "...", "edits": [...] } }
//   ```
//
// The naive harness sees no toolCall blocks, executes nothing, and the model's
// edits never land. This rung wraps the model stream: when the finished message
// carries no native toolCall but its text parses to one, it re-emits it as a
// real toolCall block. It never touches tests or results; it only lets Pi hear
// what the model is already trying to say.

import type { StreamFn } from "@earendil-works/pi-agent-core";
import type { AssistantMessage, AssistantMessageEventStream, TextContent, ToolCall } from "@earendil-works/pi-ai";
import * as PiAi from "@earendil-works/pi-ai";
import type { Rung } from "./types.ts";

// The class is exported type-only from the package root, but its runtime factory
// is present. Grab it with a narrow cast: the value genuinely exists.
const createStream = (PiAi as unknown as { createAssistantMessageEventStream: () => AssistantMessageEventStream })
  .createAssistantMessageEventStream;

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `tc-adapter-${idCounter}-${Math.floor(Math.random() * 1e6)}`;
}

// Pull tool calls out of free text. Handles fenced ```json blocks and a bare
// top-level JSON object/array. Returns the parsed calls and the leftover text.
function extractCalls(text: string): {
  calls: Array<{ name: string; arguments: Record<string, unknown> }>;
  rest: string;
} {
  const calls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
  let rest = text;

  const consider = (raw: string): boolean => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      return false;
    }
    const items = Array.isArray(parsed) ? parsed : [parsed];
    let found = false;
    for (const item of items) {
      if (item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string") {
        const rec = item as { name: string; arguments?: unknown };
        let args = rec.arguments;
        if (typeof args === "string") {
          try {
            args = JSON.parse(args);
          } catch {
            /* leave as-is */
          }
        }
        if (args && typeof args === "object") {
          calls.push({ name: rec.name, arguments: args as Record<string, unknown> });
          found = true;
        }
      }
    }
    return found;
  };

  // Fenced code blocks first.
  const fence = /```(?:json)?\s*([\s\S]*?)```/g;
  let m: RegExpExecArray | null = fence.exec(text);
  let anyFence = false;
  while (m !== null) {
    if (consider(m[1] ?? "")) {
      anyFence = true;
      rest = rest.replace(m[0], "");
    }
    m = fence.exec(text);
  }

  // No fenced call: try the whole text as bare JSON.
  if (!anyFence) {
    if (consider(text)) rest = "";
  }

  return { calls, rest: rest.trim() };
}

// Convert a finished assistant message: if it has no native toolCall block but
// its text encodes one, replace the text with proper toolCall blocks.
function coerce(message: AssistantMessage): AssistantMessage {
  if (message.content.some((c) => c.type === "toolCall")) return message;

  const newContent: AssistantMessage["content"] = [];
  const toolCalls: ToolCall[] = [];
  for (const block of message.content) {
    if (block.type === "text") {
      const { calls, rest } = extractCalls(block.text);
      if (calls.length > 0) {
        if (rest) newContent.push({ type: "text", text: rest } as TextContent);
        for (const c of calls) toolCalls.push({ type: "toolCall", id: nextId(), name: c.name, arguments: c.arguments });
        continue;
      }
    }
    newContent.push(block);
  }

  if (toolCalls.length === 0) return message;
  return { ...message, content: [...newContent, ...toolCalls], stopReason: "toolUse" };
}

export function toolCallAdapterRung(): Rung {
  return {
    name: "tool-call-adapter",
    wrapStream(inner: StreamFn): StreamFn {
      return (model, context, options) => {
        const out = createStream();
        void (async () => {
          try {
            const innerStream = await inner(model, context, options);
            for await (const ev of innerStream) {
              if (ev.type === "done") {
                const message = coerce(ev.message);
                const reason = message.content.some((c) => c.type === "toolCall") ? "toolUse" : ev.reason;
                out.push({ type: "done", reason, message });
              } else {
                out.push(ev);
              }
            }
          } catch (err) {
            const errorMessage: AssistantMessage = {
              role: "assistant",
              content: [{ type: "text", text: String(err) }],
              api: model.api,
              provider: model.provider,
              model: model.id,
              usage: {
                input: 0,
                output: 0,
                cacheRead: 0,
                cacheWrite: 0,
                totalTokens: 0,
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
              },
              stopReason: "error",
              errorMessage: String(err),
              timestamp: Date.now(),
            };
            out.push({ type: "error", reason: "error", error: errorMessage });
          }
        })();
        return out;
      };
    },
  };
}
