import { z } from "zod";

export const recommendationsSchema = z.object({
	// Actionable recommendations
	tradingRecommendations: z
		.array(
			z.object({
				recommendation: z
					.string()
					.describe("Actionable recommendation for improving trading psychology"),
				priority: z
					.enum(["low", "medium", "high", "critical"])
					.describe("Priority of this recommendation"),
				rationale: z.string().describe("Psychological rationale for this recommendation"),
				implementationSteps: z
					.array(z.string())
					// .optional()
					.nullable()
					.describe("Suggested steps for implementing this recommendation"),
			}),
		)
		.describe("Actionable recommendations based on trading sentiment analysis"),

	// Executive summary
	tradingSummary: z
		.string()
		.describe("Brief, human-readable summary of trading psychology analysis"),
});
