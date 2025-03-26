import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import { EnvConfig } from "@/config/env.config";
import { OpenAIConfig } from "./openai.config";
import { OpenAITokens } from "./openai.types";

/**
 * NestJS providers for OpenAI-related services
 */
export const OpenAIProviders: Provider[] = [
	{
		provide: OpenAITokens.CLIENT,
		useFactory: () => {
			const apiKey = EnvConfig.openaiApiKey;
			if (!apiKey) {
				throw new Error("OPENAI_API_KEY is not defined in environment variables.");
			}
			return new OpenAI({ apiKey });
		},
	},
	{
		provide: OpenAITokens.MODEL,
		useFactory: () => {
			// Model is already validated and converted in AppConfig
			return EnvConfig.gptModel;
		},
	},
	{
		provide: OpenAITokens.TEMPERATURE,
		useFactory: () => {
			// Temperature is already validated in AppConfig
			return EnvConfig.openaiTemperature;
		},
	},
	{
		provide: OpenAITokens.RETRY_CONFIG,
		useValue: {
			maxRetries: OpenAIConfig.DEFAULT_MAX_RETRIES,
			retryDelay: OpenAIConfig.DEFAULT_RETRY_DELAY,
		},
	},
];
