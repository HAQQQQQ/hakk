import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { OpenAITokens } from "./openai.types";
import type { OpenAIConfigSettings } from "./openai.types";
import { OpenAIConfigRepository } from "./openai.repository";
import { OpenAIConfigMapper } from "./openai.mapper";
import { OpenAIConfigResponseDto, UpdateOpenAIConfigRequestDto } from "./openai.dto";

@Injectable()
export class OpenAIConfigService implements OnModuleInit {
	private config: OpenAIConfigSettings;

	constructor(
		private readonly repo: OpenAIConfigRepository,
		private readonly mapper: OpenAIConfigMapper,
		@Inject(OpenAITokens.DEFAULT_CONFIG) defaultConfig: OpenAIConfigSettings,
	) {
		this.config = { ...defaultConfig };
	}

	async onModuleInit() {
		const stored = await this.repo.getConfig();
		if (stored) this.config = stored;
	}

	getConfig(): OpenAIConfigResponseDto {
		return this.mapper.toResponseDto(this.config);
	}

	async updateConfig(dto: UpdateOpenAIConfigRequestDto): Promise<OpenAIConfigResponseDto> {
		const entity = this.mapper.toEntityForUpdate(dto, this.config);
		const saved = await this.repo.saveConfig(entity);
		this.config = saved;
		return this.mapper.toResponseDto(saved);
	}

	async resetConfig(): Promise<OpenAIConfigResponseDto> {
		const defaults = await this.repo.resetToDefaults();
		this.config = defaults;
		return this.mapper.toResponseDto(defaults);
	}

	/** Expose raw settings for client calls */
	get settings(): OpenAIConfigSettings {
		return this.config;
	}
}
