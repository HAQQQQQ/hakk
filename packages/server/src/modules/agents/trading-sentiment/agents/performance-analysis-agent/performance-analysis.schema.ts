import { z } from "zod";

export const performanceCorrelationSchema = z.object({
	sentimentPerformanceAlignment: z
		.number()
		// .min(-1)
		// .max(1)
		.describe("Correlation between sentiment and performance (-1 to 1)"),
	overconfidenceIndicator: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Measure of overconfidence (0-1)"),
	underconfidenceIndicator: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Measure of underconfidence (0-1)"),
	sentimentAccuracy: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Accuracy of sentiment predictions (0-1)"),
	psychologicalObservations: z.array(z.string()).describe("List of psychological observations"),
	recommendedAdjustments: z
		.array(z.string())
		.describe("List of recommended psychological adjustments"),
});

export const marketTradeSchema = z.object({
	// Market sentiment analysis
	marketPerception: z
		.object({
			overallMarketSentiment: z
				.enum(["very bearish", "bearish", "neutral", "bullish", "very bullish"])
				.describe("Trader's perception of overall market conditions"),
			specificMarkets: z
				.array(
					z.object({
						market: z.string().describe("Specific market or sector mentioned"),
						sentiment: z
							.enum(["very bearish", "bearish", "neutral", "bullish", "very bullish"])
							.describe("Sentiment toward this specific market"),
						confidence: z
							.number()
							// .min(0)
							// .max(1)
							.describe("Confidence in this market sentiment assessment (0-1)"),
					}),
				)
				// .optional()
				.nullable()
				.describe("Sentiment toward specific markets or sectors mentioned"),
		})
		.describe("Analysis of the trader's market sentiment and outlook"),

	// Trade-specific sentiment
	tradeAnalysis: z
		.array(
			z.object({
				// ticker: z.string().optional().describe("Stock or asset ticker symbol"),
				ticker: z.string().nullable().describe("Stock or asset ticker symbol"),
				tradeDirection: z
					.enum([
						"long",
						"short",
						"considering long",
						"considering short",
						"exited long",
						"exited short",
						"unclear",
					])
					.describe("Direction of trade or potential trade"),
				sentiment: z
					.enum(["very negative", "negative", "neutral", "positive", "very positive"])
					.describe("Sentiment toward this specific trade"),
				confidence: z
					.number()
					// .min(0)
					// .max(1)
					.describe("Trader's confidence level in this trade or analysis (0-1)"),
				rationale: z
					.array(z.string())
					.describe("Trading rationales mentioned for this trade"),
				emotionalDrivers: z
					.array(z.string())
					.nullable()
					// .optional()
					.describe("Emotional factors potentially driving this trade decision"),
			}),
		)
		.describe("Analysis of sentiment toward specific trades or potential trades"),
});

export const performanceAnalysisResponseSchema = z.object({
	...marketTradeSchema.shape,
	...performanceCorrelationSchema.shape,
});

export type PerformanceAnalysisResponse = z.infer<typeof performanceAnalysisResponseSchema>;
