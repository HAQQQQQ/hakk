import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { TranscriptionRepository } from "./transcription.repository";
import { generateTranscriptionPrompt } from "./generate-transcription.prompt";
import { JournalReflection, JournalReflectionAgent } from "../agents/journal-reflection.agent";
import { AgentFactory, AgentName } from "../agents/agent.factory";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly transcriptionRepository: TranscriptionRepository,
		private readonly agentFactory: AgentFactory,
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
			// const journalReflectionAgent = this.agentFactory.getJournalReflectionAgent();
			const journalAgent = this.agentFactory.get(AgentName.JOURNAL_REFLECTION);
			const reflection = await journalAgent.execute(prompt);

			// Optionally save the reflection result
			// await this.saveReflectionResult(reflection);

			return reflection;
		} catch (error) {
			console.error("Error analyzing journal logs:", error);
			throw new InternalServerErrorException("Failed to analyze journal logs");
		}
	}
}
