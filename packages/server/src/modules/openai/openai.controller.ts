// src/modules/openai/openai-config.controller.ts
import { Body, Controller, Get, Post } from "@nestjs/common";
import { OpenAIConfigResponseDto, UpdateOpenAIConfigRequestDto } from "./openai.dto";
import { OpenAIConfigService } from "./openai-config.service";

@Controller("openai/config")
export class OpenAIConfigController {
	constructor(private readonly configService: OpenAIConfigService) {}

	/**
	 * Get the current OpenAI configuration
	 */
	@Get()
	async getConfiguration(): Promise<OpenAIConfigResponseDto> {
		return this.configService.getConfig();
	}

	/**
	 * Update the OpenAI configuration
	 */
	@Post()
	async updateConfiguration(
		@Body() config: UpdateOpenAIConfigRequestDto,
	): Promise<OpenAIConfigResponseDto> {
		return this.configService.updateConfig(config);
	}

	/**
	 * Reset the OpenAI configuration to defaults
	 */
	@Post("reset")
	async resetConfiguration(): Promise<OpenAIConfigResponseDto> {
		return this.configService.resetConfig();
	}
}
