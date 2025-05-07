import { Injectable } from "@nestjs/common";
import { AgentName } from "./agent-name.enum";
import { JournalReflectionAgent, JournalReflection } from "./journal-reflection.agent";
import { LLMToolAgent } from "./base.agent";

/**
 * Factory for getting LLM agents
 * Provides a clean interface for external services to get agent instances
 */
@Injectable()
export class AgentFactory {
	constructor(
		private readonly journalReflectionAgent: JournalReflectionAgent,
		// Add other agents here as they are created
		// private readonly sentimentAnalysisAgent: SentimentAnalysisAgent,
	) {}

	getJournalReflectionAgent(): JournalReflectionAgent {
		return this.journalReflectionAgent;
	}
}
