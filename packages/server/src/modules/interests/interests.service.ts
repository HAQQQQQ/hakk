import { Injectable, NotFoundException } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "@hakk/types";
import { OpenAIResponse, OpenAIResponseStatus } from "../openai/openai.types";
import { generateInterestsPrompt } from "@/prompts/generate-interests.prompt";
import { InterestAnalysis, interestAnalysisSchema } from "./interests.types";
import { InterestsRepository } from "./interests.repository";
import { ProfileService } from "../profile/profile.service";

/*

can you create a graph from these music genres const musicGenres = [
    "Pop",
    "Synthpop",
    "Electropop",
    "Hip-Hop / Rap",
    "Trap",
    "Boom Bap",
    "Drill",
    "Rock",
    "Alternative Rock",
    "Hard Rock",
    "Punk Rock",
    "Indie Rock",
    "R&B / Soul",
    "Neo-Soul",
    "Funk",
    "Electronic / EDM",
    "House",
    "Techno",
    "Trance",
    "Dubstep",
    "Drum & Bass",
    "Latin",
    "Reggaeton",
    "Latin Trap",
    "Salsa",
    "Bachata",
    "K-Pop",
    "K-Hip-Hop",
    "Country",
    "Country Pop",
    "Bluegrass",
    "Jazz",
    "Smooth Jazz",
    "Bebop",
    "Lo-fi / Chillhop",
    "Classical",
    "Baroque",
    "Romantic Era",
    "Opera",
    "Indie / Alternative",
    "Indie Pop",
    "Bedroom Pop",
    "Reggae",
    "Dancehall",
    "Ska",
    "Metal",
    "Heavy Metal",
    "Death Metal",
    "Black Metal",
    "Afrobeats",
    "Amapiano",
    "Gospel",
    "Christian Contemporary",
    "Blues",
    "Delta Blues",
    "Folk / Americana",
    "Singer-Songwriter",
    "World Music",
    "Soundtracks / Scores",
    "Experimental / Ambient"
]; that basically shows the relationship between different music genres. Where the edge is a number and the higher the number, 
the more "closer they are musically". I'll let you decide what the number scale will be and how you determine "closeness". 

*/

export const musicGenres: string[] = [
	"Pop",
	"Synthpop",
	"Electropop",
	"Hip-Hop / Rap",
	"Trap",
	"Boom Bap",
	"Drill",
	"Rock",
	"Alternative Rock",
	"Hard Rock",
	"Punk Rock",
	"Indie Rock",
	"R&B / Soul",
	"Neo-Soul",
	"Funk",
	"Electronic / EDM",
	"House",
	"Techno",
	"Trance",
	"Dubstep",
	"Drum & Bass",
	"Latin",
	"Reggaeton",
	"Latin Trap",
	"Salsa",
	"Bachata",
	"K-Pop",
	"K-Hip-Hop",
	"Country",
	"Country Pop",
	"Bluegrass",
	"Jazz",
	"Smooth Jazz",
	"Bebop",
	"Lo-fi / Chillhop",
	"Classical",
	"Baroque",
	"Romantic Era",
	"Opera",
	"Indie / Alternative",
	"Indie Pop",
	"Bedroom Pop",
	"Reggae",
	"Dancehall",
	"Ska",
	"Metal",
	"Heavy Metal",
	"Death Metal",
	"Black Metal",
	"Afrobeats",
	"Amapiano",
	"Gospel",
	"Christian Contemporary",
	"Blues",
	"Delta Blues",
	"Folk / Americana",
	"Singer-Songwriter",
	"World Music",
	"Soundtracks / Scores",
	"Experimental / Ambient",
];

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
		const openAiPrompt = generateInterestsPrompt(preference);

		// Call OpenAI with validation
		return this.openAiService.executeValidatedPrompt<InterestAnalysis>(
			openAiPrompt,
			interestAnalysisSchema,
		);
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
