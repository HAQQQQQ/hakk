// src/openai/openai.module.ts
import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { OpenAIProviders } from "./openai.provider";
import { OpenAIConfigController } from "./openai.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { OpenAIConfigRepository } from "./openai.repository";
import { OpenAIConfigMapper } from "./openai.mapper";

@Module({
	imports: [SupabaseModule],
	providers: [...OpenAIProviders, OpenAIService, OpenAIConfigRepository, OpenAIConfigMapper],
	controllers: [OpenAIConfigController],
	exports: [OpenAIService],
})
export class OpenAIModule {}
