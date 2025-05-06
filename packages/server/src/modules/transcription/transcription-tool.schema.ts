import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { ToolSchema, ToolSchemaParams } from "@/modules/openai/openai.types";

/**
 * 1) Define the shape you want back from the LLM
 */
export const JournalReflectionSchema = z.object({
	date: z.string().describe("ISO date of entry"),
	mood: z.enum(["happy", "sad", "anxious", "excited", "neutral"]).describe("Detected mood"),
	highlights: z.array(z.string()).nonempty().describe("Top positive moments"),
	challenges: z.array(z.string()).describe("Difficult moments or struggles"),
	actionItems: z.array(z.string()).describe("Suggested next steps or habits"),
});

export type JournalReflection = z.infer<typeof JournalReflectionSchema>;

/**
 * 2) Turn that into an OpenAI tool definition
 */
export const JournalReflectionTool: ToolSchema = {
	name: "reflect_journal",
	description: "Analyze a journal entry and extract structured reflection data",
	parameters: zodToJsonSchema(JournalReflectionSchema) as ToolSchemaParams,
};
