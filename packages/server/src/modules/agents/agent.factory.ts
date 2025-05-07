import { Injectable } from "@nestjs/common";
import { JournalReflectionAgent, JournalReflection } from "./journal-reflection.agent";
import { BaseAgent, LLMToolAgent } from "./base.agent";

export enum AgentName {
	JOURNAL_REFLECTION = "journal-reflection",
	SENTIMENT_ANALYSIS = "sentiment-analysis",
	// Add more agents here as needed
}

/**
 * Factory for getting LLM agents
 * Provides a clean interface for external services to get agent instances
 */
type AgentMap = {
	[AgentName.JOURNAL_REFLECTION]: JournalReflectionAgent;
	// Add other agents here as needed
};

@Injectable()
export class AgentFactory {
	myMap: Map<keyof AgentMap, AgentMap[keyof AgentMap]> = new Map();

	constructor(
		private readonly journalReflectionAgent: JournalReflectionAgent,
		// Add other agents here as they are created
		// private readonly sentimentAnalysisAgent: SentimentAnalysisAgent,
	) {
		this.myMap.set(AgentName.JOURNAL_REFLECTION, journalReflectionAgent);
	}

	/**
	 * Retrieves an agent by its name.
	 * The factory infers the type of the agent based on the AgentName.
	 * @param agentName - The name of the agent to retrieve.
	 * @returns The requested agent instance with the correct type.
	 */
	get<K extends keyof AgentMap>(agentName: K): AgentMap[K] {
		const agent = this.myMap.get(agentName);
		if (!agent) {
			throw new Error(`Agent with name "${agentName}" not found.`);
		}
		return agent as AgentMap[K];
	}

	// getJournalReflectionAgent(): JournalReflectionAgent {
	// 	return this.journalReflectionAgent;
	// }
}
