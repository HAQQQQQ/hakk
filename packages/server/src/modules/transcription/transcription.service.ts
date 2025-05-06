import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { TranscriptionRepository } from "./transcription.repository";
import {
	JournalReflection,
	JournalReflectionSchema,
	JournalReflectionTool,
} from "./transcription-tool.schema";
import { OpenAIResponseStatus } from "../openai/openai.types";
import { generateTranscriptionPrompt } from "./generate-transcription.prompt";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly openAiService: OpenAIService,
		private readonly transcriptionRepository: TranscriptionRepository,
	) {}

	async transcribeLogs(logs: string): Promise<JournalReflection> {
		if (!logs) {
			logs = await this.transcriptionRepository.fetchLogs("123");
		}

		const prompt = generateTranscriptionPrompt(logs);

		const result = await this.openAiService.executeToolCall<JournalReflection>(
			prompt,
			JournalReflectionTool,
			JournalReflectionSchema,
		);

		if (result.status !== OpenAIResponseStatus.SUCCESS) {
			throw new InternalServerErrorException(`AI reflection failed: ${result.error}`);
		}

		return result.data;
	}
}
