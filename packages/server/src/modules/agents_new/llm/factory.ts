/**
 * Factory for creating language model providers
 */
import { LanguageModelInterface, LLMConfig } from "./interfaces";
import { OpenAIModelProvider } from "./openai-provider";
import { AnthropicModelProvider } from "./anthropic-provider";

/**
 * Factory function to create the appropriate provider
 */
export function createLanguageModel(config: LLMConfig): LanguageModelInterface {
	switch (config.provider) {
		case "openai":
			return new OpenAIModelProvider(config);
		case "anthropic":
			return new AnthropicModelProvider(config);
		default:
			throw new Error(`Unsupported provider: ${config.provider}`);
	}
}

// Re-export the interfaces and providers
export * from "./interfaces";
export * from "./openai-provider";
export * from "./anthropic-provider";
