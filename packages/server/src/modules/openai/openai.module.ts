// src/openai/openai.module.ts
import { Module } from "@nestjs/common";
import { OpenAIClientService } from "./openai-client.service";
import { OpenAIConfigController } from "./openai.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { OpenAITokens } from "./openai.types";
import OpenAI from "openai";
import { OpenAIConfig } from "./openai.config";
import { OpenAIConfigRepository } from "./openai.repository";
import { OpenAIConfigMapper } from "./openai.mapper";
import { OpenAIConfigService } from "./openai-config.service";

@Module({
	imports: [SupabaseModule],
	providers: [
		// Raw OpenAI client
		{
			provide: OpenAITokens.CLIENT,
			useFactory: () => new OpenAI({ apiKey: OpenAIConfig.getApiKey() }),
		},
		// Default configuration object
		{
			provide: OpenAITokens.DEFAULT_CONFIG,
			useFactory: () => OpenAIConfig.getDefaults(),
		},
		// Repository, mapper, and services
		OpenAIConfigRepository,
		OpenAIConfigMapper,
		OpenAIConfigService,
		OpenAIClientService,
	],
	controllers: [OpenAIConfigController],
	exports: [OpenAIClientService],
})
export class OpenAIModule {}
