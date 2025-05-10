import { z } from "zod";

export const coreSentimentSchema = z.object({
	// Basic sentiment analysis
	text: z.string().describe("The analyzed trading journal entry"),
	overallSentiment: z
		.enum(["very negative", "negative", "neutral", "positive", "very positive"])
		.describe("Overall emotional state of the trader"),
	sentimentScore: z
		.number()
		// .min(-1)
		// .max(1)
		.describe("Numerical sentiment score from -1 (negative) to 1 (positive)"),

	// Trading-specific emotional analysis
	tradingEmotions: z
		.array(
			z.object({
				emotion: z
					.string()
					.describe(
						"Detected trading-related emotion (e.g., FOMO, greed, fear, confidence, regret)",
					),
				// intensity: z.number().min(0).max(1).describe("Intensity of this emotion (0-1)"),
				intensity: z.number().describe("Intensity of this emotion (0-1)"),
				evidence: z.string().describe("Text evidence supporting this emotion detection"),
				tradingImpact: z
					.enum(["very negative", "negative", "neutral", "positive", "very positive"])
					.describe("How this emotion likely impacts trading decisions"),
			}),
		)
		.describe("Trading-specific emotions detected with intensity and potential impact"),

	// Mental state analysis
	mentalState: z
		.object({
			// focus: z.number().min(0).max(1).describe("Level of mental focus demonstrated (0-1)"),
			// stress: z.number().min(0).max(1).describe("Detected stress level (0-1)"),
			// fatigue: z.number().min(0).max(1).describe("Signs of mental fatigue (0-1)"),
			// overconfidence: z.number().min(0).max(1).describe("Signs of overconfidence (0-1)"),
			focus: z.number().describe("Level of mental focus demonstrated (0-1)"),
			stress: z.number().describe("Detected stress level (0-1)"),
			fatigue: z.number().describe("Signs of mental fatigue (0-1)"),
			overconfidence: z.number().describe("Signs of overconfidence (0-1)"),
			mentalStateImpact: z
				.string()
				.describe("How current mental state may impact trading performance"),
		})
		.describe("Analysis of trader's mental and psychological state"),
});

export type CoreSentimentAnalysis = z.infer<typeof coreSentimentSchema>;
