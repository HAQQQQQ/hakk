// src/openai/openai.module.ts
import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { OpenAIController } from "./openai.controller";
import { OpenAIProvider } from "./openai.provider";

@Module({
	providers: [OpenAIService, OpenAIProvider],
	controllers: [OpenAIController],
	exports: [OpenAIService],
})
export class OpenAIModule {}
