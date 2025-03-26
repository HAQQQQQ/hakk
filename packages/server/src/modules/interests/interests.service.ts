import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "@hakk/types";
import { OpenAIResponse, OpenAIResponseStatus } from "../openai/openai.types";
import { generateInterestsPrompt } from "@/prompts/generate-interests.prompt";
import { InterestAnalysis, interestAnalysisSchema } from "./interests.types";
import { InterestsRepository } from "./interests.repository";

@Injectable()
export class InterestsService {
	constructor(
		private readonly openAiService: OpenAIService,
		private readonly interestsRepository: InterestsRepository,
		// private readonly supabaseService: SupabaseService,
	) {}

	async addInterest(userId: string, preference: Preference) {
		// Generate interest analysis
		const response = await this.generateInterestAnalysis(preference);
		// Check if the response was successful
		if (response.status === OpenAIResponseStatus.SUCCESS) {
			// Save the successful analysis to Supabase
			// No need to check response.data as it's guaranteed to exist
			return this.interestsRepository.addInterest(userId, [response.data]);
		} else {
			// Handle the error case with a default fallback
			console.error(
				`Failed to generate interest analysis for user ${userId}:`,
				response.error || "Unknown error",
			);

			// Create a default interest analysis
			const defaultAnalysis: InterestAnalysis = {
				music: { genres: [], mood: "Not available" },
				movies: { genres: [], time_periods: [], cultural_context: [] },
				hobbies: {
					lifestyle: "Not available",
					personality: "Not available",
					related_activities: [],
				},
			};

			return this.interestsRepository.addInterest(userId, [defaultAnalysis]);
		}
	}

	private async generateInterestAnalysis(
		preference: Preference,
	): Promise<OpenAIResponse<InterestAnalysis>> {
		// Generate the prompt
		const openAiPrompt = generateInterestsPrompt(preference);

		// Call OpenAI with validation
		return this.openAiService.executeValidatedPrompt<InterestAnalysis>(
			openAiPrompt,
			interestAnalysisSchema,
		);
	}
}
