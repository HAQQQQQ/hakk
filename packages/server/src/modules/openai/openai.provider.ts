import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import { AppConfig } from "@/config/app.config";
import { Config } from "@/config/config";

/**
 * NestJS providers for OpenAI-related services
 */
export const OpenAIProviders: Provider[] = [
    {
        provide: "OPENAI_CLIENT",
        useFactory: () => {
            const apiKey = Config.openaiApiKey;
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
            return Config.gptModel;
        },
    },
    {
        provide: "OPENAI_TEMPERATURE",
        useFactory: () => {
            // Temperature is already validated in AppConfig
            return Config.openaiTemperature;
        },
    },
];
