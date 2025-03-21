// src/openai/openai.module.ts
import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { OpenAIController } from "./openai.controller";
import { OpenAIProviders } from "./openai.provider";

@Module({
    providers: [OpenAIService, ...OpenAIProviders],
    controllers: [OpenAIController],
    exports: [OpenAIService],
})
export class OpenAIModule { }
