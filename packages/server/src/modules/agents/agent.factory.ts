import { Injectable } from "@nestjs/common";
import { BaseAgent } from "./base.agent";
import { TradingSentimentAnalysisAgent } from "./trading-sentiment/base-trading-sentiment-agent";

// export enum AgentName {
//     TRADING_SENTIMENT_ANALYSIS = "trading-sentiment-analysis",
//     // Add more agents here as needed
// }
// agent-name.enum.ts
export enum AgentName {
	JOURNAL_REFLECTION = "journal-reflection",
	SENTIMENT_ANALYSIS = "sentiment-analysis",
	TRADING_SENTIMENT_ANALYSIS = "trading-sentiment-analysis",
	TRADING_SENTIMENT_CONTEXTUAL = "trading-sentiment-contextual",
	TRADING_SENTIMENT_TREND = "trading-sentiment-trend",
	TRADING_SENTIMENT_PERFORMANCE = "trading-sentiment-performance",
	TRADING_PSYCHOLOGICAL_ISSUES = "trading-psychological-issues",
	TRADING_PSYCHOLOGY_PLAN = "trading-psychology-plan",
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
	private agents = new Map<AgentName, BaseAgent>();

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

	/**
	 * Alternative method that returns the complete agent with all its methods
	 * Useful when you need access to the agent's full interface
	 */
	getAgent<K extends keyof AgentMap>(agentName: K): AgentMap[K] {
		return this.get(agentName);
	}

	/**
	 * Check if an agent exists in the factory
	 * @param agentName - The name of the agent to check
	 * @returns True if the agent exists, false otherwise
	 */
	hasAgent(agentName: AgentName): boolean {
		return this.agents.has(agentName);
	}

	/**
	 * Get all available agent names
	 * @returns Array of all available agent names
	 */
	getAvailableAgents(): AgentName[] {
		return Array.from(this.agents.keys());
	}
}
