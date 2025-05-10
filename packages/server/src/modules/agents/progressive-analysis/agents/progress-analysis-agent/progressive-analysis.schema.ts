import { z } from "zod";

/**
 * Factory function to create a progressive analysis schema
 * based on a target agent's schema
 *
 * @param targetSchema The schema of the target agent's results
 * @returns A Zod schema for progressive analysis results
 */
export function createProgressiveAnalysisSchema<T extends z.ZodTypeAny>(targetSchema: T) {
	return z.object({
		bestResult: targetSchema,
		iterationResults: z.array(targetSchema),
		improvementAnalysis: z
			.array(z.string())
			.describe("Analysis of improvement between iterations"),
		finalIteration: z.number().describe("Final iteration that produced the best result"),
	});
}

/**
 * Base progressive analysis schema using any type
 * This provides a default schema when a specific target schema isn't available
 */
export const baseProgressiveAnalysisSchema = createProgressiveAnalysisSchema(z.any());

/**
 * Type for the base progressive analysis result, derived from the schema
 */
export type ProgressiveAnalysisResult = z.infer<typeof baseProgressiveAnalysisSchema>;

/**
 * Utility type for creating a type-specific progressive analysis result
 * This allows for proper typing with specific agent schemas
 */
export type TypedProgressiveAnalysisResult<T> = {
	bestResult: T;
	iterationResults: T[];
	improvementAnalysis: string[];
	finalIteration: number;
};
/**
 * Example of using the factory with a specific schema:
 *
 * // If you have a schema like:
 * // const myAgentSchema = z.object({ ... });
 *
 * // You can create a specific schema:
 * // const myProgressiveAnalysisSchema = createProgressiveAnalysisSchema(myAgentSchema);
 * // type MyProgressiveAnalysisResult = z.infer<typeof myProgressiveAnalysisSchema>;
 */

// // progressive-analysis/progressive-analysis.schema.ts
// import { z } from "zod";

// // Schema for progressive analysis requests
// export const progressiveAnalysisParamsSchema = z.object({
// 	basePrompt: z.string().describe("The trading journal entry to analyze"),
// 	previousResponses: z
// 		.array(z.string())
// 		.nullable()
// 		.default([])
// 		.describe("Previous AI responses to build upon"),
// 	iterationNumber: z.number().int().positive().default(1).describe("Current iteration number"),
// 	analysisGoal: z
// 		.string()
// 		.default("trading psychology analysis")
// 		.describe("The goal of this analysis"),
// 	targetAgentName: z
// 		.string()
// 		.nullable()
// 		.describe("The name of the agent to execute progressively"),
// });

// // Type for progressive analysis params
// export type ProgressiveAnalysisParams = z.infer<typeof progressiveAnalysisParamsSchema>;

// // Schema for progressive execution metadata
// export const progressiveExecutionMetaSchema = z.object({
// 	iteration: z.number().int().positive().describe("The iteration number of this analysis"),
// 	insightLevel: z
// 		.enum(["initial", "expanded", "detailed", "refined"])
// 		.describe("The depth level of this analysis"),
// 	processingTimeMs: z
// 		.number()
// 		.nullable()
// 		.describe("Time taken to generate this iteration in milliseconds"),
// 	improvementFocus: z
// 		.array(z.string())
// 		.describe("Areas focused on for improvement in this iteration"),
// 	confidenceScore: z.number().describe("Confidence level in the analysis (0-1)"),
// 	nextIterationSuggestions: z
// 		.string()
// 		.nullable()
// 		.describe("Suggestions for further improvement in next iterations"),
// });

// // Type for progressive execution metadata
// export type ProgressiveExecutionMeta = z.infer<typeof progressiveExecutionMetaSchema>;

// // Summary schema
// export const progressiveSummarySchema = z.object({
// 	keyInsights: z.array(z.string()).describe("Key insights from this analysis iteration"),
// 	improvements: z
// 		.array(z.string())
// 		.describe("Improvements made in this iteration compared to previous ones"),
// 	recommendedNextSteps: z.string().describe("Recommended next steps based on this analysis"),
// });

// // Generic schema for any progressive analysis result
// // This allows us to wrap any other agent's response schema
// export const progressiveAnalysisResultSchema = z.object({
// 	// Metadata about the progressive execution
// 	meta: progressiveExecutionMetaSchema.describe(
// 		"Metadata about this progressive analysis iteration",
// 	),

// 	// The original agent's response - using unknown type to accept any structure
// 	originalResponse: z.unknown().describe("The response from the target agent"),

// 	// Optional analysis summary for easier consumption
// 	summary: progressiveSummarySchema.describe("Summary of the analysis for easier consumption"),
// });

// // Type for progressive analysis results
// export type ProgressiveAnalysisResult<T = unknown> = Omit<
// 	z.infer<typeof progressiveAnalysisResultSchema>,
// 	"originalResponse"
// > & {
// 	originalResponse: T;
// };

// // Function to create a typed schema for a specific agent's response type
// export function createTypedProgressiveSchema<T>(responseSchema: z.ZodSchema<T>) {
// 	return progressiveAnalysisResultSchema.extend({
// 		originalResponse: responseSchema,
// 	});
// }

// // // For backwards compatibility with the original interface
// // export {
// //     progressiveAnalysisParamsSchema as iterativePromptParamsSchema,
// //     progressiveAnalysisResultSchema as iterativePromptResultSchema,
// //     ProgressiveAnalysisParams as IterativePromptParams,
// //     ProgressiveAnalysisResult as IterativePromptResult
// // };
