// src/openai/openai.provider.ts
import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import { OpenAIModel } from "./openai-models.enum";

export const OpenAIProviders: Provider[] = [
	{
		provide: "OPENAI_CLIENT",
		useFactory: () => {
			const apiKey = process.env.OPENAI_API_KEY;
			if (!apiKey) {
				throw new Error("OPENAI_API_KEY is not defined in environment variables.");
			}
			return new OpenAI({ apiKey });
		},
	},
	{
		provide: "OPENAI_MODEL",
		useFactory: () => {
			const envModel = process.env.GPT_MODEL;
			// Check if the env value is a valid enum value
			if (envModel && Object.values(OpenAIModel).includes(envModel as OpenAIModel)) {
				return envModel;
			}

			return OpenAIModel.GPT_3_5_TURBO;
		},
	},
	{
		provide: "OPENAI_TEMPERATURE",
		useFactory: () => {
			const envTemp = process.env.OPENAI_TEMPERATURE;

			if (envTemp) {
				const temp = parseFloat(envTemp);
				// Ensure temperature is within OpenAI's valid range (0-2)
				if (!isNaN(temp) && temp >= 0 && temp <= 2) {
					return temp;
				}
			}

			return 0; // Default temperature
		},
	},
];
