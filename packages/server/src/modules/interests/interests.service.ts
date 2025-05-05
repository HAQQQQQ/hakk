import { Injectable, NotFoundException } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "@hakk/types";
import { OpenAIResponse, OpenAIResponseStatus } from "../openai/openai.types";
import { generateInterestsPrompt } from "@/prompts/generate-interests.prompt";
import { InterestAnalysis, interestAnalysisSchema } from "./interests.types";
import { InterestsRepository } from "./interests.repository";
import { ProfileService } from "../profile/services/profile.service";

@Injectable()
export class InterestsService {
	constructor(
		private readonly openAiService: OpenAIService,
		private readonly profileService: ProfileService,
		private readonly interestsRepository: InterestsRepository,
	) {}

	// This will be called by the controller
	async addInterestWithUserCheck(userId: string, preference: Preference) {
		// First, verify user exists
		const userExists = await this.profileService.validateUser(userId);
		if (!userExists) {
			throw new NotFoundException(`User with userId ${userId} not found`);
		}
		// Call core method
		return this.addInterest(userId, preference);
	}

	// Core method without user check (for internal/service calls)
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

			return this.interestsRepository.addInterest(userId, [this.getDefaultAnalysis()]);
		}
	}

	private async generateInterestAnalysis(
		preference: Preference,
	): Promise<OpenAIResponse<InterestAnalysis>> {
		// Generate the prompt
		// const openAiPrompt = generateInterestsPrompt(preference);

		// // Call OpenAI with validation
		// return this.openAiService.executeValidatedPrompt<InterestAnalysis>(
		// 	openAiPrompt,
		// 	interestAnalysisSchema,
		// );
		return {} as OpenAIResponse<InterestAnalysis>;
	}

	// New function: Retrieve interests for a given user by leveraging the repository function
	async getInterestsForUser(userId: string) {
		// First, verify user exists
		const userExists = await this.profileService.validateUser(userId);
		if (!userExists) {
			throw new NotFoundException(`User with userId ${userId} not found`);
		}

		// Retrieve the interests from the repository
		return this.interestsRepository.getInterestsByUserId(userId);
	}

	private getDefaultAnalysis(): InterestAnalysis {
		return {
			music: { genres: [], mood: "Not available" },
			movies: { genres: [], time_periods: [], cultural_context: [] },
			hobbies: {
				lifestyle: "Not available",
				personality: "Not available",
				related_activities: [],
			},
		};
	}
}
