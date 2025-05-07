// src/modules/agents/agent.config.ts
import { JournalReflectionSchema } from "../transcription/transcription-tool.schema";

// src/modules/agents/agent-name.enum.ts
export enum AgentName {
	JOURNAL_REFLECTION = "journal-reflection",
	// Add more as you go
}

export const agentDefinitions = [
	{
		name: AgentName.JOURNAL_REFLECTION,
		description: "Reflects on journal logs",
		systemMessage: "You are a journaling coach. Reflect on the user's logs.",
		schema: JournalReflectionSchema,
		toolName: "reflect_journal",
		toolDescription: "Analyze a journal entry and extract structured reflection data",
	},
	// Add more here
];
