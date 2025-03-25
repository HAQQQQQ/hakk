import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "@hakk/types";
import { SupabaseService } from "../supabase/supabase.service";
import { generatePrompt } from "../openai/openai.constants";

@Injectable()
export class InterestsService {
	constructor(
		private readonly openaiservive: OpenAIService,
		private readonly supabaseService: SupabaseService,
	) {}

	async addInterest(userId: string, preference: Preference) {
		const openAiPrompt = generatePrompt(preference);
		const openAiGetInterestsResponse = await this.openaiservive.completePrompt(openAiPrompt);

		// use AsObject since we haven't specified a type yet
		const interestAsObject = JSON.parse(openAiGetInterestsResponse);

		// TODO: Consider that this is for only one interest object, batch processing is for later
		return this.supabaseService.addInterest(userId, [interestAsObject]);
	}
}
