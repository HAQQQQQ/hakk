// src/modules/openai/openai.config.ts
import { EnvConfig } from "@/config/env.config";
import { OpenAIConfigSettings } from "./openai.types";

/**
 * Centralized configuration for OpenAI service
 */
export const OpenAIConfig = {
	MAX_RETRIES: EnvConfig.openaiMaxRetries,
	RETRY_DELAY: EnvConfig.openaiRetryDelay,
	SYSTEM_MESSAGE: EnvConfig.openaiSystemMessage,
	MODEL: EnvConfig.gptModel,
	TEMPERATURE: EnvConfig.openaiTemperature,

	// API key with validation (keeps function approach)
	getApiKey: () => {
		const apiKey = EnvConfig.openaiApiKey;
		if (!apiKey) {
			throw new Error("OPENAI_API_KEY is not defined in environment variables.");
		}
		return apiKey;
	},

	// Complete configuration object
	getDefaults(): OpenAIConfigSettings {
		return {
			model: this.MODEL,
			temperature: this.TEMPERATURE,
			maxRetries: this.MAX_RETRIES,
			retryDelay: this.RETRY_DELAY,
			systemMessage: this.SYSTEM_MESSAGE,
		};
	},
};
