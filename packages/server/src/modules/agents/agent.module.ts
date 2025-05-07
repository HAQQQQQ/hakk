import { Module } from "@nestjs/common";
import { OpenAIModule } from "../openai/openai.module";
import { AgentFactory } from "./agent.factory";
import { TradingSentimentAnalysisAgent } from "./trading-sentiment/trading-sentimental-analysis.agent";
import { TradingPromptBuilderService } from "./trading-sentiment/services/prompt-builder.service";

/**
 * Module that provides all LLM agents
 */
@Module({
	imports: [OpenAIModule],
	providers: [
		TradingSentimentAnalysisAgent,
		TradingPromptBuilderService,
		AgentFactory,
		// Add more agents here as needed
	],
	exports: [
		AgentFactory,
		// Export any agents that should be accessible outside this module
	],
})
export class AgentsModule {}
