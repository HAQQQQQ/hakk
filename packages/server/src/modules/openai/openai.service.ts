// src/openai/openai.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { OpenAI } from "openai";
import { OpenAIModel } from "./openai-models.enum";

@Injectable()
export class OpenAIService {
    constructor(
        @Inject("OPENAI_CLIENT") private readonly openai: OpenAI,
        @Inject("OPENAI_MODEL") private readonly model: OpenAIModel,
        @Inject("OPENAI_TEMPERATURE") private readonly temperature: number
    ) { }

    async completePrompt(prompt: string): Promise<string> {

        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            temperature: this.temperature,
        });

        const messageContent = response.choices[0].message.content;
        // Return an empty string if the content is null; you can also throw an error if desired.
        return messageContent ?? "";
    }
}
