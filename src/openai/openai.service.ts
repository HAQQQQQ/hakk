// src/openai/openai.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { OpenAI } from "openai"; // Adjust if needed

@Injectable()
export class OpenAIService {
	constructor(@Inject("OPENAI_CLIENT") private readonly openai: OpenAI) {}

	async completePrompt(prompt: string): Promise<string> {
		const response = (await this.openai.completions.create({
			model: "text-davinci-003",
			prompt,
			max_tokens: 100,
		})) as { choices: { text: string }[] };

		return response.choices[0].text.trim();
	}
}
