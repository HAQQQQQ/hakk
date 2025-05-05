import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { TranscriptionRepository } from "./transcription.repository";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly openAiService: OpenAIService,
		private readonly interestsRepository: TranscriptionRepository,
	) {}
}
