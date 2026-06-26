// The local model must be built from the configured endpoint, with zero cost.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { localOllamaModel, resolveModel } from "../src/harness/provider.ts";

describe("resolveModel (local-20b)", () => {
  const saved = process.env.OLLAMA_BASE_URL;
  beforeEach(() => {
    process.env.OLLAMA_BASE_URL = "http://example.test:11434/v1";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.OLLAMA_BASE_URL;
    else process.env.OLLAMA_BASE_URL = saved;
  });

  it("builds the local model from OLLAMA_BASE_URL with zero cost", () => {
    const model = resolveModel("local-20b");
    expect(model.baseUrl).toBe("http://example.test:11434/v1");
    expect(model.cost.input).toBe(0);
    expect(model.api).toBe("openai-completions");
  });

  it("builds an explicit local model id at a custom base URL", () => {
    const model = localOllamaModel("mellum2-instruct", "http://127.0.0.1:8080/v1");
    expect(model.id).toBe("mellum2-instruct");
    expect(model.baseUrl).toBe("http://127.0.0.1:8080/v1");
    expect(model.cost.output).toBe(0);
  });
});
