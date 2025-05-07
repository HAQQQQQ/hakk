import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { TranscriptionRepository } from "./transcription.repository";
import { generateTranscriptionPrompt } from "./generate-transcription.prompt";
import { JournalReflection, JournalReflectionAgent } from "../agents/journal-reflection.agent";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly transcriptionRepository: TranscriptionRepository,
		private readonly journalReflectionAgent: JournalReflectionAgent,
	) {}

	async transcribeLogs(logs: string): Promise<JournalReflection> {
		// If no logs provided, fetch them from the repository
		if (!logs) {
			logs = await this.transcriptionRepository.fetchLogs("123");
		}

		// Generate the prompt for the reflection
		const prompt = generateTranscriptionPrompt(logs);

		try {
			// Use the JournalReflectionAgent to analyze the logs
			const reflection = await this.journalReflectionAgent.execute(prompt);

			// Optionally save the reflection result
			// await this.saveReflectionResult(reflection);

			return reflection;
		} catch (error) {
			console.error("Error analyzing journal logs:", error);
			throw new InternalServerErrorException("Failed to analyze journal logs");
		}
	}
}
