// src/openai/openai.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenAIController {
	constructor(private readonly openaiService: OpenAIService) {}

	@Post('complete')
	async completePrompt(@Body() body: { prompt: string }): Promise<{ completion: string }> {
		const completion = await this.openaiService.completePrompt(body.prompt);
		return { completion };
	}
}
