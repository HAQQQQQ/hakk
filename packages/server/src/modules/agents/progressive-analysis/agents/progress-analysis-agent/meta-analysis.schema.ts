import { z } from "zod";

/**
 * Schema for meta-analysis feedback
 * This is used internally by the ProgressiveAnalysisAgent to generate improvement guidelines
 */
export const metaAnalysisSchema = z.object({
	strengths: z.array(
		z.object({
			aspect: z.string(),
			description: z.string(),
		}),
	),

	weaknesses: z.array(
		z.object({
			aspect: z.string(),
			description: z.string(),
			improvementSuggestion: z.string(),
		}),
	),

	improvementGuidance: z
		.string()
		.describe("Comprehensive guidance on how to improve the analysis in the next iteration"),

	focusAreas: z.array(z.string()).describe("Specific areas to focus on in the next iteration"),

	qualityScore: z
		.number()
		.min(1)
		.max(10)
		.describe("Overall quality score of the current analysis (1-10)"),
});

export type MetaAnalysis = z.infer<typeof metaAnalysisSchema>;
