import { z } from "zod";

export const tradingPsychologicalIssueSchema = z.object({
	issue: z.string().describe("Description of the psychological issue"),
	confidence: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Confidence level in identifying the issue (0-1)"),
	evidence: z
		.array(z.string())
		.describe("List of evidence supporting the identification of the issue"),
	impact: z
		.enum(["low", "medium", "high", "critical"])
		.describe("Impact level of the issue on trading performance"),
	recommendedIntervention: z.string().describe("Recommended intervention to address the issue"),
	resources: z
		.array(z.string())
		.nullable()
		// .optional()
		.describe("Optional list of resources to help address the issue"),
});

export const psychologicalIssuesAnalysisSchema = z.object({
	issues: z
		.array(tradingPsychologicalIssueSchema)
		.describe("List of identified psychological issues"),
	prioritizedAction: z
		.string()
		.describe("The highest priority action to address psychological issues"),
	overallRiskAssessment: z
		.string()
		.describe("Overall risk assessment based on psychological issues"),
});

export const additionalAnalysisSchema = z.object({
	// Temporal analysis
	temporalSentiment: z
		.object({
			pastTrades: z
				.enum([
					"very negative",
					"negative",
					"neutral",
					"positive",
					"very positive",
					"not discussed",
				])
				.describe("Sentiment toward past trading results"),
			currentMarket: z
				.enum([
					"very negative",
					"negative",
					"neutral",
					"positive",
					"very positive",
					"not discussed",
				])
				.describe("Sentiment toward current market conditions"),
			futurePerspective: z
				.enum([
					"very negative",
					"negative",
					"neutral",
					"positive",
					"very positive",
					"not discussed",
				])
				.describe("Outlook on future trading performance"),
			comparison: z
				.string()
				.describe("Brief analysis of sentiment change from past to future"),
		})
		.describe("Temporal analysis of trading sentiment across timeframes"),

	// Key trading phrases
	keyPhrases: z
		.array(
			z.object({
				phrase: z.string().describe("Important trading-related phrase from the journal"),
				significanceLevel: z
					.number()
					// .min(0)
					// .max(1)
					.describe("Significance of this phrase to trading psychology (0-1)"),
				implication: z.string().describe("Psychological implication of this phrase"),
			}),
		)
		.describe("Key phrases with significance to trading psychology"),

	// Trading journal insights
	journalInsights: z
		.object({
			selfAwareness: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Level of trading self-awareness demonstrated (0-1)"),
			lessonsDerived: z
				.array(z.string())
				.describe("Trading lessons the trader appears to be learning"),
			blindSpots: z
				.array(z.string())
				.describe("Psychological blind spots apparent in journal"),
			developmentAreas: z
				.array(z.string())
				.describe("Suggested areas for psychological development"),
			strengths: z.array(z.string()).describe("Psychological trading strengths demonstrated"),
		})
		.describe("Insights about trading psychology from journal content"),
});

export const psychologicalIssuesResponseSchema = z.object({
	additionalAnalysis: additionalAnalysisSchema.describe(
		"Additional analysis of trading psychology",
	),
	psychologicalIssues: psychologicalIssuesAnalysisSchema.describe(
		"Analysis of psychological issues",
	),
});
