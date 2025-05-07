import { Injectable } from "@nestjs/common";
import { JournalReflectionAgent } from "./journal-reflection.agent";

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
	[AgentName.SENTIMENT_ANALYSIS]: JournalReflectionAgent;
	// Add other agents here as needed
};

// Check at compile time that all enum keys are in AgentMap
// type CheckAllEnumKeysAreMapped<T extends Record<AgentName, any>> = {
//     [K in AgentName]: K extends keyof T ? T[K] : never;
// };

// // This will cause a type error if AgentMap doesn't have all AgentName keys
// type EnsureAllAgentsMapped = CheckAllEnumKeysAreMapped<AgentMap>;

@Injectable()
export class AgentFactory {
	private agents = new Map<AgentName, AgentMap[AgentName]>();

	constructor(
		private readonly journalReflectionAgent: JournalReflectionAgent,
		private readonly sentimentAnalysisAgent: JournalReflectionAgent,
		// Add other agents here as they are created
		// private readonly sentimentAnalysisAgent: SentimentAnalysisAgent,
	) {
		this.agents.set(AgentName.JOURNAL_REFLECTION, journalReflectionAgent);
		this.agents.set(AgentName.SENTIMENT_ANALYSIS, sentimentAnalysisAgent);
	}

	/**
	 * Retrieves an agent by its name.
	 * The factory infers the type of the agent based on the AgentName.
	 * @param agentName - The name of the agent to retrieve.
	 * @returns The requested agent instance with the correct type.
	 */
	get<K extends keyof AgentMap>(agentName: K): AgentMap[K] {
		const agent = this.agents.get(agentName);
		if (!agent) {
			throw new Error(`Agent with name "${agentName}" not found.`);
		}
		return agent as AgentMap[K];
	}
}
