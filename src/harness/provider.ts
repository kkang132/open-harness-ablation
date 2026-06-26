// Provider wiring. Builds a Pi Model for a local model served over an
// OpenAI-compatible endpoint (Ollama, or a llama.cpp server).
//
// Everything runs locally and keyless. Pi's auth layer still wants a non-empty
// key per provider, so registerOllamaProvider supplies a dummy one. Temperature
// is pinned by the runner, equal across arms.

import type { Model } from "@earendil-works/pi-ai";
import type { ModelRegistry } from "@earendil-works/pi-coding-agent";

export type ModelKey = "local-20b";

// Custom provider id for local OpenAI-compatible endpoints. Not one of Pi's known
// providers, so we register it ourselves (see registerOllamaProvider).
export const OLLAMA_PROVIDER = "ollama";

function ollamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
}

// Register the local provider on a model registry. The endpoint is keyless, but
// Pi requires a non-empty key per provider, so we supply a dummy one; the server
// ignores the Authorization header it is sent.
export function registerOllamaProvider(registry: ModelRegistry): void {
  registry.registerProvider(OLLAMA_PROVIDER, {
    name: "Ollama (local)",
    baseUrl: ollamaBaseUrl(),
    apiKey: "ollama-local",
    authHeader: true,
    api: "openai-completions",
  });
}

// Any local model served over an OpenAI-compatible endpoint. Built as a Model
// literal (these are not in Pi's catalog). Cost is zero: local compute.
// Any local model id can be a floor: gpt-oss:20b, qwen2.5-coder, llama3.2, or a
// llama.cpp-served model via an explicit baseUrl.
export function localOllamaModel(id: string, baseUrl: string = ollamaBaseUrl()): Model<"openai-completions"> {
  return {
    id,
    name: `${id} (local)`,
    api: "openai-completions",
    provider: OLLAMA_PROVIDER,
    baseUrl,
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 131072,
    maxTokens: 32768,
  };
}

// The default local model (the ceiling in the demo). Arms usually set an explicit
// modelId instead; this is the fallback for modelKey "local-20b".
export function resolveModel(_key: ModelKey): Model<string> {
  return localOllamaModel("gpt-oss:20b");
}
