// src/openai/openai.module.ts
import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { OpenAIController } from "./openai.controller";
import { OpenAIProvider } from "./openai.provider";
import { SupabaseService } from "@modules/supabase/supabase.service";

@Module({
	providers: [OpenAIService, OpenAIProvider, SupabaseService],
	controllers: [OpenAIController],
	exports: [OpenAIService],
})
export class OpenAIModule {}
