import { Module } from "@nestjs/common";
import { OpenAIModule } from "../openai/openai.module";
import { JournalReflectionAgent } from "./journal-reflection.agent";

/**
 * Module that provides all LLM agents
 */
@Module({
	imports: [OpenAIModule],
	providers: [
		JournalReflectionAgent,
		// Add more agents here as needed
	],
	exports: [
		JournalReflectionAgent,
		// Export any agents that should be accessible outside this module
	],
})
export class AgentsModule {}
