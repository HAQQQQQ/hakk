// src/openai/openai.module.ts
import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service.js";
import { OpenAIController } from "./openai.controller.js";
import { OpenAIProviders } from "./openai.provider.js";

@Module({
	providers: [OpenAIService, ...OpenAIProviders],
	controllers: [OpenAIController],
	exports: [OpenAIService],
})
export class OpenAIModule {}
