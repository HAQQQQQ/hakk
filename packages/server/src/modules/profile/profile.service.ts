import { Injectable } from "@nestjs/common";
import { generatePrompt } from "../openai/openai.constants";
import { OpenAIService } from "../openai/openai.service";

@Injectable()
export class ProfileService {
	constructor(private readonly openAIService: OpenAIService) {}

	async getProfile(): Promise<string> {
		const examplePrompt = `I like tennis, football, but my favorite sport is basketball.
                I really enjoy listening to old bands like Pink Floyd, Led Zepplin, and Metallica,
                My favorite movies are Superbad, Napolean Dynamite, and basically anything that makes me 
                laugh really hard.`;

		return this.openAIService.completePrompt(generatePrompt(examplePrompt));
	}

	getSetayesh(): string {
		return "Kevin Setayesh";
	}
}
