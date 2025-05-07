import { Module } from "@nestjs/common";
import { OpenAIModule } from "../openai/openai.module";
import { JournalReflectionAgent } from "./journal-reflection.agent";
import { AgentFactory } from "./agent.factory";
import { SentimentAnalysisAgent } from "./sentimental-analysis.agent";

/**
 * Module that provides all LLM agents
 */
@Module({
	imports: [OpenAIModule],
	providers: [
		JournalReflectionAgent,
		SentimentAnalysisAgent,
		AgentFactory,
		// Add more agents here as needed
	],
	exports: [
		AgentFactory,
		// Export any agents that should be accessible outside this module
	],
})
export class AgentsModule {}
