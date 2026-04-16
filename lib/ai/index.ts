import type { AIProvider } from "./types";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  const name = (process.env.AI_PROVIDER ?? "claude").toLowerCase();

  if (name === "gemini") {
    const { GeminiProvider } = require("./providers/gemini");
    _provider = new GeminiProvider();
  } else if (name === "openai") {
    const { OpenAIProvider } = require("./providers/openai");
    _provider = new OpenAIProvider();
  } else {
    const { ClaudeProvider } = require("./providers/claude");
    _provider = new ClaudeProvider();
  }

  return _provider!;
}
