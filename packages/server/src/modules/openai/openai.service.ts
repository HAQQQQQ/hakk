// src/openai/openai.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { OpenAI } from "openai";
import { generatePrompt } from "@modules/openai/openai.constants";
import { SupabaseService } from "@modules/supabase/supabase.service";
import { Preference } from "@/types/common.types";

@Injectable()
export class OpenAIService {
	constructor(
		@Inject("OPENAI_CLIENT") private readonly openai: OpenAI,
		private readonly supabaseService: SupabaseService,
	) {}

	async completePrompt(): Promise<string> {
		const preference: Preference[] = await this.supabaseService.getPreferences([
			"user_2uYsgKXRGtcV8tfXeU7nhOANwmN",
		]);

		const response = await this.openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: generatePrompt(preference[0]) }],
			temperature: 0,
		});

		const messageContent = response.choices[0].message.content;
		// Return an empty string if the content is null; you can also throw an error if desired.
		return messageContent ?? "";
	}
}
