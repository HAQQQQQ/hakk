// progressive-analysis/iterative-prompt.schema.ts
import { z } from "zod";

// Schema for iterative analysis requests
export const iterativePromptParamsSchema = z.object({
	basePrompt: z.string().describe("The trading journal entry to analyze"),
	previousResponses: z
		.array(z.string())
		.optional()
		.default([])
		.describe("Previous AI responses to build upon"),
	iterationNumber: z.number().int().positive().default(1).describe("Current iteration number"),
	analysisGoal: z
		.string()
		.default("trading psychology analysis")
		.describe("The goal of this analysis"),
});

// Type for iterative analysis params
export type IterativePromptParams = z.infer<typeof iterativePromptParamsSchema>;

// Schema for iterative analysis results
export const iterativePromptResultSchema = z.object({
	analysis: z.string().describe("The detailed analysis for this iteration"),
	iteration: z.number().int().positive().describe("The iteration number of this analysis"),
	insightLevel: z
		.enum(["initial", "expanded", "detailed", "refined"])
		.describe("The depth level of this analysis"),
	keyInsights: z.array(z.string()).describe("Key psychological insights identified"),
	focusAreas: z
		.array(z.string())
		.describe("Areas that should be focused on in future iterations"),
	confidence: z.number().min(0).max(1).describe("Confidence level in the analysis (0-1)"),
	recommendedNextSteps: z.string().describe("Recommended next steps or future analysis areas"),
});

// Type for iterative analysis results
export type IterativePromptResult = z.infer<typeof iterativePromptResultSchema>;
