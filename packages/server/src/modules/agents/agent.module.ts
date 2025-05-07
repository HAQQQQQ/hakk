import { Module } from "@nestjs/common";
import { OpenAIModule } from "../openai/openai.module";
import { JournalReflectionAgent } from "./journal-reflection.agent";
import { AgentFactory } from "./agent.factory";
import { TradingSentimentAnalysisAgent } from "./trading-sentimental-analysis.agent";

/**
 * Module that provides all LLM agents
 */
@Module({
	imports: [OpenAIModule],
	providers: [
		JournalReflectionAgent,
		TradingSentimentAnalysisAgent,
		AgentFactory,
		// Add more agents here as needed
	],
	exports: [
		AgentFactory,
		// Export any agents that should be accessible outside this module
	],
})
export class AgentsModule {}
