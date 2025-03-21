// src/openai/openai.provider.ts
import { Provider } from "@nestjs/common";
import OpenAI from "openai";

export const OpenAIProvider: Provider = {
	provide: "OPENAI_CLIENT",
	useFactory: () => {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			throw new Error("OPENAI_API_KEY is not defined in environment variables.");
		}
		return new OpenAI({ apiKey });
	},
};
