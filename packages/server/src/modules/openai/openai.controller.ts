// src/modules/openai/openai-config.controller.ts
import { Body, Controller, Get, Post } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { OpenAIConfigResponseDto, UpdateOpenAIConfigRequestDto } from "./openai.dto";

@Controller("openai/config")
export class OpenAIConfigController {
	constructor(private readonly openaiService: OpenAIService) {}

	/**
	 * Get the current OpenAI configuration
	 */
	@Get()
	async getConfiguration(): Promise<OpenAIConfigResponseDto> {
		return this.openaiService.getConfiguration();
	}

	/**
	 * Update the OpenAI configuration
	 */
	@Post()
	async updateConfiguration(
		@Body() config: UpdateOpenAIConfigRequestDto,
	): Promise<OpenAIConfigResponseDto> {
		return this.openaiService.updateConfiguration(config);
	}

	/**
	 * Reset the OpenAI configuration to defaults
	 */
	@Post("reset")
	async resetConfiguration(): Promise<OpenAIConfigResponseDto> {
		return this.openaiService.resetConfiguration();
	}
}
