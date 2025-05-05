// src/modules/openai/openai.providers.ts
import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import { OpenAIConfig } from "./openai.config";
import { OpenAITokens } from "./openai.types";

/**
 * NestJS providers for OpenAI-related services
 */
export const OpenAIProviders: Provider[] = [
	// OpenAI client instance with API key validation
	{
		provide: OpenAITokens.CLIENT,
		useFactory: () => new OpenAI({ apiKey: OpenAIConfig.getApiKey() }),
	},

	// Default OpenAI model from environment config
	{
		provide: OpenAITokens.MODEL,
		useFactory: () => OpenAIConfig.MODEL,
	},

	// Temperature for controlling response randomness
	{
		provide: OpenAITokens.TEMPERATURE,
		useFactory: () => OpenAIConfig.TEMPERATURE,
	},

	// Retry configuration for API calls
	{
		provide: OpenAITokens.RETRY_CONFIG,
		useValue: {
			maxRetries: OpenAIConfig.MAX_RETRIES,
			retryDelay: OpenAIConfig.RETRY_DELAY,
		},
	},

	// Default system message for AI prompts
	{
		provide: OpenAITokens.SYSTEM_MESSAGE,
		useValue: OpenAIConfig.SYSTEM_MESSAGE,
	},

	// Complete default configuration (alternative simplified approach)
	{
		provide: OpenAITokens.DEFAULT_CONFIG,
		useFactory: () => OpenAIConfig.getDefaults(),
	},
];
