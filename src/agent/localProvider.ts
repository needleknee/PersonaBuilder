/**
 * Local LLM Provider
 * 
 * Uses OpenAI-compatible API endpoint (llama.cpp, LM Studio, etc.)
 * to run extraction on a local model without API keys or network latency.
 * 
 * Default endpoint: http://127.0.0.1:50305 (LM Studio / llama.cpp)
 */

import { LLMProvider } from "./provider";

/**
 * Configuration for LocalLLMProvider
 */
export interface LocalLLMConfig {
  baseURL?: string;
  model?: string;
  temperature?: number;
  timeout?: number;
}

/**
 * Local LLM Provider using OpenAI-compatible API
 * 
 * Works with:
 * - llama.cpp (http://127.0.0.1:8000)
 * - LM Studio (http://127.0.0.1:1234)
 * - Ollama (http://127.0.0.1:11434/v1)
 * - vLLM, Text Generation WebUI, etc.
 */
export class LocalLLMProvider implements LLMProvider {
  private baseURL: string;
  private model: string;
  private temperature: number;
  private timeout: number;

  constructor(config: LocalLLMConfig = {}) {
    this.baseURL = config.baseURL || process.env.LOCAL_LLM_BASE_URL || "http://127.0.0.1:50305";
    this.model = config.model || process.env.LOCAL_LLM_MODEL || "local-model";
    this.temperature = config.temperature ?? 0.3; // Lower temperature for consistency
    this.timeout = config.timeout || 300000; // 5 minutes default
  }

  async generate(prompt: string): Promise<string> {
    try {
      return await this.callAPI(prompt);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Local LLM provider error (${this.baseURL}): ${message}. ` +
        `Ensure llama.cpp/LM Studio is running and accessible.`
      );
    }
  }

  isAvailable(): boolean {
    // Local provider is available if endpoint is configured
    return true;
  }

  getName(): string {
    return `LocalLLM (${this.baseURL})`;
  }

  private async callAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: 8000,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in API response");
      }

      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Create provider from environment or config
 */
export function createLocalLLMProvider(config?: LocalLLMConfig): LocalLLMProvider {
  return new LocalLLMProvider(config);
}
