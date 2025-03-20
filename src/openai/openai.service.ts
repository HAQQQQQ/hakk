// src/openai/openai.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { OpenAI } from "openai"; // Adjust if needed

@Injectable()
export class OpenAIService {
	constructor(@Inject("OPENAI_CLIENT") private readonly openai: OpenAI) {}

	async completePrompt(prompt: string): Promise<string> {
		const response = await this.openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
			temperature: 0,
		});

		const messageContent = response.choices[0].message.content;
		// Return an empty string if the content is null; you can also throw an error if desired.
		return messageContent ?? "";
	}
}
