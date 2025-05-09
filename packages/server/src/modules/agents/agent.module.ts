import { Module } from "@nestjs/common";
import { OpenAIModule } from "../openai/openai.module";
import { AgentFactory } from "./agent.factory";
import { TradingSentimentAnalysisAgent } from "./trading-sentiment/base-trading-sentiment-agent";
import { TradingPromptBuilderService } from "./trading-sentiment/services/prompt-builder.service";
import {
	BasePromptBuilder,
	ContextualPromptBuilder,
	IssuesPromptBuilder,
	PsychologyPlanPromptBuilder,
	ResultsAnalysisPromptBuilder,
	TrendAnalysisPromptBuilder,
} from "./trading-sentiment/prompts";

/**
 * Module that provides all LLM agents
 */
@Module({
	imports: [OpenAIModule],
	providers: [
		// Main agent and service
		TradingSentimentAnalysisAgent,
		TradingPromptBuilderService,
		AgentFactory,

		// All prompt builders
		BasePromptBuilder,
		ContextualPromptBuilder,
		TrendAnalysisPromptBuilder,
		ResultsAnalysisPromptBuilder,
		IssuesPromptBuilder,
		PsychologyPlanPromptBuilder,
	],
	exports: [
		AgentFactory,
		// Export any agents that should be accessible outside this module
	],
})
export class AgentsModule {}
