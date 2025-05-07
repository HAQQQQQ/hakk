import { z } from "zod";
import { Injectable } from "@nestjs/common";
import { BaseAgent } from "./base.agent";
import { OpenAIClientService } from "../openai/openai-client.service";
import { AgentName } from "./agent.factory";

// Export a type for easy use with z.infer
export type JournalReflection = z.infer<typeof JournalReflectionAgent.schema>;

@Injectable()
export class JournalReflectionAgent extends BaseAgent<JournalReflection> {
	// Define schema once as a static property
	static readonly schema = z.object({
		date: z.string().describe("ISO date of entry"),
		mood: z.enum(["happy", "sad", "anxious", "excited", "neutral"]).describe("Detected mood"),
		highlights: z.array(z.string()).nonempty().describe("Top positive moments"),
		challenges: z.array(z.string()).describe("Difficult moments or struggles"),
		actionItems: z.array(z.string()).describe("Suggested next steps or habits"),
	});

	constructor(openaiClient: OpenAIClientService) {
		super(
			openaiClient,
			AgentName.JOURNAL_REFLECTION,
			"You are a journaling coach. Analyze a journal entry and extract structured reflection data",
			"reflect_journal",
			"You are a helpful assistant that responds by calling the provided function.",
		);
	}

	getSchema() {
		return JournalReflectionAgent.schema;
	}

	async execute(prompt: string): Promise<JournalReflection> {
		return this._execute(prompt);
	}
}
