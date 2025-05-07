import { Injectable } from "@nestjs/common";
import { TradingSentimentAnalysisAgent } from "./trading-sentiment/trading-sentimental-analysis.agent";

export enum AgentName {
	TRADING_SENTIMENT_ANALYSIS = "trading-sentiment-analysis",
	// Add more agents here as needed
}

/**
 * Factory for getting LLM agents
 * Provides a clean interface for external services to get agent instances
 */
type AgentMap = {
	[AgentName.TRADING_SENTIMENT_ANALYSIS]: TradingSentimentAnalysisAgent;
	// Add other agents here as needed
};

@Injectable()
export class AgentFactory {
	private agents = new Map<AgentName, any>();

	constructor(
		private readonly tradingSentimentAnalysisAgent: TradingSentimentAnalysisAgent,
		// Add other agents here as they are created
	) {
		this.agents.set(AgentName.TRADING_SENTIMENT_ANALYSIS, tradingSentimentAnalysisAgent);
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
