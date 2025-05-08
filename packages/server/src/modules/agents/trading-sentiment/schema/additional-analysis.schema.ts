import { z } from "zod";

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
