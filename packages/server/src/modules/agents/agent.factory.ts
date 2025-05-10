import { Injectable } from "@nestjs/common";
import { SentimentAnalysisAgent } from "./trading-sentiment/agents/sentiment-analysis-agent/trading-sentiment-analysis.agent";
import { ContextualSentimentAgent } from "./trading-sentiment/agents/contextual-sentiment-agent/contextual-sentiment-analysis.agent";
import { TrendAnalysisAgent } from "./trading-sentiment/agents/trend-analysis-agent/trend-analysis.agent";
import { PerformanceAnalysisAgent } from "./trading-sentiment/agents/performance-analysis-agent/performance-analysis.agent";
import { PsychologicalAnalysisAgent } from "./trading-sentiment/agents/psychological-issues-agent/psychological-issues-analysis.agent";
import { PsychologyPlanAgent } from "./trading-sentiment/agents/psychology-plan-agent/psychology-plan-analysis.agent";
import { AgentName } from "./agent-name.enum";

// Updated AgentTypeMap with new AgentName enums
type AgentTypeMap = {
	[AgentName.SENTIMENT_ANALYSIS]: SentimentAnalysisAgent;
	[AgentName.CONTEXTUAL_SENTIMENT_ANALYSIS]: ContextualSentimentAgent;
	[AgentName.TREND_ANALYSIS]: TrendAnalysisAgent;
	[AgentName.PERFORMANCE_ANALYSIS]: PerformanceAnalysisAgent;
	[AgentName.PSYCHOLOGICAL_ANALYSIS]: PsychologicalAnalysisAgent;
	[AgentName.PSYCHOLOGY_PLAN]: PsychologyPlanAgent;
};

@Injectable()
export class AgentFactory {
	private readonly agents: AgentTypeMap;

	constructor(
		sentimentAnalysisAgent: SentimentAnalysisAgent,
		contextualSentimentAgent: ContextualSentimentAgent,
		trendAnalysisAgent: TrendAnalysisAgent,
		performanceAnalysisAgent: PerformanceAnalysisAgent,
		psychologicalAnalysisAgent: PsychologicalAnalysisAgent,
		psychologyPlanAgent: PsychologyPlanAgent,
	) {
		// Updated agents object with new AgentName enums
		this.agents = {
			[AgentName.SENTIMENT_ANALYSIS]: sentimentAnalysisAgent,
			[AgentName.CONTEXTUAL_SENTIMENT_ANALYSIS]: contextualSentimentAgent,
			[AgentName.TREND_ANALYSIS]: trendAnalysisAgent,
			[AgentName.PERFORMANCE_ANALYSIS]: performanceAnalysisAgent,
			[AgentName.PSYCHOLOGICAL_ANALYSIS]: psychologicalAnalysisAgent,
			[AgentName.PSYCHOLOGY_PLAN]: psychologyPlanAgent,
		};
	}

	/**
	 * Retrieves an agent by its name.
	 * The factory infers the type of the agent based on the AgentName.
	 * @param agentName - The name of the agent to retrieve.
	 * @returns The requested agent instance with the correct type.
	 */
	getAgent<K extends AgentName>(agentName: K): AgentTypeMap[K] {
		const agent = this.agents[agentName];
		if (!agent) {
			throw new Error(`Agent ${agentName} not found`);
		}
		return agent;
	}
}
