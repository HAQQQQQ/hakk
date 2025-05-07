// src/modules/transcription/transcription.service.ts
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { TranscriptionRepository } from "./transcription.repository";
import { JournalReflection } from "./transcription-tool.schema";
import { AgentRegistryService } from "../agents/agent-registry.service";
import { generateTranscriptionPrompt } from "./generate-transcription.prompt";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly agentRegistry: AgentRegistryService,
		private readonly transcriptionRepository: TranscriptionRepository,
	) {}

	async transcribeLogs(logs: string): Promise<JournalReflection> {
		if (!logs) {
			logs = await this.transcriptionRepository.fetchLogs("123");
		}

		const prompt = generateTranscriptionPrompt(logs);

		try {
			const agent = this.agentRegistry.getJournalReflectionAgent();
			return agent.run(prompt);
		} catch (err) {
			throw new InternalServerErrorException(
				`AI reflection failed: ${(err as Error).message}`,
			);
		}
	}
}
