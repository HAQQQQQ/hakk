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

export const tradingPsychologyPlanSchema = z.object({
	psychologicalProfile: z
		.object({
			strengths: z
				.array(z.string())
				.describe("List of psychological strengths identified in the trader"),
			vulnerabilities: z
				.array(z.string())
				.describe("List of psychological vulnerabilities identified in the trader"),
			emotionalTriggers: z
				.array(z.string())
				.describe("List of emotional triggers affecting trading performance"),
			cognitivePatterns: z
				.array(z.string())
				.describe("List of cognitive patterns observed in the trader"),
		})
		.describe("Psychological profile of the trader"),
	plan: z
		.object({
			dailyPractices: z
				.array(z.string())
				.describe("Daily practices to improve trading psychology"),
			tradingSessionStructure: z
				.string()
				.describe("Recommended structure for trading sessions"),
			triggerManagementStrategies: z
				.array(
					z.object({
						trigger: z.string().describe("Specific emotional or cognitive trigger"),
						interventionStrategy: z
							.string()
							.describe("Strategy to manage the identified trigger"),
					}),
				)
				.describe("Strategies to manage emotional or cognitive triggers"),
			metrics: z.array(z.string()).describe("Metrics to track psychological progress"),
			reviewProcess: z.string().describe("Process for reviewing psychological progress"),
			progressMilestones: z
				.array(z.string())
				.describe("Milestones to measure psychological development"),
		})
		.describe("Detailed trading psychology improvement plan"),
	implementation: z
		.object({
			immediate: z.array(z.string()).describe("Immediate actions to implement the plan"),
			shortTerm: z.array(z.string()).describe("Short-term actions to implement the plan"),
			longTerm: z.array(z.string()).describe("Long-term actions to implement the plan"),
		})
		.describe("Implementation steps for the trading psychology plan"),
});

export const psychologyPlanResponseSchema = z.object({
	psychologyPlan: tradingPsychologyPlanSchema.describe(
		"Detailed trading psychology improvement plan",
	),
	recommendations: recommendationsSchema.describe(
		"Actionable recommendations for improving trading psychology",
	),
});

export type PsychologyPlanResponse = z.infer<typeof psychologyPlanResponseSchema>;
