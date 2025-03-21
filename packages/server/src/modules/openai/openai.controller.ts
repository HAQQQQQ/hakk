// src/openai/openai.controller.ts
import { Controller, Post } from "@nestjs/common";
import { OpenAIService } from "./openai.service";

@Controller("openai")
export class OpenAIController {
	constructor(private readonly openaiService: OpenAIService) {}

	@Post("complete")
	async completePrompt(): Promise<{ completion: string }> {
		const completion = await this.openaiService.completePrompt();
		return {
			completion };
	}
}
