import { Module } from "@nestjs/common";
import { OpenAIModule } from "../openai/openai.module";
import { AgentFactory } from "./agent.factory";

// Services
import { TradingSentimentService } from "./trading-sentiment/services/trading-sentiment.service";

// Agents
import { ContextualSentimentAgent } from "./trading-sentiment/agents/contextual-sentiment-agent/contextual-sentiment-analysis.agent";
import { PerformanceAnalysisAgent } from "./trading-sentiment/agents/performance-analysis-agent/performance-analysis.agent";
import { PsychologicalAnalysisAgent } from "./trading-sentiment/agents/psychological-issues-agent/psychological-issues-analysis.agent";
import { PsychologyPlanAgent } from "./trading-sentiment/agents/psychology-plan-agent/psychology-plan-analysis.agent";
import { SentimentAnalysisAgent } from "./trading-sentiment/agents/sentiment-analysis-agent/trading-sentiment-analysis.agent";
import { TrendAnalysisAgent } from "./trading-sentiment/agents/trend-analysis-agent/trend-analysis.agent";

// Prompt Builders
import { ContextualSentimentPromptBuilder } from "./trading-sentiment/agents/contextual-sentiment-agent/contextual-sentiment-prompt.builder";
import { PerformanceAnalysisPromptBuilder } from "./trading-sentiment/agents/performance-analysis-agent/performance-analysis-prompt.builder";
import { PsychologicalAnalysisPromptBuilder } from "./trading-sentiment/agents/psychological-issues-agent/psychological-analysis-prompt.builder";
import { PsychologyPlanPromptBuilder } from "./trading-sentiment/agents/psychology-plan-agent/psychology-plan-prompt.builder";
import { SentimentAnalysisPromptBuilder } from "./trading-sentiment/agents/sentiment-analysis-agent/sentiment-analysis-prompt.builder";
import { TrendAnalysisPromptBuilder } from "./trading-sentiment/agents/trend-analysis-agent/trend-analysis-prompt.builder";

/**
 * Module that provides all LLM agents
 */
@Module({
	imports: [OpenAIModule],
	providers: [
		// Main agent and service
		TradingSentimentService,
		AgentFactory,

		// All agents
		ContextualSentimentAgent,
		PerformanceAnalysisAgent,
		PsychologicalAnalysisAgent,
		PsychologyPlanAgent,
		SentimentAnalysisAgent,
		TrendAnalysisAgent,

		// All prompt builders
		ContextualSentimentPromptBuilder,
		PerformanceAnalysisPromptBuilder,
		PsychologicalAnalysisPromptBuilder,
		PsychologyPlanPromptBuilder,
		SentimentAnalysisPromptBuilder,
		TrendAnalysisPromptBuilder,
	],
	exports: [AgentFactory, TradingSentimentService],
})
export class AgentsModule {}
