import { Injectable } from "@nestjs/common";
import { generatePrompt } from "../openai/openai.constants";
import { OpenAIService } from "../openai/openai.service";

@Injectable()
export class ProfileService {
	constructor(private readonly openAIService: OpenAIService) {}

	getProfile(): string {
		return "Kevin Setayesh";
	}

	getSetayesh(): string {
		return "Kevin Setayesh";
	}
}
