import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import { EnvConfig } from "@/config/env.config";
import { OpenAIConfig } from "./openai.config";

/**
 * NestJS providers for OpenAI-related services
 */
export const OpenAIProviders: Provider[] = [
	{
		provide: "OPENAI_CLIENT",
		useFactory: () => {
			const apiKey = EnvConfig.openaiApiKey;
			if (!apiKey) {
				throw new Error("OPENAI_API_KEY is not defined in environment variables.");
			}
			return new OpenAI({ apiKey });
		},
	},
	{
		provide: "OPENAI_MODEL",
		useFactory: () => {
			// Model is already validated and converted in AppConfig
			return EnvConfig.gptModel;
		},
	},
	{
		provide: "OPENAI_TEMPERATURE",
		useFactory: () => {
			// Temperature is already validated in AppConfig
			return EnvConfig.openaiTemperature;
		},
	},
	{
		provide: "OPENAI_RETRY_CONFIG",
		useValue: {
			maxRetries: OpenAIConfig.DEFAULT_MAX_RETRIES,
			retryDelay: OpenAIConfig.DEFAULT_RETRY_DELAY,
		},
	},
];
